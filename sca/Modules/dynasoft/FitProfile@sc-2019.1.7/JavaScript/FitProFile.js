//Fit Profile
define('FitProFile', ['FitProfile.View','FitProfile.Router', 'FitProfile.Model'], function (Views, Router, Model)
{
	'use strict';
		
	return	{

		Views: Views
	,	Router: Router
	,	Model: Model
	,	MenuItems: [
			{
				id: 'fitprofile'
			,	name:'Client Profiles'
			,	url: 'fitprofile'
			,	index: 6
			}
		]

	,	mountToApp: function (application)
		{
			return new Router(application);
		}
	};
});
