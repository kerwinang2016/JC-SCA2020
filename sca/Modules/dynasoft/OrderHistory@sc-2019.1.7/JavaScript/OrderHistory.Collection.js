/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderHistory
define('OrderHistory.Collection'
,	[	'OrderHistory.Model'
	,	'Transaction.Collection'
	]
,	function (
		OrderHistoryModel
	,	TransactionCollection
	)
{
	'use strict';

	//@class OrderHistory.Collection @extend Transaction.Collection
	return TransactionCollection.extend({

		//@property {OrderHistory.Model} model
		model: OrderHistoryModel
		//@property {Boolean} cacheSupport enable or disable the support for cache (Backbone.CachedModel)
	,	cacheSupport: false
		//@property {String} url
	,	url: 'services/OrderHistory.Service.ss'

	,	initialize: function (models, options)
		{
			TransactionCollection.prototype.initialize.apply(this, arguments);
			this.search = options && options.search;
			this.cmtstatus = options && options.cmtstatus;
			this.startdate = options && options.startdate;
			this.enddate = options && options.enddate;
			this.sort = options && options.sort               //29/08/2019 Saad Saad
			this.customFilters = options && options.filters;
			this.cmtdate = options && options.cmtdate;
		}

		//@method parse Handle the response from the back-end to properly manage total records found value
		//@param {Object} response JSON Response from the back-end service
		//@return {Array<Object>} List of returned records from the back-end
	,	parse: function (response)
		{
			this.totalRecordsFound = response.totalRecordsFound;
			this.recordsPerPage = response.recordsPerPage;

			return response.records;
		}

		//@method update Method called by ListHeader.View when applying new filters and constrains
		//@param {Collection.Filter} options
		//@return {Void}
	,	update: function (options)
		{
			var range = options.range || {}
			,	data = {
					filter: this.customFilters || options.filter && options.filter.value
				// ,	sort: options.sort
				// ,	order: options.order
				,	page: options.page
				,	search: options.search
				,	sort: options.sort   //29/08/2019 Saad Saad
				, startdate: options.startdate
				, enddate: options.enddate
				, cmtstatus: options.cmtstatus
				, cmtdate: options.cmtdate
				};

			this.fetch({
				data: data
			,	reset: true
			,	killerId: options.killerId
			});
		}
	});
});
