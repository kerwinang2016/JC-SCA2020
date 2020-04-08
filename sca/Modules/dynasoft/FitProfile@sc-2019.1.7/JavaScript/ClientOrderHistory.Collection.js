// ClientOrderHistory.Collection.js
// -----------------------
// Placed Orders collection but were not using the cache collection
define('ClientOrderHistory.Collection', ['OrderHistory.Model','Profile.Model'], function (Model,ProfileModel)
{
	'use strict';

	return Backbone.Collection.extend({
		model: Model
	,	url: 'services/OrderHistory.Service.ss'             //PlacedOrder.Service.ss    //'services/OrderHistory.Service.ss'   placed-order.ss
	,	parse: function (response)
		{
			this.totalRecordsFound = response.totalRecordsFound;
			this.recordsPerPage = response.recordsPerPage;

			return response.records;
		}
	,	initialize: function (search)                //02/07/2019 Saad
		{
			//this.profile_model = ProfileModel.getInstance();  //04/02/2020
			//search = search.replace(' ', '%');
			var clientid =jQuery('#fitProfileClientInternalId').text();//this.profile_model.get("parent");
			this.url += "?clientName=" + search.name + "&clientid=" +clientid;

		}
	});
});
