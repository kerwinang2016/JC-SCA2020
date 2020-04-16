/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// OrderHistory.Model.js
// ----------
// Handles fetching orders
define(                                     //23/06/2019 Saad          //   26/06/2019 Saad
	'OrderHistory.Model'
,	[
		'Application'
	,	'Utils'
	,	'StoreItem.Model'
	,	'Transaction.Model'
	,	'Transaction.Model.Extensions'
	,	'SiteSettings.Model'
	,	'SC.Model'
	,	'ReturnAuthorization.Model'
	,	'ExternalPayment.Model'
	,	'Models.Init'
	,	'Configuration'
	,	'underscore'
	]
,	function (
		Application
	,	Utils
	,	StoreItem
	,	Transaction
	,	TransactionModelExtensions
	,	SiteSettings
	,	SCModel
	,	ReturnAuthorization
	,	ExternalPayment
	,	ModelsInit
	,	Configuration
	,	_
	)
{
	'use strict';

	return Transaction.extend({

		name: 'OrderHistory'

	,	isPickupInStoreEnabled: SiteSettings.isPickupInStoreEnabled()

	,	isSCISIntegrationEnabled: SiteSettings.isSCISIntegrationEnabled()

	,	setExtraListColumns: function ()
		{
			this.columns.so_id = new nlobjSearchColumn('custcol_so_id');
			this.columns.customer_name = new nlobjSearchColumn('custbody_customer_name');
			this.columns.trandate = new nlobjSearchColumn('trandate');
			this.columns.item = new nlobjSearchColumn('item');
			this.columns.date_needed = new nlobjSearchColumn('custcol_avt_date_needed');
			this.columns.expected_delivery_date = new nlobjSearchColumn('custcol_expected_delivery_date');
			this.columns.fabric_status = new nlobjSearchColumn('custcol_avt_fabric_status');
			this.columns.cmt_status = new nlobjSearchColumn('custcol_avt_cmt_status');
			this.columns.flag = new nlobjSearchColumn('custcol_flag');
			this.columns.flag_comment = new nlobjSearchColumn('custcol_flag_comment');
			this.columns.trackingnumbers = new nlobjSearchColumn('trackingnumbers');
			this.columns.cmt_status_text=new nlobjSearchColumn('custcol_avt_cmt_status_text');
			this.columns.avt_fabric_text=new nlobjSearchColumn('custcol_avt_fabric_text');
			this.columns.cmt_production_time=new nlobjSearchColumn('custcol_cmt_production_time');
			this.columns.avt_tracking=new nlobjSearchColumn('custcol_avt_tracking');
			this.columns.avt_solinestatus=new nlobjSearchColumn('custcol_avt_solinestatus');
			this.columns.avt_saleorder_line_key=new nlobjSearchColumn('custcol_avt_saleorder_line_key');
			this.columns.avt_cmt_tracking=new nlobjSearchColumn('custcol_avt_cmt_tracking');
			this.columns.fabric_delivery_days=new nlobjSearchColumn('custcol_fabric_delivery_days');
			this.columns.custom_fabric_details=new nlobjSearchColumn('custcol_custom_fabric_details');
			this.columns.custcol_producttype=new nlobjSearchColumn('custcol_producttype');
			this.columns.custcol_tailor_client=new nlobjSearchColumn('custcol_tailor_client');
			this.columns.datesent = new nlobjSearchColumn('custcol_avt_cmt_date_sent');
			this.columns.custcol_expected_production_date = new nlobjSearchColumn('custcol_expected_production_date');
			this.columns.custcol_tailor_delivery_days = new nlobjSearchColumn('custcol_tailor_delivery_days');

			if (!this.isSCISIntegrationEnabled)
			{
				return;
			}

			this.columns.origin = new nlobjSearchColumn('formulatext');

			this.columns.origin.setFormula('case when LENGTH({source})>0 then 2 else (case when {location.locationtype.id} = \'' + Configuration.get('locationTypeMapping.store.internalid') + '\' then 1 else 0 end) end');
		}
	,	setExtraListFilters: function ()
		{
			// this.filters.vendor_filter = ['item.vendor', 'noneof', 'jerom']
			if (this.data.filter === 'status:open') // Status is open and this is only valid for Sales Orders.
			{
				this.filters.type_operator = 'and';
				this.filters.type = ['type', 'anyof', ['SalesOrd']];
				this.filters.status_operator = 'and';
				this.filters.status = ['status', 'anyof', ['SalesOrd:A', 'SalesOrd:B', 'SalesOrd:D', 'SalesOrd:E', 'SalesOrd:F']];
				this.filters.category_operator = 'and';
				this.filters.item_category = ['custcol_itm_category_url', 'isnot', ''];
			}
			else if (this.isSCISIntegrationEnabled)
			{
				if (this.data.filter === 'origin:instore') // SCIS Integration enabled, only In Store records (Including Sales Orders from SCIS)
				{
					this.filters.scisrecords_operator = 'and';
					this.filters.scisrecords = [
						['type', 'anyof', ['CashSale','CustInvc', 'SalesOrd']]
					,	'and'
					,	['createdfrom.type', 'noneof', ['SalesOrd']]
					,	'and'
					,	[ 'location.locationtype', 'is', Configuration.get('locationTypeMapping.store.internalid') ]
					,	'and'
					,	['source', 'is', '@NONE@']
					,	'and'
					,	['custcol_itm_category_url', 'isnot', '']
					];
				}
				else // SCIS Integration enabled, all records
				{
					this.filters.scisrecords_operator = 'and';
					this.filters.scisrecords = [
						[
							['type', 'anyof', ['CashSale','CustInvc']]
						,	'and'
						,	['createdfrom.type', 'noneof', ['SalesOrd']]
						,	'and'
						,	[ 'location.locationtype', 'is', Configuration.get('locationTypeMapping.store.internalid') ]
						,	'and'
						,	['source', 'is', '@NONE@']
						,	'and'
						,	['custcol_itm_category_url', 'isnot', '']
						]
					,	'or'
					,	[
							['type', 'anyof', ['SalesOrd']]
						]
					];
				}
			}
			else // SCIS Integration is disabled, show all the Sales Orders
			{
				this.filters.type_operator = 'and';
				this.filters.type = ['type', 'anyof', ['SalesOrd']];
				this.filters.category_operator = 'and';
				this.filters.item_category = ['custcol_itm_category_url', 'isnot', ''];
			}
		}

				//@method list Allow search among transactions
		//@param {Transaction.Model.List.Parameters} data
		//@return {Transaction.Model.List.Result}
		,	list: function (data)
		{
			var url = nlapiResolveURL('SUITELET','customscript_myaccountsuitelet',1,true);
			var parameters = "&action=getordersV2&user="+data.parent;
			nlapiLogExecution('debug','data',JSON.stringify(data));
      if(data.page)
        parameters += "&page="+ data.page;
				if(data.search){
					if(data.search.indexOf('SO-') != -1){
							parameters += "&soid="+data.search;
					}else{
							parameters += "&clientname="+data.client_name;
					}
				}

      if(data.sort)
        parameters += "&sort="+data.sort;
      // if(data.client_id)
      //   parameters += "&clientid="+data.client_id;
      if(data.cmtstatus)
        parameters += "&cmtstatus="+data.cmtstatus;
      if(data.startdate){
				var s_date = data.startdate.split('-').join('/');
				parameters += "&startdate="+s_date;
			}
      if(data.enddate){
				var e_date = data.enddate.split('-').join('/');
				parameters += "&enddate="+e_date;
			}
      if(data.cmtdate)
        parameters += "&cmtdate="+data.cmtdate.split('-').join('/');

			var res = nlapiRequestURL(url + parameters);
			return JSON.parse(res.getBody());

			// this.preList();
			// var self = this;
			//
			// this.data = data;
			// this.amountField = this.isMultiCurrency ? 'fxamount' : 'amount';
			//
			// var sortid = this.data.sort_list;				//29/08/2019 Saad Saad
			// if(this.data.client_id){
			// 	this.data.client_name = this.data.client_name.replace('%', ' ');
			// 	this.filters = {
			// 			'entity': ['entity', 'is', nlapiGetUser()]
			// 		,	'mainline_operator': 'and'
			// 		,	'mainline': ['mainline','is', 'F']
			// 		,	'client_operator': 'and'
			// 		,	'client_name': ['custcol_tailor_client_name', 'contains', this.data.client_name]
			// 	};
			// } else if(this.data.search_so_id ) {
			// 	this.filters = {
			// 			'entity': ['entity', 'is', nlapiGetUser()]
			// 		,	'mainline_operator': 'and'
			// 		,	'mainline': ['mainline','is', 'F']
			// 		,	'client_operator': 'and'
			// 		,	'client_soid': ['custcol_so_id', 'contains', this.data.search_so_id]
			// 	};
			// } else if(this.data.client_name) {
			// 		this.data.client_name = this.data.client_name.replace('%', ' ');
			// 		this.filters = {
			// 				'entity': ['entity', 'is', nlapiGetUser()]
			// 			,	'mainline_operator': 'and'
			// 			,	'mainline': ['mainline','is', 'F']
			// 			,	'client_operator': 'and'
			// 			,	'client_name': ['custcol_tailor_client_name', 'contains', this.data.client_name]
			// 		};
			// 	} else if(sortid) {			//29/08/2019 Saad Saad
			// 		this.filters = {
			// 				'entity': ['entity', 'is', nlapiGetUser()]
			// 			,	'mainline_operator': 'and'
			// 			,	'mainline': ['mainline','is', 'F']
			// 			,	'client_operator': 'and'
			// 			,	'so_status': ['status', 'anyof', ['SalesOrd:D','SalesOrd:E','SalesOrd:F','SalesOrd:B','SalesOrd:G']]
			// 		};
			//
			// 	} else if(this.data.types == 'CustInvc') {
			// 		this.filters = {
			// 			'entity': ['entity', 'is', nlapiGetUser()]
			// 			,	'mainline_operator': 'and'
			// 			,	'mainline': ['mainline','is', 'T']
			// 		};
			//
			// 	} else {
			// 	this.filters = {
			// 		'entity': ['entity', 'is', nlapiGetUser()]
			// 	,	'mainline_operator': 'and'
			// 	,	'mainline': ['mainline','is', 'F']
			// 	};
			//
			// }
			// this.columns = {
			// 		'trandate': new nlobjSearchColumn('trandate')
			// 	,	'internalid': new nlobjSearchColumn('internalid')
			// 	,	'tranid': new nlobjSearchColumn('tranid')
			// 	,	'status': new nlobjSearchColumn('status')
			// 	,	'amount': new nlobjSearchColumn(this.amountField)
			// 	};
			//
			// if (this.isMultiCurrency)
			// {
			// 	this.columns.currency = new nlobjSearchColumn('currency');
			// }
			//
			// if (this.data.from && this.data.to)
			// {
			// 	this.filters.date_operator = 'and';
			//
			// 	this.data.from = this.data.from.split('-');
			// 	this.data.to = this.data.to.split('-');
			//
			// 	this.filters.date = [
			// 		'trandate', 'within'
			// 	,	new Date(
			// 			this.data.from[0]
			// 		,	this.data.from[1]-1
			// 		,	this.data.from[2]
			// 		)
			// 	,	new Date(
			// 			this.data.to[0]
			// 		,	this.data.to[1]-1
			// 		,	this.data.to[2]
			// 		)
			// 	];
			// }
			// else if (this.data.from)
			// {
			// 	this.filters.date_from_operator = 'and';
			//
			// 	this.data.from = this.data.from.split('-');
			//
			// 	this.filters.date_from = [
			// 		'trandate'
			// 	,	'onOrAfter'
			// 	,	new Date(
			// 			this.data.from[0]
			// 		,	this.data.from[1]-1
			// 		,	this.data.from[2]
			// 		)
			// 	];
			// }
			// else if (this.data.to)
			// {
			// 	this.filters.date_to_operator = 'and';
			//
			// 	this.data.to = this.data.to.split('-');
			//
			// 	this.filters.date_to = [
			// 		'trandate'
			// 	,	'onOrBefore'
			// 	,	new Date(
			// 			this.data.to[0]
			// 		,	this.data.to[1]-1
			// 		,	this.data.to[2]
			// 		)
			// 	];
			// }
			//
			// if (this.data.internalid)
			// {
			// 	this.data.internalid  = _.isArray(this.data.internalid) ? this.data.internalid : this.data.internalid.split(',');
			// 	this.filters.internalid_operator = 'and';
			// 	this.filters.internalid  =  ['internalid', 'anyof', this.data.internalid];
			// }
			//
			// if (this.data.createdfrom)
			// {
			// 	this.filters.createdfrom_operator = 'and';
			// 	this.filters.createdfrom = ['createdfrom', 'is', this.data.createdfrom];
			// }
			//
			// if (this.data.types)
			// {
			// 	this.filters.types_operator = 'and';
			// 	this.filters.types = ['type', 'anyof', this.data.types.split(',')];
			// }
			//
			// if (this.isMultiSite)
			// {
			//
			// 	var site_id = 2 //ModelsInit.session.getSiteSettings(['siteid']).siteid //changed by salman 25-nov-2019 (Get data created on old site)
			// 	,	filter_site = Configuration.get('filterSite') || Configuration.get('filter_site')
			// 	,	search_filter_array = null;
			//
			// 	if (_.isString(filter_site) && filter_site === 'current')
			// 	{
			// 		search_filter_array = [site_id, '@NONE@'];
			// 	}
			// 	else if (_.isString(filter_site) && filter_site === 'all')
			// 	{
			// 		search_filter_array = [];
			// 	}
			// 	else if (_.isArray(filter_site))
			// 	{
			// 		search_filter_array = filter_site;
			// 		search_filter_array.push('@NONE@');
			// 	}
			// 	else if (_.isObject(filter_site) && filter_site.option)
			// 	{
			// 		switch (filter_site.option)
			// 		{
			// 			case 'all' :
			// 				search_filter_array = [];
			// 				break;
			// 			case 'siteIds' :
			// 				search_filter_array = filter_site.ids;
			// 				break;
			// 			default : //case 'current' (current site) is configuration default
			// 				search_filter_array = [site_id, '@NONE@'];
			// 				break;
			// 		}
			// 	}
			//
			// 	if (search_filter_array && search_filter_array.length)
			// 	{
			// 		this.filters.site_operator = 'and';
			// 		this.filters.site = ['website', 'anyof', _.uniq(search_filter_array)];
			// 	}
			// }
			//
			// this.setExtraListFilters();
			//
			// if (this.isCustomColumnsEnabled())
			// {
			// 	this.setCustomColumns();
			// }
			//
			// this.setExtraListColumns();
			//
			// if (this.data.sort)
			// {
			// 	_.each(this.data.sort.split(','), function (column_name)
			// 	{
			// 		if (self.columns[column_name])
			// 		{
			// 			self.columns[column_name].setSort(self.data.order >= 0);
			// 		}
			// 	});
			// }
			//
			//
			// //Salman Start 9/3/2019 Saad
			// if (this.data.page === 'all' || sortid == 'true')
			// {
			// 	this.search_results = Application.getAllSearchResults('transaction', _.values(this.filters), _.values(this.columns));
			// }
			// else
			// {
			// 	this.search_results = Application.getAllPaginatedSearchResults({
			// 		record_type: 'transaction'
			// 	,	filters: _.values(this.filters)
			// 	,	columns: _.values(this.columns)
			// 	,	page: this.data.page || 1
			// 	,	results_per_page : this.data.results_per_page || Configuration.get('suitescriptResultsPerPage')
			// 	});
			//
			// }
			//
			// var records = _.map(((this.data.page === 'all' || sortid == 'true') ? this.search_results : this.search_results.records) || [], function (record)
			// {
			// 	var selected_currency = Utils.getCurrencyById(record.getValue('currency'))
			// 	,	selected_currency_symbol = selected_currency ? selected_currency.symbol : selected_currency;
			//
			// 	//@class Transaction.Model.List.Result.Record
			// 	var result = {
			// 		//@property {String} recordtype
			// 		recordtype: record.getRecordType()
			// 		//@property {String} internalid
			// 	,	internalid: record.getValue('internalid')
			// 		//@property {String} tranid
			// 	,	tranid: record.getValue('tranid')
			// 		//@property {String} trandate
			// 	,	trandate: record.getValue('trandate')
			// 		//@property {Transaction.Status} status
			// 	,	status: {
			// 			//@class Transaction.Status
			// 			//@property {String} internalid
			// 			internalid: record.getValue('status')
			// 			//@property {String} name
			// 		,	name: record.getText('status')
			// 		}
			// 		//@class Transaction.Model.List.Result.Record
			// 		//@property {Number} amount
			// 	,	amount: Utils.toCurrency(record.getValue(self.amountField))
			// 		//@property {Currency?} currency
			// 	,	currency: self.isMultiCurrency ?
			// 		//@class Currency
			// 		{
			// 			//@property {String} internalid
			// 			internalid: record.getValue('currency')
			// 			//@property {String} name
			// 		,	name: record.getText('currency')
			// 		} : null
			// 		//@property {String} amount_formatted
			// 	,	amount_formatted: Utils.formatCurrency(record.getValue(self.amountField), selected_currency_symbol)
			// 	,	so_id: record.getValue('custcol_so_id')
			// 	,	customer_name: record.getValue('custbody_customer_name')
			// 	, 	item: record.getText('item')
			// 	,	date_needed: record.getValue('custcol_avt_date_needed')
			// 	,	fabric_status: record.getValue('custcol_avt_fabric_status')
			// 	,	cmt_status: record.getValue('custcol_avt_cmt_status')
			// 	,	flag: record.getValue('custcol_flag')
			//
			// 	};
			// 	return self.mapListResult(result, record);
			//
			// });
			//
			// var results_per_page =  this.data.results_per_page || Configuration.get('suitescriptResultsPerPage');
			// var pageNumber = parseInt(this.data.page);
			// if (this.data.page === 'all') {
			// this.results = records;
			// }
			// else if(data.recordtype == 'salesorder'){
			// 	if(data.sort == 'true'){
			// 	records.sort(function(a,b){
			// 		return (a.tranline_status === b.tranline_status )? 0 : a.tranline_status? -1 : 1;
			// 	});
			// 	records.sort(function(a,b){
			// 		return (a.clearstatus === b.clearstatus)? 0 : a.clearstatus? 1: -1;
			// 	})
			// 	records.sort(function(a,b){
			// 		return (a.custcol_flag === b.custcol_flag)? 0 : a.custcol_flag == 'F'? 1 : -1
			// 	});
			// 	}
			// 	var range_start = (pageNumber * results_per_page) - results_per_page
			// 	,	range_end = pageNumber * results_per_page
			// 	,	resultData = records.slice(range_start, range_end)
			// 	,	objResultData = {};
			// 	objResultData.page = pageNumber;
			// 	objResultData.recordsPerPage = results_per_page;
			// 	objResultData.records = resultData;
			// 	objResultData.totalRecordsFound = records.length;
			//
			// 	this.results = objResultData;
			// 	this.results.records = resultData;
			//
			// } else {
			//
			// 	this.results = this.search_results;
			// 	this.results.records = records;
			// }
			//
			// //Salman end 9/3/2019 Saad
			// this.postList();
			// return this.results;
			// // @class Transaction.Model

		}

		,	mapListResult: function (result, record)            //25-06-2019
		{

			result = result || {};
			result.trackingnumbers = record.getValue('trackingnumbers') ? record.getValue('trackingnumbers').split('<BR>') : null;
			result.dateneeded = record.getValue('custcol_avt_date_needed');//this
			result.expdeliverydate = record.getValue('custcol_expected_delivery_date');
			result.fabricstatus = record.getValue('custcol_avt_fabric_status');
			result.cmtstatus = record.getValue('custcol_avt_cmt_status');
			result.datesent = record.getValue('custcol_avt_cmt_date_sent');
			result.custcol_flag_comment = record.getValue('custcol_flag_comment');
			result.custcol_flag = record.getValue('custcol_flag');
			result.custcol_expected_production_date = record.getValue('custcol_expected_production_date');//this
			var cmtstatuscheck = false;
			var fabstatuscheck = false, expFabDateNeeded, dateNeeded, confirmedDate;
			result.custcol_tailor_delivery_days = record.getValue('custcol_tailor_delivery_days');
			var today = new Date();
			var cmtstatustext = "";
			result.customitemtext = record.getText('item');
			result.custcol_custom_fabric_details = record.getValue('custcol_custom_fabric_details');

				if(record.getValue('item') == '28034' ||
						record.getValue('item') == '28035' ||
						record.getValue('item') == '28030' ||
						record.getValue('item') == '28033' ||
						record.getValue('item') == '28036' ||
						record.getValue('item') == '28031' ||
						record.getValue('item') == '28032'){
							if(result.custcol_custom_fabric_details){   //25/07/2019 Saad
								var custcol_custom_fabric_details_json = JSON.parse(result.custcol_custom_fabric_details);
								if(custcol_custom_fabric_details_json)
								result.customitemtext = result.customitemtext.replace('CMT Item',custcol_custom_fabric_details_json.collection+'-'+custcol_custom_fabric_details_json.code);
							}
				}
				if(record.getValue('custcol_producttype')){
					result.customitemtext += ' - ' + record.getValue('custcol_producttype');
				}
				today.setHours(0);
				today.setMinutes(0);
				today.setSeconds(0);
				if (result.cmtstatus) {
					cmtstatustext += record.getText('custcol_avt_cmt_status');
				}
				var morethan10days = false;
				var clearstatus = false;
				if (result.datesent) {
					if (cmtstatustext != "") cmtstatustext += '-';
					var cDate = nlapiStringToDate(result.datesent);
					cDate.setDate(cDate.getDate());
					result.datesent = nlapiDateToString(cDate);
					cmtstatustext += result.datesent;

					if((today - cDate) > 863999146){
						morethan10days = true;
					}
				}
				else if (result.custcol_expected_production_date) {
					if (cmtstatustext != "") cmtstatustext += '-';
					cmtstatustext += result.custcol_expected_production_date;
					var cmtstatdate = nlapiStringToDate(result.custcol_expected_production_date);
					if((today - cmtstatdate) > 863999146){
						morethan10days = true;
					}
				}
				if (record.getValue('custcol_avt_cmt_tracking')) {
					if (cmtstatustext != "") cmtstatustext += '-';
					cmtstatustext += record.getValue('custcol_avt_cmt_tracking');
				}
				if((record.getText('status') == 'Cancelled' || record.getText('status') == 'Closed')//|| record.getText('status') == 'Billed'  Removed Billed
				|| ((record.getText('custcol_avt_cmt_status') == 'Delivered' ||
				record.getText('custcol_avt_cmt_status') == 'Left factory') && morethan10days)){
					clearstatus = true;
				}
				if ((result.cmtstatus == 7 || result.cmtstatus == 8) && result.fabricstatus != 1) {

					//check the dates of the fabric should be sent vs today
					if (result.custcol_expected_production_date) {
						expFabDateNeeded = nlapiStringToDate(result.custcol_expected_production_date);
						expFabDateNeeded.setDate(expFabDateNeeded.getDate() - parseFloat(record.getValue('custcol_cmt_production_time')));

						if (expFabDateNeeded < today)
						{
							fabstatuscheck = true;
						}


						else
							fabstatuscheck = false;

					}
					else {
						fabstatuscheck = false;

				}
				}
				else if (result.fabricstatus == 1) {
					fabstatuscheck = true;

				}
				else {
					fabstatuscheck = false;

				}
				if (result.cmtstatus == 4) {
					cmtstatuscheck = true;
				} else if (result.dateneeded) {
					result.dateNeeded = nlapiStringToDate(result.dateneeded)
					if (result.datesent) {
						confirmedDate = nlapiStringToDate(result.datesent);
						confirmedDate.setDate(confirmedDate.getDate() + parseFloat(result.custcol_tailor_delivery_days ? result.custcol_tailor_delivery_days : 0));
					}
					else if (result.custcol_expected_production_date) {
						confirmedDate = nlapiStringToDate(result.custcol_expected_production_date);
						confirmedDate.setDate(confirmedDate.getDate() + parseFloat(result.custcol_tailor_delivery_days ? result.custcol_tailor_delivery_days : 0));
					}

					if (confirmedDate) {
						if (confirmedDate > result.dateNeeded){
							cmtstatuscheck = true;
						}
						else
						cmtstatuscheck = false;
					} else {
						cmtstatuscheck = false
					}

				} else {
					cmtstatuscheck = false;
				}

				if (record.getValue('custcol_avt_date_needed')) {
					result.dateneeded = nlapiStringToDate(record.getValue('custcol_avt_date_needed'));
					result.dateneeded = result.dateneeded.getFullYear() + '-' + ('0' + (result.dateneeded.getMonth() + 1)).slice(-2) + '-' +
						('0' + result.dateneeded.getDate()).slice(-2);
				}
				var status = true;

				if (this.isSCISIntegrationEnabled)
				{
					result.origin = parseInt(record.getValue(this.columns.origin), 10);
				}

				result.internalid=new Date().getTime() + Math.floor(Math.random() * 999999999999999999) + '_' + record.getValue('internalid')
				result.internalid1= record.getValue('internalid')
				result.date= record.getValue('trandate')
				result.order_number= record.getValue('tranid')
				result.status= record.getText('status')
				result.clearstatus=clearstatus


				result.trackingnumbers= record.getValue('trackingnumbers') ? record.getValue('trackingnumbers').split('<BR>') : null
				result.type= record.getRecordType()
				result.client_name= record.getValue('custbody_customer_name')
				result.so_id= record.getValue('custcol_so_id')
				result.item= result.customitemtext
				result.custcol_flag= result.custcol_flag
				result.custcol_flag_comment= result.custcol_flag_comment
				result.custcol_avt_date_needed= result.dateneeded
				result.tranline_status= cmtstatuscheck || fabstatuscheck//record.getText('custcol_avt_solinestatus')
				result.fabricstatus= record.getValue('custcol_avt_fabric_text')
				result.cmtstatus= cmtstatustext
				result.solinekey= record.getValue('custcol_avt_saleorder_line_key')
				result.tailor_client=record.getValue('custcol_tailor_client')

				return result;
		}

,	saveLine: function(options){
		var recid = options.solinekey.split('_')[0];
		var url = nlapiResolveURL('SUITELET','customscript_update_date_needed',1,true);
		nlapiRequestURL(url + "&recid="+ recid + '&so_id=' + options.so_id + '&custcol_avt_date_needed=' + options.custcol_avt_date_needed + '&custcol_flag='+options.custcol_flag +'&custcol_flag_comment='+options.custcol_flag_comment);

		'use strict';
	}
	,	getExtraRecordFields: function ()
		{
			this.getReceipts();

			this.getReturnAuthorizations();

			var origin = 0
			,	applied_to_transaction;


			if (this.isSCISIntegrationEnabled && !this.record.getFieldValue('source') && this.record.getFieldValue('location') && nlapiLookupField(this.result.recordtype, this.result.internalid, 'location.locationtype') === Configuration.get('locationTypeMapping.store.internalid'))
			{
				origin = 1; //store
			}
			else if (this.record.getFieldValue('source'))
			{
				origin = 2; //online
			}

			this.result.origin = origin;

			if (this.result.recordtype === 'salesorder')
			{
				applied_to_transaction = _(_.where(this.result.receipts || [], {recordtype: 'invoice'})).pluck('internalid');
			}
			else if (this.result.recordtype === 'invoice')
			{
				applied_to_transaction = [this.result.internalid];
			}

			this.getFulfillments();

			if (applied_to_transaction && applied_to_transaction.length)
			{
				this.getAdjustments({paymentMethodInformation: true, appliedToTransaction: applied_to_transaction});
			}

			this.result.ismultishipto = this.record.getFieldValue('ismultishipto') === 'T';

			this.getLinesGroups();

			this.result.custbody_so_created_by = this.record.getFieldText('custbody_so_created_by');  //12/11/2019 Umar Zulfiqar

			this.result.receipts = _.values(this.result.receipts);

			//@property {Boolean} isReturnable
			this.result.isReturnable = this.isReturnable();

			this.getPaymentEvent();

			//@property {Boolean} isCancelable
			this.result.isCancelable = this.isCancelable();
		}

	,	getTerms: function ()
		{
			var terms = nlapiLookupField(this.result.recordtype, this.result.internalid, 'terms');

			if (terms)
			{
				return {
					//@property {String} internalid
					internalid: terms
					//@property {String} name
				,	name: nlapiLookupField(this.result.recordtype, this.result.internalid, 'terms', true)
				};
			}

			return null;
		}

	,	getStatus: function ()
		{
			this.result.status =
			{
				internalid: nlapiLookupField(this.result.recordtype, this.result.internalid, 'status')
			,	name: nlapiLookupField(this.result.recordtype, this.result.internalid, 'status', true)
			};
		}
	,	getLinesGroups: function ()
		{
			var self = this;

			_.each(this.result.lines, function (line)
			{
				var line_group_id = '';

				if (self.result.recordtype === 'salesorder')
				{
					if ( (self.isPickupInStoreEnabled && line.fulfillmentChoice === 'pickup') || (!self.result.ismultishipto && (!line.isfulfillable || !self.result.shipaddress)) || (self.result.ismultishipto && (!line.shipaddress || !line.shipmethod)))
					{

						if ( (self.isSCISIntegrationEnabled && self.result.origin === 1) || (self.isPickupInStoreEnabled && line.fulfillmentChoice === 'pickup') )
						{
							line_group_id = 'instore';
						}
						else
						{
							line_group_id = 'nonshippable';
						}
					}
					else
					{
						line_group_id = 'shippable';
					}
				}
				else
				{
					line_group_id = 'instore';
				}

				line.linegroup = line_group_id;
			});

		}
	 ,	getFulfillments: function ()
		{
			if (this.result.recordtype !== 'salesorder')
			{
				var location = this.record.getFieldValue('location');

				_.each(this.result.lines, function (line)
				{
					line.quantityfulfilled = line.quantity;
					line.location = location;
				});

				return;
			}


			this.result.fulfillments = {};

			var self = this
			,	filters = [
					new nlobjSearchFilter('internalid', null, 'is', this.result.internalid)
				,	new nlobjSearchFilter('mainline', null, 'is', 'F')
				,	new nlobjSearchFilter('shipping', null, 'is', 'F')
				,	new nlobjSearchFilter('taxline', null, 'is', 'F')
				]
			,	columns = [
					new nlobjSearchColumn('line')
				,	new nlobjSearchColumn('fulfillingtransaction')
				,	new nlobjSearchColumn('quantityshiprecv')

				,	new nlobjSearchColumn('actualshipdate')
				,	new nlobjSearchColumn('quantity','fulfillingtransaction')
				,	new nlobjSearchColumn('item','fulfillingtransaction')
				,	new nlobjSearchColumn('shipmethod','fulfillingtransaction')
				,	new nlobjSearchColumn('shipto','fulfillingtransaction')
				,	new nlobjSearchColumn('trackingnumbers','fulfillingtransaction')
				,	new nlobjSearchColumn('trandate','fulfillingtransaction')
				,	new nlobjSearchColumn('status','fulfillingtransaction')

					// Ship Address
				,	new nlobjSearchColumn('shipaddress','fulfillingtransaction')
				,	new nlobjSearchColumn('shipaddress1','fulfillingtransaction')
				,	new nlobjSearchColumn('shipaddress2','fulfillingtransaction')
				,	new nlobjSearchColumn('shipaddressee','fulfillingtransaction')
				,	new nlobjSearchColumn('shipattention','fulfillingtransaction')
				,	new nlobjSearchColumn('shipcity','fulfillingtransaction')
				,	new nlobjSearchColumn('shipcountry','fulfillingtransaction')
				,	new nlobjSearchColumn('shipstate','fulfillingtransaction')
				,	new nlobjSearchColumn('shipzip','fulfillingtransaction')
				,	new nlobjSearchColumn('altname','custbody_so_created_by')      //26/06/2019 Saad

				];

			var pick_pack_ship_is_enabled = !!Utils.isFeatureEnabled('PICKPACKSHIP');

			if (pick_pack_ship_is_enabled)
			{
				columns.push(new nlobjSearchColumn('quantitypicked'));
				columns.push(new nlobjSearchColumn('quantitypacked'));
			}

			Application.getAllSearchResults('salesorder', filters, columns).forEach(function (ffline)
			{
				var fulfillment_id = ffline.getValue('fulfillingtransaction')
				,	line_internalid = self.result.internalid + '_' + ffline.getValue('line')
				,	createdby = ffline.getValue('altname','custbody_so_created_by')       //  26/06/2019 Saad
				,	line = _.findWhere(self.result.lines, {internalid: line_internalid});

				if (fulfillment_id)
				{
					var shipaddress = self.addAddress({
							internalid: ffline.getValue('shipaddress', 'fulfillingtransaction')
						,	country: ffline.getValue('shipcountry', 'fulfillingtransaction')
						,	state: ffline.getValue('shipstate', 'fulfillingtransaction')
						,	city: ffline.getValue('shipcity', 'fulfillingtransaction')
						,	zip: ffline.getValue('shipzip', 'fulfillingtransaction')
						,	addr1: ffline.getValue('shipaddress1', 'fulfillingtransaction')
						,	addr2: ffline.getValue('shipaddress2', 'fulfillingtransaction')
						,	attention: ffline.getValue('shipattention', 'fulfillingtransaction')
						,	addressee: ffline.getValue('shipaddressee', 'fulfillingtransaction')
					}, self.result);

					self.result.fulfillments[fulfillment_id] = self.result.fulfillments[fulfillment_id] || {
						internalid: fulfillment_id
					,	shipaddress: shipaddress
					,	shipmethod: self.addShippingMethod({
							internalid : ffline.getValue('shipmethod','fulfillingtransaction')
						,	name : ffline.getText('shipmethod','fulfillingtransaction')
						})
					,	date: ffline.getValue('actualshipdate')
					,createdby:createdby
					,	trackingnumbers: ffline.getValue('trackingnumbers','fulfillingtransaction') ? ffline.getValue('trackingnumbers','fulfillingtransaction').split('<BR>') : null
					,	lines: []
					,	status: {
								internalid: ffline.getValue('status','fulfillingtransaction')
							,	name: ffline.getText('status','fulfillingtransaction')
						}
					,
					};

					self.result.fulfillments[fulfillment_id].lines.push({
						internalid: line_internalid
					,	quantity: parseInt(ffline.getValue('quantity','fulfillingtransaction'), 10)
					});
				}

				if (line)
				{
					if (line.fulfillmentChoice && line.fulfillmentChoice === 'pickup')
					{
						line.quantityfulfilled = parseInt(ffline.getValue('quantityshiprecv') || 0, 10);
						line.quantitypicked = pick_pack_ship_is_enabled ? parseInt(ffline.getValue('quantitypicked') || 0, 10) - line.quantityfulfilled : 0;
						line.quantitybackordered = line.quantity - line.quantityfulfilled - line.quantitypicked;
					}
					else
					{
						line.quantityfulfilled = parseInt(ffline.getValue('quantityshiprecv') || 0, 10);
						line.quantitypacked = pick_pack_ship_is_enabled ? parseInt(ffline.getValue('quantitypacked') || 0, 10) - line.quantityfulfilled : 0;
						line.quantitypicked = pick_pack_ship_is_enabled ? parseInt(ffline.getValue('quantitypicked') || 0, 10) - line.quantitypacked - line.quantityfulfilled : 0;
						line.quantitybackordered = line.quantity - line.quantityfulfilled - line.quantitypacked - line.quantitypicked;
					}
				}
			});

			this.result.fulfillments = _.values(this.result.fulfillments);
		}

		//@method isReturnable Indicate if the current loaded transaction is returnable or not
		//@return {Boolean}
	,	isReturnable: function ()
		{
			if (this.result.recordtype === 'salesorder')
			{
				var status_id = this.record.getFieldValue('statusRef');

				return status_id !== 'pendingFulfillment' && status_id !== 'pendingApproval' && status_id !== 'closed' && status_id !== 'canceled';
			}
			else
			{
				return true;
			}
		}
	,	getReceipts: function ()
		{
			this.result.receipts = Transaction.list({
				createdfrom: this.result.internalid
			,	types: 'CustInvc,CashSale'
			,	page: 'all'
			});


		}
	,	getReturnAuthorizations: function ()
		{
			var created_from = _(this.result.receipts || []).pluck('internalid');

			created_from.push(this.result.internalid);

			this.result.returnauthorizations = ReturnAuthorization.list({
					createdfrom: created_from
				,	page: 'all'
				,	getLines: true
			});
		}
		//@method get Return one single transaction
		//@param {String} record_type
		//@param {String} id
		//@return {Transaction.Model.Get.Result}
		//This should override it. Try to make this work like a suitelet
	,	get: function (record_type, id, parent)
		{
			var self = this;

			//We have a parent.. then we need to just get the orders from the script
			this.recordId = id;
			this.recordType = record_type;

			var url = nlapiResolveURL('SUITELET','customscript_myaccountsuitelet',1,true);

			var res = nlapiRequestURL(url+"&action=getorderV2&user="+parent+"&id="+id);
			this.result = JSON.parse(res.getBody());

			// Preloads info about the item
			this.store_item = StoreItem;
			var items_to_preload = [];
			this.result.lines = _.values(this.result.lines);
			this.result.lines.forEach(function (line) {
				if(line.type != 'Markup'){
					items_to_preload[line.item] = {
						id: line.item
						, type: line.type
					};
				}
			});
			items_to_preload = _.values(items_to_preload);
			this.store_item.preloadItems(items_to_preload);

			this.result.lines.forEach(function (line) {
				line.item = line.type != 'Markup' ? self.store_item.get(line.item, line.type): line.item;
			});

			return this.result;

			// this.preGet();
			//
			// this.recordId = id;
			// this.recordType = record_type;
			//
			// //@class Transaction.Model.Get.Result
			// this.result = {};
			//
			// if (record_type && id)
			// {
			// 	this.record = this.getTransactionRecord(record_type, id);
			//
			// 	this.getRecordFields();
			//
			// 	if (this.result.currency)
			// 		this.result.selected_currency = Utils.getCurrencyById(this.result.currency.internalid);
			//
			// 	this.getRecordSummary();
			//
			// 	this.getRecordPromocodes();
			//
			// 	this.getRecordPaymentMethod();
			//
			// 	this.getPurchaseOrderNumber();
			//
			// 	this.getRecordAddresses();
			//
			// 	this.getRecordShippingMethods();
			//
			// 	this.getLines();
			//
			// 	this.getExtraRecordFields();
			//
			// 	this.getTransactionBodyCustomFields();
			// }
			//
			// this.postGet();
			//
			// // convert the objects to arrays
			// this.result.addresses = _.values(this.result.addresses || {});
			// this.result.shipmethods = _.values(this.result.shipmethods || {});
			// this.result.lines = _.values(this.result.lines || {});
			//
			// return this.result;
			//
			// //@class Transaction.Model
		}


	,	postGet: function ()
		{
			this.result.lines = _.reject(this.result.lines, function (line)
			{
				return line.quantity === 0;
			});
		}

	,	getPaymentEvent: function ()
		{
			if (this.record.getFieldValue('paymethtype') === 'external_checkout')
			{
			this.result.paymentevent = {
				holdreason: this.record.getFieldValue('paymenteventholdreason')
				,	redirecturl: ExternalPayment.generateUrl(this.result.internalid, this.result.recordtype)
			};
		}
			else
			{
				this.result.paymentevent = { };
			}

		}

	,	update: function (id, data, headers)
		{
			var result = 'OK';

			if (data.status ==='cancelled')
			{

				var url = 'https://' + Application.getHost() + '/app/accounting/transactions/salesordermanager.nl?type=cancel&xml=T&id=' + id
    		   	,	cancel_response = nlapiRequestURL(url, null, headers);

				if (cancel_response.getCode() === 206)
				{
					if (nlapiLookupField('salesorder', id, 'statusRef') !== 'cancelled')
					{
						result = 'ERR_ALREADY_APPROVED_STATUS';
					}
					else
					{
						result = 'ERR_ALREADY_CANCELLED_STATUS';
					}
				}
			}

			return result;
		}

		//@method isCancelable
		//@return {Boolean}
	,	isCancelable: function ()
		{
			return this.result.recordtype === 'salesorder' && this.result.status.internalid === 'pendingApproval';
		}

		//@method getCreatedFrom
		//return {Void}
	,	getCreatedFrom: function ()
		{
			var	fields = ['createdfrom.tranid', 'createdfrom.internalid', 'createdfrom.type']
			,	result = nlapiLookupField(this.recordType, this.recordId, fields);

			if (result)
			{
				//@class Transaction.Model.Get.Result
				//@property {CreatedFrom} createdfrom
				this.result.createdfrom =
				//@class CreatedFrom
				{
					//@property {String} internalid
					internalid: result['createdfrom.internalid']
					//@property {String} name
				,	name: result['createdfrom.tranid']
					//@property {String} recordtype
				,	recordtype: result['createdfrom.type']
				};
			}

		}

	,	getAdjustments: TransactionModelExtensions.getAdjustments

	,	getLines: function ()
		{
			Transaction.getLines.apply(this, arguments);

			if (this.isPickupInStoreEnabled)
			{
				var self = this;

				_.each(this.result.lines, function (line)
				{
					line.location = self.record.getLineItemValue('item', 'location', line.index);

					var item_fulfillment_choice = self.record.getLineItemValue('item', 'itemfulfillmentchoice', line.index);

					if (item_fulfillment_choice === '1')
					{
						line.fulfillmentChoice = 'ship';
					}
					else if (item_fulfillment_choice === '2')
					{
						line.fulfillmentChoice = 'pickup';
					}
				});
			}
		}

	,	getTransactionRecord: function (record_type, id)
		{
			if (this.isPickupInStoreEnabled && record_type === 'salesorder' && Configuration.get('pickupInStoreSalesOrderCustomFormId'))
			{
				return nlapiLoadRecord(record_type, id, {customform: Configuration.get('pickupInStoreSalesOrderCustomFormId')});
			}
			else
			{
				return Transaction.getTransactionRecord.apply(this, arguments);
			}
		}
	,	_addTransactionColumnFieldsToOptions: function (line)
		{
			var self = this;
			var lineFieldsId = self.record.getAllLineItemFields('item');
			_.each(lineFieldsId, function(field){
				if(field.indexOf('custcol') === 0)
				{
					var lineId = line.index;
					var fieldValue = self.record.getLineItemValue('item', field, lineId);
					if(fieldValue !== null)
					{
						var fieldInf = self.record.getLineItemField('item', field, lineId);
						line.options.push(
							self.transactionModelGetLineOptionBuilder(
								field
							,	fieldInf.label
							,	self.transactionModelGetLineOptionValueBuilder(undefined, fieldValue)
							,	fieldInf.mandatory
							)
						);
					}
				}
			});
		}
	});
});
