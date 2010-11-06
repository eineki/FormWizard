/*
---
description: FormWizard Class, WizardException.

license: MIT-style

authors: [Eineki]

requires:
- more/1.2.4: Lang
- core/1.2.4: '*'

provides: [FormWizard]

DEMO: http://www.liberosoftware.net/FormWizard/Examples/

...
*/

/* Version: 0.2.2 2010-09-11 */

function WizardException(message){
	this.name='WizardException';
	this.message= message;
}

	MooTools.lang.set('it-IT', 'Wizard', {
		forwardButtonTitle: 'Avanti',
		backwardButtonTitle: 'Indietro',
		resetButtonTitle: 'Annulla',
		submitButtonTitle: 'Salva'
	} );

	MooTools.lang.set('en-US', 'Wizard', {
		forwardButtonTitle: 'Next',
		backwardButtonTitle: 'Previous',
		resetButtonTitle: 'Reset',
		submitButtonTitle: 'Submit'
	} );


var FormWizard = new Class({
	"Implements": Options,
	"version": "0.3",

	"options": {
		"formClass": "wizard",
		"pageClass": "wizard-page",
		"defaultButtonClass": "wizard-button",
		"controlAreaClass": "wizard-control-area",
		"currentPageClassPrefix": "wizard-current",
		"firstPage": 1,
		"createControlArea": false, // true if you need to add a bottom bar with controls
		"wizardControls": ["reset", "backward", "forward"],
		"showControlCaptions": true,
		"controls": {
			"submit": {"hook": "wizard-control-submit",
				     "title": MooTools.lang.get("Wizard", "submitButtonTitle")},
			"forward": {"hook":"wizard-control-forward",
				      "title": MooTools.lang.get("Wizard", "forwardButtonTitle")},
			"backward":{"hook":"wizard-control-backward",
					  "title": MooTools.lang.get("Wizard", "backwardButtonTitle")},
			"reset":{"hook":"wizard-control-reset",
				   "title": MooTools.lang.get("Wizard","resetButtonTitle")}
		},
		"enterLastPage": null,
		"pageFlip": null
	},
	"domElement": null,
	"pages": [],
	"currentPageIndex": 0, // The page being show
	"lastPageIndex": 0,
	"controls": {
		"submit":  {"action": $empty },
		"forward": {"action": function(){ return this.changePage(this.currentPageIndex+1);}},
		"backward":{"action": function(){return this.changePage(this.currentPageIndex-1);}},
		"reset":   {"action": function() { return this.resetForm();}}
	},

	initialize: function (form, options, pageFlow){
		var button, buttonElement;
		if (!pageFlow)pageFlow={};
		
		form = document.id(form);
		if (!form) throw(new WizardException("Wizard container not found"));
		this.domElement = form;

		this.setOptions(options);
		this.options.firstPage = Math.max(this.options.firstPage-1,0) ; 	
		this.currentPageIndex = this.options.firstPage; 
  	
		form.addClass(this.options.formClass);
		form.addClass(this.options.currentPageClassPrefix + "-" + this.currentPageIndex);
    		form.addClass(this.options.currentPageClassPrefix + "-first");

		form.getElements("." + this.options.pageClass).each(
		function(item) {
			var page = {domElement: item};
			page.onEnterPage = pageFlow[item.id]?$pick(pageFlow[item.id].onEnter, $lambda(true)):$lambda(true);
			page.onExitPage =  pageFlow[item.id]?$pick(pageFlow[item.id].onExit, $lambda(true)): $lambda(true);
			this.pages.push(page);
		},this);
		
		this.lastPageIndex = this.pages.length-1;

		for (var i=1, limit=this.lastPageIndex;i<=limit;i++) {
			this.pages[i].domElement.setStyle("display","none");
		}
		
		if (this.options.enterLastPage !== null) {
			this.pages[this.lastPageIndex]["onEnterPage"] = this.options.enterLastPage;
		}

		if (this.options.createControlArea) {
			var controlArea = new Element("div",{"class":this.options.controlAreaClass});
			for (i=0, limit=this.options.wizardControls.length; i< limit; i++) {
				button = this.options.controls[this.options.wizardControls[i]];
				(new Element("button",{"html": this.options.showControlCaptions?button.title:"",
					                   "class":[button.hook,$pick(button.buttonClass, this.options.defaultButtonClass)].join(" "),
							   "events": {"click": this.controls[this.options.wizardControls[i]].action.bind(this)}
									  }
							)).inject(controlArea);
			}
			form.adopt(controlArea);
		} else {
			for (i=0, limit=this.options.wizardControls.length; i< limit; i++) {
				button = this.options.controls[this.options.wizardControls[i]];
				buttonElements = form.getElements("."+button.hook); 
 				/* there should be at least one */
				if (buttonElements.length) {
					buttonElements.addEvent("click", this.controls[this.options.wizardControls[i]].action.bind(this));
				} else {
					throw(new WizardException("Button not found: " + button.hook));
				}
			}
		}
	}, // eo initialize
	changePage: function (targetPageIndex) {
		var leavePermission, enterPermission;
		// check for existence of the target page
		if (!this.pages[targetPageIndex]) return false;
		leavePermission = this.pages[this.currentPageIndex].onExitPage(targetPageIndex, this.currentPageIndex);
		if (leavePermission === false) return false;
		// from now on we have, eventually, to cycle to find the right page to enter (if forwarded)
		if (leavePermission !== true) {
			targetPageIndex=leavePermission;
		}
		enterPermission = this.pages[targetPageIndex].onEnterPage(targetPageIndex, this.currentPageIndex);
		while (enterPermission !== true && enterPermission !== false) {
			// the onEnter function returned a page index, we have to forward to the new page
			targetPageIndex=enterPermission;
			enterPermission = this.pages[targetPageIndex].onEnterPage(targetPageIndex, this.currentPageIndex);
		}
 
		if (enterPermission) {
			this.swap(this.pages[this.currentPageIndex].domElement, this.pages[targetPageIndex].domElement);
			this.changeCurrentPageClass(targetPageIndex, this.currentPageIndex);
			this.currentPageIndex = targetPageIndex;
		}
		return false; // stop the event propagation
	},
	changeCurrentPageClass: function(newPageIndex, currentPageIndex) {
		var currentPageClass = this.options.currentPageClassPrefix;
		if (currentPageIndex == newPageIndex) return;
 		if (this.pages[newPageIndex]) {
			this.domElement.set("class", 
			    this.domElement.get("class").replace(
			        currentPageClass + "-" + currentPageIndex, 
			        currentPageClass + "-" + newPageIndex
			    )   
			);
			if (currentPageIndex == this.lastPageIndex
			    || newPageIndex == this.lastPageIndex ) {
				this.domElement.toggleClass(currentPageClass + "-last");
			}
			if (currentPageIndex == this.options.firstPage
			    || newPageIndex == this.options.firstPage) {
				this.domElement.toggleClass(currentPageClass + "-first");
			}
		}
	},
	resetForm: function () {
		this.domElement.reset();
                this.swap(this.pages[this.currentPageIndex].domElement, this.pages[this.options.firstPage].domElement);
    		this.changeCurrentPageClass(this.options.firstPage, this.currentPageIndex);
		this.currentPageIndex = this.options.firstPage;
		return false; // stop the event propagation
	},
	swap: function (from, to) {
		from.setStyle("display","none");
		to.setStyle("display","");
	}
}); // eowizard
