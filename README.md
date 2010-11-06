Formwizard
===========

Formwizard is a mootools plugin that lets you deploy a wizard control with just a couple of lines of code.

A wizard is a user interface element where the user performs a task fulfilling several
simple steps in a specific order. If you are using any major OS in the past decades, 
you should be familiar with this kind of control, though someone used to call it *Assistant*.

In order to let the developer integrate the wizard into the look and feel of a site,
the css classes used by the wizard are totally customizable and the burden of css
styling is totally on the developer shoulders :)

![Screenshot](http://github.com/eineki/FormWizard/raw/master/thumb.png)

How to use
----------

Using Formwizard is straightforward: 
It needs a form, in which the various wizard pages are identified as block elements,
usually several fieldsets or divs, marked by an user configurable class (default: wizard-page).
The pages will be presented to the user in the same order they appear in the HTML code.

The simplest way to use the plugin is 
	
	var wizard = new FormWizard(<id of the form to be transformed>);

You can personalize the wizard appearance and behaviour specifying several options into a *optional* object

	var wizard = new FormWizard(elementId, { ... options ...});

The various available options are:

 - *formClass* (default "wizard") is the class appended to the wizard container (useful for styling)
 - *pageClass* (default "wizard-page") is the class the plugin uses to identify the wizard pages
 - *defaultButtonClass* (default "wizard-button") is the class appended to the buttons used to change wizard pages (useful for styling)
 - *controlAreaClass* (default "wizard-control-area") is the class appended to the area containing the wizard buttons
 - *firstPage* (default 1) is the first page to show to the user,
 - *enterLastPage* (default null) is the function called from the wizard before entering the last page, useful to quickly personalize the
   wizard behaviour without resorting to the FlowControl options. It overwrite the corresponding FlowControl behaviour if both are present.
 - *createControlArea* (default: false) if true create a div with the needed control buttons and inject it at the form bottom
 - *showControlCaptions* (default: true) if false omits (even if specified) the captioni (*title*) of the control buttons.
 - *wizardControls* (default ["reset", "backward", "forward"]) is an array listing the desired buttons (to be created or already in place), 
   the order matters if createControlArea is *true*. Recognized buttons are reset, backward, forward and submit, use should be clear
 - *currentPageClassPrefix* (default "wizard-current") is the prefix to be used for marking the wizard container with a class describing 
    the page displayed in order to give a css hook to fulfill dedicated (presentation?) tasks when the wizard flow reach specific pages.
    An example can be hide and display the control buttons with css rules.
 - *controls* is an object containing configuration directives. It is aimed to configure the aspect of the various wizard buttons. It has 
   four properties: submit, forward, backward and reset. 

	The properties share a common structure: it comprehends a *title* (used if the plugin have to create the button) and *hook* a class
	used by the plugin to find the different buttons and attach to them the correct behaviour. Defaults are listed in the code below:

		controls: {
		    submit: {hook: 'wizard-control-submit',
		             title: MooTools.lang.get('Wizard', "submitButtonTitle")},
		    forward: {hook:'wizard-control-forward',
		              title: MooTools.lang.get('Wizard', "forwardButtonTitle")},
		    backward:{hook:'wizard-control-backward',
		              title: MooTools.lang.get('Wizard', "backwardButtonTitle")},
		    reset:{hook:'wizard-control-reset',
		           title: MooTools.lang.get('Wizard',"resetButtonTitle")}
		}

	As you see, The wizard relies on MooTools.lang.

Further behaviour personalization is provided with the use of a third parameter in the constructor

	var wizard = new FormWizard(elementId, { ... }, { ... });

Provided that you have specified an id for the wizard pages you want to further personalize you may
rely on two "events" enterPage and exitPage. They are useful when you want, for example, to check 
that the mandatory fields of a page are filled before to proceed to the next one.

Just create an object contaings one or more other objects (as the pages you want to enrich) named as the id of the target pages.
The object should contains an onEnter function and an onExit one. They are applyed to the pages and evaluated (in order) before leaving a
page and before entering the new one. You can do everything you want until you return a true value to grant the page change or a falsy one
to block the page flip. Error communication to the user are on you, the wizard limit itself to block the page change.

The functions get two parameters: the first is the index of the pages that has to be accessed, the latter is the index of the current page.
Obviously in javascript it is possible to disregard the passed parameters and declare a function with zero or just a siglel parameter instead
of the "canonical two"
Note: if the exitPage function return false, the page change is aborted, the enterPage function is not called.

RELEASE NOTE
------------

 + 2010-04-16 FormWizard 0.1 
    - This is the first release, I feel the pageFlow section needs to be reworked eavily.
 + 2010-04-20 FormWizard 0.2
    - Expanded the examples.
    - Now we can have multiple control buttons of the same type.
    - Added the option to hide the control button caption.
    - Squashed a bug with the reset button callback that prevent the wizard to return to the first page in some cases.
 + 2010-09-11 Formwizard 0.2.1
    - Every time a page is flipped the container gain a css class describing the current page index (starting from 0)
      There are also two special class, wizard-current-first and wizard-current-last, in addition to the "indexed version"
      added to the container when the first and last pages are displayed respectively. The class prefix is obiously fully 
      configurable.
    - added a new example.
    - The onEnterPage and onExitPage now can have two parameters, the page to show and the page actually displayed.
 + 2010-11-02 Formwizard 0.3
    - Last version for mootools 1.2.xx
    - The page swap is into a new funcion (named swap) ready to be refactored it you want fancier page swap
    - Revamped the examples' gallery
    - setup a support site at http://liberosoftware.net/FormWizard
Contribution
------------

This is my first MooTools plugin released to the wild, contributes, forks, comments and hints are not only accepted but required ;)
