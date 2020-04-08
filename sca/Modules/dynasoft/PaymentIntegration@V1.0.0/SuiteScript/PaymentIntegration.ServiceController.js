/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// ----------------
// Service to manage addresses requests
define(
	'PaymentIntegration.ServiceController'
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
			name:'PaymentIntegration.ServiceController'

			// @property {Service.ValidationOptions} options. All the required validation, permissions, etc.
			// The values in this object are the validation needed for the current service.
			// Can have values for all the request methods ('common' values) and specific for each one.
		,	options: {
				common: {
					requireLogin: true
				}
			}
		, get: function(){
			return "GET";
		}
		, checkGateway: function(){
			var gatewayCheck = nlapiRequestURL("https://paymentgateway.commbank.com.au/api/rest/version/1/information");
			var g_JSON = JSON.parse(gatewayCheck.getBody());
			return g_JSON.status == 'OPERATING'? true:false;
		}
		, getSession: function(){
			if(checkGateway()){
				nlapiLogExecution('debug','PaymentIntegration', this.request.getBody());
				var body = JSON.parse(this.request.getBody());
				var data = {};
				data.apiOperation = body.apiOperation;

				data.order = {
					currency:body.order.currency,
					id:body.order.id,
					amount:body.order.amount
				}

				var paymenturl = 'https://paymentgateway.commbank.com.au/api/rest/version/46/merchant/JERCLOMCC201/session';
				var response = nlapiRequestURL(paymenturl,JSON.stringify(data), {'Authorization':'Basic bWVyY2hhbnQuSkVSQ0xPTUNDMjAxOjhhYjUzNmQ2MjM0NDdhNzg0NmZiYjUzYzVhZDEyODFm'});
				return JSON.parse(response.getBody()).session.id
				//return response.getBody();
			}else{
				//Gateway is offline
				return "";
			}
		}
		,	post: function()
			{
				if(checkGateway()){
					nlapiLogExecution('debug','PaymentIntegration', this.request.getBody());
					var body = JSON.parse(this.request.getBody());
				  var data = {};
				  data.apiOperation = body.apiOperation;

				  data.order = {
				    currency:body.order.currency,
				    id:body.order.id,
				    amount:body.order.amount
				  }

					var paymenturl = 'https://paymentgateway.commbank.com.au/api/rest/version/46/merchant/JERCLOMCC201/session';
					var response = nlapiRequestURL(paymenturl,JSON.stringify(data), {'Authorization':'Basic bWVyY2hhbnQuSkVSQ0xPTUNDMjAxOjhhYjUzNmQ2MjM0NDdhNzg0NmZiYjUzYzVhZDEyODFm'});
					this.sendContent(response.getBody());
				}else{
					//Gateway is offline
				}
			}
			, put: function(){

				// https://paymentgateway.commbank.com.au/api/rest/version/54/merchant/JERCLOMCC201/order/{orderid}/transaction/{transactionid}

				var body = JSON.parse(this.request.getBody());
				var data = {};
				// var sourceOfFunds = {
				// 	type:'CARD',
				// 	provided:{
				// 		card:{
				// 			expiry:{
				// 				month: '01',
				// 				year: '24'
				// 			},
				// 			nameOnCard: 'Kerwin Go Ang',
				// 			number: '4649950000840426',
				// 			securityCode: '426'
				// 		}
				// 	}
				// };
				// var order = {
				// 	amount: 1,
				// 	currency: 'USD',
				// 	description: 'Payment for Invoices'
				// };
				// var apiOperation = 'PAY';
				// var orderid = '100';
				// var transactionid = '100_100'
				data.apiOperation = body.apiOperation;
				data.order = body.order;
				//data.session = body.session;
				data.sourceOfFunds = body.sourceOfFunds;

				//data.email = body.email;
				// order= {amount: self.model.get('payment'),
				// currency: SC.ENVIRONMENT.currentCurrency.code,
				// description: 'Payment for Invoices',
				// id: orderid,
				// item: items
				//items.push({name:credit.get('refnum'), quantity:1, unitPrice: parseFloat(credit.get('amount'))*-1})
				//items.push({name:curr_invoice.get('tranid'), quantity:1, unitPrice: curr_invoice.get('amount')})
				// }
				var paymenturl = 'https://paymentgateway.commbank.com.au/api/rest/version/54/merchant/JERCLOMCC201/order/'+body.orderid+'/transaction/'+body.transactionid;
				var response = nlapiRequestURL(paymenturl,JSON.stringify(data), {'Authorization':'Basic bWVyY2hhbnQuSkVSQ0xPTUNDMjAxOjhhYjUzNmQ2MjM0NDdhNzg0NmZiYjUzYzVhZDEyODFm'}, 'PUT');
				this.sendContent(response.getBody());
				// "'{'\"apiOperation\":{0},"
				// 	+ "\"sourceOfFunds\":'{'\"type\":{1},\"provided\":'{'\"card\":'{'\"number\":{2},"
				// 	+ "\"expiry\":'{'\"month\":{3}, \"year\":{4}'}',\"securityCode\":{5}'}}}',"
				// 	+ "\"order\":'{'\"reference\":{6}'}',"
				// 	+ "\"transaction\":'{'\"amount\":{7},\"currency\":{8},\"reference\":{9},\"targetTransactionId\":{10}'}',"
				// 	+ "\"customer\":'{'\"ipAddress\":{11}'}}'",

			}
		});
	}
);
