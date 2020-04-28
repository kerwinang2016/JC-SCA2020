/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderHistory
define('OrderHistory.List.View'
,	[	'SC.Configuration'
	,	'GlobalViews.Pagination.View'
	,	'GlobalViews.ShowingCurrent.View'
	//,	'ListHeader.View'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'OrderHistory.List.Tracking.Number.View'
	,	'OrderHistoryRecords.View'
	,	'Handlebars'

	,	'order_history_list.tpl'

	,	'Backbone'
	,	'underscore'
	,	'jQuery'
	]
,	function (
		Configuration
	,	GlobalViewsPaginationView
	,	GlobalViewsShowingCurrentView
	//,	ListHeaderView
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	OrderHistoryListTrackingNumberView
	,	OrderHistoryRecordsView
	,	Handlebars

	,	order_history_list_tpl

	,	Backbone
	,	_
	,	jQuery
	)
{
	'use strict';

	//@class OrderHistory.List.View view list of orders @extend Backbone.View
	return  Backbone.View.extend({
		//@property {Function} template
		 template: order_history_list_tpl
		//@property {String} title
		,	title: _('Order History').translate()  //18/07/2019 Saad
		//@property {String} className
	,	className: 'OrderListView'
		//@property {String} page_header
	,	page_header: _('Order History').translate()   //18/07/2019 Saad
			//@property {Object} attributes
	,	attributes: {
			'id': 'PurchaseHistory'
		,	'class': 'OrderListView'
		}
		//@property {Object} events
	,	events: {
			'click [data-action="navigate"]': 'navigateToOrder'   //23-06-2019
			, 'change [data-name="flag"]': 'updateFlag'             //23-06-2019
			, 'click #modalContainerSave' : 'updateFlagDetails'    //23-06-2019
			, 'click [data-dismiss="modal"]': 'closemodal'    //23-06-2019
			, 'click button[rel="search"]': 'searchorders'   //23-06-2019
			, 'click #searchorders': 'searchorders'
			// , 'blur [name="oh_dateneeded"]': 'updateDateNeeded'  //23-06-2019
			// , 'change [name="oh_dateneeded"]': 'updateDateNeeded'  //30-06-2019
			, 'click #downloadorders': 'downloadOrders'
			, 'click #selectall': 'selectAll'
			, 'click button[id="sortred"]': 'sortRed'   //29/08/2019 Saad Saad
			, 'click #clearfilters': 'clearFilters'
			, 'click [data-name*="downloadfile"]': 'downloadCheckboxClicked'
		}

			//@method initialize
		,	initialize: function (options)
			{
				this.search = options.search;      //01/07/2019 Saad
				this.application = options.application;
				this.collection = options.collection;
				this.startdate = options.startdate;
				this.enddate = options.enddate;
				this.cmtstatus = options.cmtstatus;
				this.cmtdate = options.cmtdate;
				this.page = options.page;
				this.sort = options.sort;
				this.isSCISIntegrationEnabled = Configuration.get('siteSettings.isSCISIntegrationEnabled', false);

				var isoDate = _.dateToString(new Date());

				// this.rangeFilterOptions = {
				// 	fromMin: '1800-01-02'
				// ,	fromMax: isoDate
				// ,	toMin: '1800-01-02'
				// ,	toMax: isoDate
				// };

				this.listenCollection();
				//BackboneCompositeView.add(this);
				this.collection.update({
						filter: this.customFilters || options.filter && options.filter.value
					// ,	sort: options.sort.value
					// ,	order: options.order
					,	page: this.page
					,	search: this.search
					,	sort: this.sort   //29/08/2019 Saad Saad
					, startdate: this.startdate
					, enddate: this.enddate
					, cmtstatus: this.cmtstatus
					, cmtdate: this.cmtdate
					});
			}

		//@method getSelectedMenu
	,	getSelectedMenu: function ()
		{
			return 'purchases';
		}
		//@method getBreadcrumbPages
	,	getBreadcrumbPages: function ()
		{
			return {
					text: this.title
				,	href: '/purchases'
			};
		}

	, closemodal: function(){  //23-06-2019
			jQuery('#modalContainer').modal('hide')
		}
	, downloadCheckboxClicked: function(e){
		if(jQuery('#selectall').prop('checked') == true){
			jQuery('#selectall').prop('checked', false);
		}
	}
	, clearFilters: function(e){
			e.preventDefault();
			jQuery('#to').val("");
			jQuery('#from').val("");
			jQuery('#filter_cmtstatus').val("");
			jQuery('#cmtdate').val("");
			jQuery('[rel="search"]').val("");
	}
	, selectAll: function(e){
		if(jQuery('#selectall').prop('checked') == true){
			jQuery('[data-id*="downloadfile"]').prop('checked', true);
		}
		else{
			jQuery('[data-id*="downloadfile"]').prop('checked', false);
		}
	}
	, downloadOrders: function(e){
		e.preventDefault();
		var data1 = {};
		data1.contents = "data:text/csv;charset=utf-8,Date,Order,ClientName,Item,Fabric,CMT,DateNeeded\n";

		if(jQuery('#selectall').prop('checked') == true){
			//if it is checked

			var data = {
				page: 'all'
				,	search: jQuery("input[rel=search]").val()
				,	sort: this.sort
				, startdate: jQuery('#from').val()?jQuery('#from').val().split('/').join('-'):""
				, enddate: jQuery('#to').val()?jQuery('#to').val().split('/').join('-'):""
				, cmtstatus: jQuery('#filter_cmtstatus').val()
				, cmtdate: jQuery('#cmtdate').val()?jQuery('#cmtdate').val().split('/').join('-'):""
			};
			this.collection.fetch({
				data: data
			}).done(function(d){
				if(d.records.length >0){
						for(var i=0;i<d.records.length;i++){
								data1.contents+=d.records[i].date + ',';
							data1.contents+=d.records[i].so_id + ',';
							data1.contents+=d.records[i].client_name + ',';
							data1.contents+=d.records[i].customitemtext + ',';
							data1.contents+=d.records[i].fabricstatus + ',';
							data1.contents+=d.records[i].cmt_status + ',';
							data1.contents+=d.records[i].date_needed + '\n';
						}
					var link = document.createElement("a");
					var encodedUri = encodeURI(data1.contents);
					link.setAttribute("href", encodedUri);
					link.setAttribute("download", "OrderDetails.csv");
					document.body.appendChild(link);
					link.click();
				}
			});
		}else{
			_.each(jQuery('[data-id*="downloadfile"]:checked'),function(data){
				var id = jQuery(data).data('id').split('_')[1];
				data1.contents+=jQuery('[data-name="date_'+id+'"]').text() + ',';
				data1.contents+=jQuery('[data-name="order_'+id+'"]').text() + ',';
				data1.contents+=jQuery('[data-name="client_'+id+'"]').text() + ',';
				data1.contents+=jQuery('[data-name="item_'+id+'"]').text() + ',';
				data1.contents+=jQuery('[data-name="fabric_'+id+'"]').text() + ',';
				data1.contents+=jQuery('[data-name="cmtstatus_'+id+'"]').text() + ',';
				data1.contents+=jQuery('[data-name="dateneeded_'+id+'"]').val() + '\n';
			});
			var link = document.createElement("a");
			var encodedUri = encodeURI(data1.contents);
			link.setAttribute("href", encodedUri);
			link.setAttribute("download", "OrderDetails.csv");
			document.body.appendChild(link);
			link.click();
		}

	}
		// 19/07/2019 Saad start

		, updateFlag: function(e){
			var id  = jQuery(e.target).closest('tr').data('id');
			var check = jQuery(e.target).prop('checked');
			if(check == true){
				var texthtml = "<input type='text' data-name='flagdetails' data-id='"+id+"' style='width:100%;'>";
				jQuery('.modal-body').html(texthtml)
				jQuery('#modalContainer').modal('show')
				//return;
			}
			if(check == false){
				this.collection.each(function (model) {
						if (model.get('internalid') == id){//.split('_')[1] == id) {
							model.set('custcol_flag_comment', '');
							model.set('custcol_flag','F')
							model.save();
						}
					});
			}
		}

		// 19/07/2019 Saad  end

	,	updateDateNeeded: function (e) {   //25-06-2019   //30/06/2019 Saad
		e.preventDefault();
		var valueofdate = e.target.value;
		if (valueofdate) {
			var today = new Date(valueofdate);
			var soDateNeeded = today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear();
			var soLineKey = jQuery(e.target).closest('[data-id]').data('id');
			if(soLineKey){
				this.collection.each(function (model) {
					if (model.get('internalid') == soLineKey){//.split('_')[1] == soLineKey) {
						model.set('custcol_avt_date_needed', soDateNeeded);
						model.save();
					}
				});
			}

		}
		//var placed-order-model = this.collection.find(function(model) { return model.get('custcol_avt_saleorder_line_key') === 'Lee'; });
	}

	,	searchorders: function (e) {   //23-06-2019             //02/07/2019 Saad
			e.preventDefault();
		 	var search_keyword = jQuery("input[rel=search]").val();
			var startdate = jQuery('#from').val()?jQuery('#from').val().split('/').join('-'):"";
			var enddate = jQuery('#to').val()?jQuery('#to').val().split('/').join('-'):"";
			var cmtdate = jQuery('#cmtdate').val()?jQuery('#cmtdate').val().split('/').join('-'):"";
			var	url = "purchases?search=" + search_keyword+"&cmtdate="+cmtdate+
				"&startdate="+startdate+"&enddate="+enddate+
				"&cmtstatus="+jQuery('#filter_cmtstatus').val();
			Backbone.history.navigate(url, true);
		}

	, 	sortRed: function (e) {		//29/08/2019 Saad Saad
			e.preventDefault();
			var search_keyword = jQuery("input[rel=search]").val();
			var startdate = jQuery('#from').val()?jQuery('#from').val().split('/').join('-'):"";
			var enddate = jQuery('#to').val()?jQuery('#to').val().split('/').join('-'):"";
			var cmtdate = jQuery('#cmtdate').val()?jQuery('#cmtdate').val().split('/').join('-'):"";
			var	url = "purchases?sort=true&search=" + search_keyword+"&cmtdate="+cmtdate+
				"&startdate="+startdate+"&enddate="+enddate+
				"&cmtstatus="+jQuery('#filter_cmtstatus').val();
			Backbone.history.navigate(url, true);
		}

		// 19/07/2019 Saad  start
	, 	updateFlagDetails: function(e){      //23-06-2019
			var id = jQuery('[data-name="flagdetails"]').data().id;
			this.collection.each(function (model) {
				if (model.get('internalid') == id){//.split('_')[1] == id) {
					model.set('custcol_flag_comment',  jQuery('[data-name="flagdetails"]').val());
					model.set('custcol_flag','T')
					model.save();
				}
			});
			jQuery('#modalContainer').modal('hide')
		}
		// 19/07/2019 Saad  end

		//@method navigateToOrder
	,	navigateToOrder: function (e)
		{
			//ignore clicks on anchors and buttons
			if (_.isTargetActionable(e))
			{
				return;
			}

			if (!jQuery(e.target).closest('[data-type="accordion"]').length)
			{
				var order_id = jQuery(e.target).closest('[data-id]').data('id')
				,	recordtype = jQuery(e.target).closest('[data-record-type]').data('record-type');

				Backbone.history.navigate('#purchases/view/' + recordtype + '/' + order_id, {trigger:true});
			}
		}
		//@method listenCollection
	,	listenCollection: function ()
		{
			this.setLoading(true);

			this.collection.on({
				request: jQuery.proxy(this, 'setLoading', true)
			,	reset: jQuery.proxy(this, 'setLoading', false)
			});
		}
		//@method setLoading
	,	setLoading: function (value)
		{
			this.isLoading = value;
		}
		//@property {Array} sortOptions
		// Array of default sort options
		// sorts only apply on the current collection
		// which might be a filtered version of the original
	,	sortOptions: [
			{
				value: 'trandate,internalid'
			,	name: _('Sort By Date').translate()
			,	selected: true
			}
		,	{
				value: 'tranid'
			,	name: _('Sort By Number').translate()
			}
		,	{
				value: 'amount'
			,	name: _('Sort By Amount').translate()
			}
		]
		//@property {Object} childViews
	,	childViews: {
		// 	'ListHeader': function ()
		// 	{
		// 		return this.listHeader;
		// 	}
		// ,
		'GlobalViews.Pagination': function ()
			{
				return new GlobalViewsPaginationView(_.extend({
					totalPages: Math.ceil(this.collection.totalRecordsFound / this.collection.recordsPerPage)
				}, Configuration.defaultPaginationSettings));
			}
		,	'GlobalViews.ShowCurrentPage': function ()
			{
				return new GlobalViewsShowingCurrentView({
					items_per_page: this.collection.recordsPerPage
		 		,	total_items: this.collection.totalRecordsFound
				,	total_pages: Math.ceil(this.collection.totalRecordsFound / this.collection.recordsPerPage)
				});
			}

		,	'Order.History.Results': function () // 22-06-19
			{
				var self = this
				,	records_collection = new Backbone.Collection(this.collection.map(function (order)
					{
						var dynamic_column;

						if (self.isSCISIntegrationEnabled)
						{
							dynamic_column = {
								label: _('Origin:').translate()
							,	type: 'origin'
							,	name: 'origin'
							,	value: _.findWhere(Configuration.get('transactionRecordOriginMapping'), { origin: order.get('origin') }).name
							};
						}
						// else
						// {
						// 	dynamic_column = {
						// 		label: _('Status:').translate()
						// 	,	type: 'status'
						// 	,	name: 'status'
						// 	,	value: order.get('status').name
						// 	};
						// }
						var status_value='';       //23/08/2019 Saad
						var clearstatus=order.get('clearstatus');
						var tranline_status=order.get('tranline_status')
						var interalid_url=order.get('internalid')//.split('_')[1]
						if(clearstatus)
						{
							status_value='clear';
						}

						else if(tranline_status)
						{
							status_value='red';
						}
						else
						{
							status_value='green';
						}

						var tempDateNeeded =  new Date(order.get('dateneeded'));
						var mo = (parseFloat(tempDateNeeded.getMonth())+1);
						var order_date_needed = mo+"/"+tempDateNeeded.getDate()+"/"+tempDateNeeded.getFullYear();


						var columns = [
							{
								label: _('Select:').translate()
							,	type: 'checkbox'
							,	name: 'downloadfile_'+order.get('so_id')
							}
						,
							{
								label: _('Date:').translate()
							,	type: 'date'
							,	name: 'date_'+order.get('so_id')
							,	value: order.get('trandate')
							}

						,	{
								label: _('Order#').translate()
							,	type: 'order'
							,	name: 'order_'+order.get('so_id')
							,	value: order.get('so_id')
							}
						,	{
								label: _('Client').translate()
							,	type: 'client'
							,	name: 'client_'+order.get('so_id')
							,	value: order.get('customer_name')
							}
						,	{
								label: _('Item').translate()
							,	type: 'item'
							,	name: 'item_'+order.get('so_id')
							,	value: order.item
							}

						,	{
								label: _('Fabric').translate()
							,	type: 'fabric'
							,	name: 'fabric_'+order.get('so_id')
							,	value: order.get('fabricstatus')
							}
						,	{
								label: _('Status').translate()
							,	type: 'status'
							,	name: 'cmtstatus_'+order.get('so_id')
							,	value: order.get('cmtstatus')
							}
							,	{
								label: _('Date Needed').translate()
							,	type: 'date'
							,	name: 'dateneeded_'+order.get('so_id')
							,	value: order_date_needed
							,	date_needed:true
							}
						,	{
								label: _('Status').translate()
							,	type: 'image'
							,	name: 'status_'+order.get('so_id')
							,	value: status_value
							,	status_image: true
							}
						,	{
								label: _('Flag').translate()
							,	type: 'checkbox'
							,	name: 'flag'
							,	value: order.get('custcol_flag')
							}
						];
						if (!_.isUndefined(dynamic_column))
						{
						columns.push(dynamic_column);
						}

						//23/08/2019 Saad
						var model = new Backbone.Model({title: new Handlebars.SafeString(_('<span class="tranid">View</span>').translate(order.get('tranid')))
							,	touchpoint: 'customercenter'
							,	detailsURL: '/purchases/view/' + order.get('recordtype')  + '/' + order.get('internalid1')//.split('_')[1]  //25-06-2019
							,	recordType: order.get('recordtype')
							,	id: order.get('internalid')//.split('_')[1]
							,	internalid: order.get('internalid')//.split('_')[1]
							//,	trackingNumbers: order.get('trackingnumbers')
							,	columns: columns
							});

						return model;
					}));

				return new BackboneCollectionView({
					childView: OrderHistoryRecordsView
				,	collection: records_collection
				,	viewsPerRow: 1
				,	childViewOptions: {
						actionView: OrderHistoryListTrackingNumberView
					,	actionOptions: {
							showContentOnEmpty: true
						,	contentClass: ''
						,	collapseElements: true
						}
					}
				});
			}
		}

		//@method getContext @return OrderHistory.List.View.Context
	,	getContext: function ()
		{
			var dummydate = this.startdate.split('-');
			var s_date ="",e_date="",c_date="";
			if(dummydate[0])
				s_date = dummydate[1]+'/'+dummydate[0]+'/'+dummydate[2];
			dummydate = this.enddate.split('-')
			if(dummydate[0])
				e_date = dummydate[1]+'/'+dummydate[0]+'/'+dummydate[2];
			dummydate = this.cmtdate.split('-')
			if(dummydate[0])
				c_date = dummydate[1]+'/'+dummydate[0]+'/'+dummydate[2];
			//@class OrderHistory.List.View.Context
			return {

				searchvalue:this.search          //01/07/2019 Saad
			, startdate : s_date
			, enddate : e_date
			, cmtstatus : this.cmtstatus
			, cmtdate: c_date
				//@property {String} pageHeader
			,	pageHeader: this.page_header
				//@property {Boolean} collectionLengthGreaterThan0
			,	collectionLengthGreaterThan0: this.collection.length > 0
				//@property {Boolean} isLoading
			,	isLoading: this.isLoading
				// @property {Boolean} showPagination
			,	showPagination: !!(this.collection.totalRecordsFound && this.collection.recordsPerPage)
				// @property {Boolean} showCurrentPage
			,	showCurrentPage: this.options.showCurrentPage
				//@property {Boolean} showBackToAccount
			,	showBackToAccount: Configuration.get('siteSettings.sitetype') === 'STANDARD'
				//@property {Boolean} isSCISIntegrationEnabled
			,	isSCISIntegrationEnabled: this.isSCISIntegrationEnabled
				//@property {Boolean} allIsActive
			,	allIsActive: this.options.activeTab === 'all'
				//@property {Boolean} openIsActive
			,	openIsActive: this.options.activeTab === 'open'
				//@property {Boolean} inStoreIsActive
			,	inStoreIsActive: this.options.activeTab === 'instore'
			};
		}
	});

});
