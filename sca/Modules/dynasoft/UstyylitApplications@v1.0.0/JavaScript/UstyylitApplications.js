/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Cart
define('UstyylitApplications'
,	[
		'UstyylitApplications.Router'
	,	'SC.Configuration'

	,	'jQuery'
	]
,	function (
		UstyylitApplicationsRouter
	,	Configuration

	,	jQuery
	)
{
	'use strict';

	/*
		@class Cart

		Defines the Cart module

		mountToApp() handles some environment issues

		@extends ApplicationModule
	*/
	return {

		mountToApp: function mountToApp (application)
		{
			return new UstyylitApplicationsRouter(application);
		}
	};
});
