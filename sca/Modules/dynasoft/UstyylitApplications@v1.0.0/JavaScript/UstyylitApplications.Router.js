/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Cart
define('UstyylitApplications.Router'
,	[
		'Utils'
	,	'jQuery'
	,	'Backbone'
	,	'Tracker'
	, 'UstyylitApplications.View'
	]
,	function (
		Utils
	,	jQuery
	,	Backbone
	,	Tracker
	,	UstyylitApplicationsView
	)
{
	'use strict';

	// @class Cart.Router responsible to know render the cart when the user navigates to the cart url @extends Backbone.Router
	return Backbone.Router.extend({

		routes: {
			'applications':'showApplications'
		}

	,	initialize: function (application)
		{
			this.application = application;
		}

	,	showApplications: function(){
			var view = new UstyylitApplicationsView({
					application:this.application
			});
			view.showContent();
		}
	});
});
