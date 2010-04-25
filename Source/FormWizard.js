/*
---
description: FormWizard Class, WizardException.

license: MIT-style

authors: [Eineki]

requires:
- more/1.2.4: Lang
- core/1.2.4: '*'

provides: [FormWizard]

DEMO: http://www.liberosoftware.net/FormWizard/demo

...
*/

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
	Implements: Options,

	options: {
		formClass: "wizard",
		pageClass: "wizard-page",
		defaultButtonClass: "wizard-button",
		controlAreaClass: "wizard-control-area",
		firstPage: 1,
		createControlArea: false, // true if you need to add a bottom bar with controls
		wizardControls: ["reset", "backward", "forward"],
		showControlCaptions: true,
		controls: {
			submit: {hook: 'wizard-control-submit',
				     title: MooTools.lang.get('Wizard', "submitButtonTitle")},
			forward: {hook:'wizard-control-forward',
				      title: MooTools.lang.get('Wizard', "forwardButtonTitle")},
			backward:{hook:'wizard-control-backward',
					  title: MooTools.lang.get('Wizard', "backwardButtonTitle")},
			reset:{hook:'wizard-control-reset',
				   title: MooTools.lang.get('Wizard',"resetButtonTitle")}
		},
		enterLastPage: null
	},
	domElement: null,
	pages: [],
	currentPageIndex: 0, // The page being show
	controls: {
		submit:  {action: $empty },
		forward: {action: function(){ return this.changePage(this.currentPageIndex+1);}},
		backward:{action: function(){return this.changePage(this.currentPageIndex-1);}},
		reset:   {action: function() { return this.resetForm();}}
	},

	initialize: function (form, options, pageFlow){
		var button, buttonElement;
		if (!pageFlow)pageFlow={};
		
		form = $(form);
		if (!form) throw(new WizardException("Wizard container not found"));
		this.domElement = form;

		this.setOptions(options);
		this.options.firstPage = Math.max(this.options.firstPage-1,0) ; 	
		this.currentPageIndex = this.options.firstPage; 
	
		form.addClass(this.options.formClass);
		form.getChildren("." + this.options.pageClass).each(
		function(item) {
			var page = {domElement: item};
			page.onEnterPage = pageFlow[item.id]?$pick(pageFlow[item.id].onEnter, $lambda(true)):$lambda(true);
			page.onExitPage =  pageFlow[item.id]?$pick(pageFlow[item.id].onExit, $lambda(true)): $lambda(true);
			this.pages.push(page);
		},this);

		for (var i=1, limit=this.pages.length;i<limit;i++) {
			this.pages[i].domElement.setStyle('display','none');
		}
		
		if (this.options.enterLastPage !== null) {
			this.pages[this.pages.length-1]['onEnterPage'] = this.options.enterLastPage;
		}

		if (this.options.createControlArea) {
			var controlArea = new Element('div',{"class":this.options.controlAreaClass});
			for (i=0, limit=this.options.wizardControls.length; i< limit; i++) {
				button = this.options.controls[this.options.wizardControls[i]];
				(new Element('button',{"html": this.options.showControlCaptions?button.title:'',
					                   "class":[button.hook,$pick(button.buttonClass, this.options.defaultButtonClass)].join(' '),
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
					buttonElements.addEvent('click', this.controls[this.options.wizardControls[i]].action.bind(this));
				} else {
					throw(new WizardException("Button not found: " + button.hook));
				}
			}
		}
	}, // eo initialize
	changePage: function (targetPageIndex) {
		if (this.pages[targetPageIndex]) {
			if (this.pages[this.currentPageIndex].onExitPage()){
				if (this.pages[targetPageIndex].onEnterPage()) {
					this.pages[this.currentPageIndex].domElement.setStyle("display","none");
					this.pages[targetPageIndex].domElement.setStyle("display","");
					this.currentPageIndex = targetPageIndex;
				}
			}
		}
		return false; // stop the event propagation
	},
	resetForm: function () {
		this.domElement.reset();
		this.pages[this.currentPageIndex].domElement.setStyle("display","none");
		this.currentPageIndex = this.options.firstPage;
		this.pages[this.currentPageIndex].domElement.setStyle("display","");
		return false; // stop the event propagation
	}
}); // eowizard
