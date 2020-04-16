/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderHistory
define('OrderHistory.Router'
,	[	'OrderHistory.List.View'
	,	'OrderHistory.Details.View'
	,	'OrderHistory.Model'
	,	'OrderHistory.Collection'
	,	'AjaxRequestsKiller'
	,	'SC.Configuration'
	,	'Backbone'
	,	'Utils'
	]
,	function (
		OrderHistoryListView
	,	OrderHistoryDetailsView
	,	OrderHistoryModel
	,	OrderHistoryCollection
	,	AjaxRequestsKiller
	,	Configuration
	,	Backbone
	,	Utils
	)
{

	'use strict';

	//@class OrderHistory.Router Router for handling orders @extend Backbone.Router
	return Backbone.Router.extend({
		//@property {Object} routes
		routes: {
			'purchases': 'listAllPurchases'
		,	'purchases?:options': 'listAllPurchases'
		,	'purchases/view/:recordtype/:id': 'getPurchaseDetail'
		,	'open-purchases': 'listOpenPurchases'
		,	'open-purchases?:options': 'listOpenPurchases'
		,	'cart':'saveditems'
		// ,	'purchases/search?:key' :'searchbar'             //02/07/2019 Saad
		// ,	'purchases/sortt/:keyData' :'sortbar'             //29/08/2019 Saad Saad

		}

		//@method initialize
	,	initialize: function (application)
		{
			this.application = application;
			this.isSCISIntegrationEnabled = Configuration.get('siteSettings.isSCISIntegrationEnabled', false);

			if (this.isSCISIntegrationEnabled)
			{
				this.route('instore-purchases', 'listInStorePurchases');
				this.route('instore-purchases?:options', 'listInStorePurchases');
			}
		}

		//@method listAllPurchases list orders @param {Object} options
	,	listAllPurchases: function (options)
		{

			options = (options) ? Utils.parseUrlOptions(options) : {page: 1};
			options.page = options.page || 1;
			options.search = options.search || "";
			options.sort = options.sort || "";			//29/08/2019 Saad Saad

			options.startdate = options.startdate? options.startdate : "";
			options.enddate = options.enddate? options.enddate : "";
			options.cmtstatus = options.cmtstatus? options.cmtstatus : "";
			options.cmtdate = options.cmtdate? options.cmtdate : "";

			var collection = new OrderHistoryCollection();
			var	view = new OrderHistoryListView({
					application: this.application
				,	page: options.page
				,	search: options.search        //02/07/2019 Saad
				,	sort:options.sort			//29/08/2019 Saad Saad
				,	collection: collection

				, startdate: options.startdate
				, enddate: options.enddate
				, cmtstatus: options.cmtstatus
				, cmtdate: options.cmtdate
				});
			collection.on('reset', view.showContent, view);

			view.showContent();
		}

	// ,	searchbar: function (options)          //02/07/2019 Saad
	// 	{
	// 		options = (options) ? Utils.parseUrlOptions(options) :  {page: 1};
	// 		options.search = options.search? options.search : "";
	// 		options.startdate = options.startdate? options.startdate : "";
	// 		options.enddate = options.enddate? options.enddate : "";
	// 		options.cmtstatus = options.cmtstatus? options.cmtstatus : "";
	// 		options.cmtdate = options.cmtdate? options.cmtdate : "";
	// 		var collection = new OrderHistoryCollection([], {
	// 			search: options.search
	// 			, startdate: options.startdate
	// 			, enddate: options.enddate
	// 			, cmtstatus: options.cmtstatus
	// 			, cmtdate: options.cmtdate
	// 		})
	// 		,	view = new OrderHistoryListView({
	// 				application: this.application
	// 			,	collection: collection
	// 			,	search: options.search
	// 			, startdate: options.startdate
	// 			, enddate: options.enddate
	// 			, cmtstatus: options.cmtstatus
	// 			, cmtdate: options.cmtdate
	// 			});
	//
	// 		collection.on('reset', view.showContent, view);
	//
	// 		view.showContent();
	// 	}

	// ,	sortbar: function (keyData)          //29/08/2019 Saad Saad
	// 	{
	// 		var collection = new OrderHistoryCollection([], {
	// 			sortt: keyData.toString()
	// 		})
	// 		,	view = new OrderHistoryListView({
	// 				application: this.application
	// 			,	collection: collection
	// 			,	sortt : keyData
	// 			});
	//
	// 		collection.on('reset', view.showContent, view);
	//
	// 		view.showContent();
	// 	}

		//@method listOpenPurchases list orders @param {Object} options
	,	listOpenPurchases: function (options)
		{
			options = (options) ? Utils.parseUrlOptions(options) : {page: 1};
			options.page = options.page || 1;

			var collection = new OrderHistoryCollection([], {
				filters: 'status:open'
			})
			,	view = new OrderHistoryListView({
					application: this.application
				,	page: options.page
				,	collection: collection
				,	activeTab: 'open'
				});

			collection.on('reset', view.showContent, view);

			view.showContent();
		}

		//@method listInStorePurchases list orders @param {Object} options
	,	listInStorePurchases: function (options)
		{
			if (!this.isSCISIntegrationEnabled)
			{
				return;
			}

			options = (options) ? Utils.parseUrlOptions(options) : {page: 1};
			options.page = options.page || 1;

			var collection = new OrderHistoryCollection([], {
				filters: 'origin:instore'
			})
			,	view = new OrderHistoryListView({
					application: this.application
				,	page: options.page
				,	collection: collection
				,	activeTab: 'instore'
				});

			collection.on('reset', view.showContent, view);

			view.showContent();
		}

		//@method orderDetails view order's detail
		//@param {String} recordtype
		//@param {String} id
		//@return {Void}
	,	getPurchaseDetail: function (recordtype, id)
		{
			var model = new OrderHistoryModel()
			,	view = new OrderHistoryDetailsView({
					application: this.application
				,	id: id
				,	model: model
				});

			model
				.once('change', view.showContent, view)
				.fetch({
						data: {
							internalid: id
						,	recordtype: recordtype
						}
					,	killerId: AjaxRequestsKiller.getKillerId()
				});
		},

		saveditems: function()
		{
			window.location = SC._applications.MyAccount.getConfig().siteSettings.touchpoints.home + "#cart";
		}
	});
});
