/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Profile.Router.js
// -----------------------
// Router for handling profile view/update
// @module Profile
define(
		'Profile.Router'
,	[	
		'Profile.UpdatePassword.View'
	,	'Profile.Information.View'
	,	'Profile.EmailPreferences.View'
	,	'OrderHistory.Collection'
	,	'Profile.UpdatePassword.Model'
	,	'Profile.Model'
	
	,	'jQuery'
	,	'underscore',
	'TermsAndConditions.View'

	,	'Backbone'
	,  'ContactUs.View'
	,	'StockList.View'
	,	'TrainingGuides.View'
	,	 'FavouriteFitTools.View'
	,  'DesignOptions.View'
	,  'FavouriteOptions.View'
	,	'FitProfile.View'
	,	'ModalGallery.Views'
	,	'Utils'
	, 'FormRenderer.View'

	]
,	function (
		ProfileUpdatePasswordView
	,	ProfileInformationView
	,	ProfileEmailPreferencesView
	,	OrderHistoryCollection
	,	UpdatePasswordModel
	,	ProfileModel
	,	jQuery
	,	_
	,   TermsView
	,	Backbone
	,	ContactView
	,	StockListView
	,	TrainingGuidesView
	,	FavouriteFitToolsView
	, 	DesignOptionsView
	,	FavouriteOptionsView
	,	FitProfileView
	,	ModalGalleryViews
	,	Utils
	,	FormRenderer
	
	)
{
	'use strict';

	// @class Profile.Router @extends Backbone.Router
	return Backbone.Router.extend({

		routes: {
			'profileinformation': 'profileInformation'
		,	'emailpreferences': 'emailPreferences'
		,	'updateyourpassword': 'updateYourPassword'
		,	'designoptionsrestriction': 'designOptionsRestriction'
		,	'favouriteoptions': 'favouriteOptions'
		, 	'favouritefittools' : 'favouritefittools'
		, 	'stocklist': 'stockList'
		, 	'termsandconditions' : 'termsAndConditions'
		, 	'contactus' : 'contactUs'
		,	'trainingguides': 'trainingGuides'
		,	'fitprofile': 'fitProfile'
		,	'fitprofile/:id': 'renderForm'
		//,	'img/:key': 'renderGallery'            //11/09/2019 Saad  27/08/2019 Saad
		}

	,	initialize: function (application)
		{
			this.application = application;
		}

	// ,	renderGallery: function(key)  //11/09/2019 Saad   27/08/2019 Saad
	// 	{ 
	// 		var	view = new ModalGalleryViews({
	// 				application: this.application
	// 			,	key: unescape(key).split("|")[0]
	// 			,	title: unescape(key).split("|")[1]
	// 		});
	// 		view.showContent();
	// 	}

		// view/update profile information
	
	,	termsAndConditions: function(){
		var view = new TermsView({
				application:this.application
		});
		view.showContent();
	}
	,	contactUs: function(){
		var view = new ContactView({
				application:this.application
		}); 
		view.showContent();
	}
	, 	stockList: function(){ 

			var view = new StockListView({
					application:this.application
				//, model: this.application.getUser()
			});
			
			view.showContent();

	}		
	,	trainingGuides: function ()
		{
			var view = new TrainingGuidesView({
					application: this.application
			});

		view.showContent();
		}

	 , favouritefittools: function(){ 
		 var self = this;
		var url = Utils.getAbsoluteUrl('javascript/FitProfile_Config.json');
		jQuery.get(url).always(function(data){
			var view = new FavouriteFitToolsView({
				application: self.application,
				data: data,
				values : '',
				paramEvent : '',
				selectedItemType : '',
				favFitToolsFlag : true

				});

				view.showContent();
		});
	} 

	, designOptionsRestriction: function(){ 
		var self = this;
	   var url = Utils.getAbsoluteUrl('javascript/DesignOptions_Config.json');
	   jQuery.get(url).always(function(data){
	   var view = new DesignOptionsView({
		   		application: self.application 
		   	,	options_config: data
			,	mode: "multi"
		   });

		   view.showContent();
	   });
	}
	   
	, favouriteOptions: function(){  
		var self = this;
	   var url = Utils.getAbsoluteUrl('javascript/DesignOptions_Config.json');
	   jQuery.get(url).always(function(data){
	   var view = new FavouriteOptionsView({
		   application: self.application,
		   	options_config: data
		   ,	mode: "single"
		   });
	
		   view.showContent();
	   });
	}
	
	,
	renderForm: function(id){
		var application = this.application;

		var	view = new FormRenderer({
			application: application
		//,	profileModel: application.getLayout().currentView.model
		,	mode: id
		});

		view.showContent();
	}

	,profileInformation: function ()
		{
			var view = new ProfileInformationView({
				application: this.application
			,	model: ProfileModel.getInstance()
			});

			view.useLayoutError = true;

			view.model.on('save', view.showSuccess, view);

			view.showContent();
		}


		// view/edit user's email preferences
	,	emailPreferences: function ()
		{
			var	view = new ProfileEmailPreferencesView({
				application: this.application
			,	model: ProfileModel.getInstance()
			});

			view.useLayoutError = true;

			view.model.on('save', view.showSuccess, view);

			view.showContent();
		}

		// update your password
	,	updateYourPassword: function ()
		{
			var model = new UpdatePasswordModel({});

			// merge the profile model into the UpdatePasswordModel
			model.set(ProfileModel.getInstance().attributes);

			var	view = new ProfileUpdatePasswordView({
				application: this.application
			,	model: model
			});

			view.useLayoutError = true;

			view.model.on('save', view.showSuccess, view);

			view.showContent();
		}
		
	});
});
