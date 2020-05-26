/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// ----------------
// Service to manage addresses requests
define(
	'UstyylitApplications.ServiceController'
,	[
		'ServiceController'
	,	'Application'
	,	'Profile.Model'
	]
,	function(
		ServiceController
	,	Application
	,	ProfileModel
	)
	{
		'use strict';

		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name:'UstyylitApplications.ServiceController'

			// @property {Service.ValidationOptions} options. All the required validation, permissions, etc.
			// The values in this object are the validation needed for the current service.
			// Can have values for all the request methods ('common' values) and specific for each one.
		,	options: {
				common: {
					requireLogin: true
				}
			}
		, get: function(){

			var data = {appsecrect:"80dec8520q6e9r7dk4oy8cr89o6t7ow3"};

			var response = nlapiRequestURL("https://api.dayang.cn/TokenService.asmx/GetCustomerLiningUrl",data);
			var response1 = nlapiRequestURL("https://api.dayang.cn/TokenService.asmx/GetStyylcartUrl",data);
			var responseData = [];
			responseData.push(response.getBody());
			responseData.push(response1.getBody());
			this.sendContent(responseData);
		}
		});
	}
);
