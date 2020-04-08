// Profile.Router.js
// -----------------------
// Router for handling profile view/update
define('FitProfile.Router',  ['FitProfile.View', 'FitProfile.Model', 'FormRenderer.View', 'Profile.Model'], function (Views, Model, FormRenderer, ProfileModel)
{
	'use strict';

	return Backbone.Router.extend({

		routes: {
			'fitprofile': 'fitProfile'
		,	'fitprofile/:id': 'renderForm'
		}

	,	initialize: function (application, clients)
		{
			this.application = application;
			this.clients = clients;
      this.profile_model = ProfileModel.getInstance();
		}

		// load the home page
		,	fitProfile: function ()
    {
        var application = this.application;
				var	view = new Views({
            application: application,
            mode : 'new'
        ,	model: new Model(this.profile_model.get('parent'))
        });
    // view.model.on("afterInitialize", function(){
             view.showContent();
        // })

    }
	,	renderForm: function(id){
			var application = this.application;

			var	view = new FormRenderer({
				application: application
			,	profileModel: application.getLayout().currentView.model
			,	mode: id
			});

			view.showContent();
		}
	});
});
