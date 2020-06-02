/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// ----------------
// Service to manage addresses requests
define(
	'BlockQuantity.ServiceController'
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
			name:'BlockQuantity.ServiceController'

			// @property {Service.ValidationOptions} options. All the required validation, permissions, etc.
			// The values in this object are the validation needed for the current service.
			// Can have values for all the request methods ('common' values) and specific for each one.
		,	options: {
				common: {
					requireLogin: true
				}
			}
		, get: function(){

			var columns = [], items = [], filters=[];
			columns.push(new nlobjSearchColumn('internalid'));
			columns.push(new nlobjSearchColumn('custrecord_bqm_block'));
			columns.push(new nlobjSearchColumn('custrecord_bqm_product'));
			columns.push(new nlobjSearchColumn('custrecord_bqm_quantity'));
			filters.push(new nlobjSearchFilter('isinactive',null,'is','F'));
			var search = nlapiCreateSearch('customrecord_block_quantity_measurement',filters,columns);
			var resultSet = search.runSearch();
			var searchid = 0;
			var res,cols;
			do{
				res = resultSet.getResults(searchid,searchid+1000);
				if(res && res.length > 0){
					if(!cols)
					cols = res[0].getAllColumns();
					for(var i=0; i<res.length; i++){
						var itemdata = {};
						for(var j=0; j<cols.length; j++){
							var jointext= cols[j].join?cols[j].join+"_":'';
							itemdata[jointext+cols[j].name] = res[i].getValue(cols[j]);
							if(res[i].getText(cols[j]))
							itemdata[jointext+cols[j].name+"text"] = res[i].getText(cols[j]);
						}
						items.push(itemdata);
					}
					searchid+=1000;
				}
			}while(res && res.length == 1000);
			
			this.sendContent(items);
		}
		});
	}
);
