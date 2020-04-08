/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Invoice.Model.js
// ----------
// Handles fetching invoices
define(
	'Invoice.Model'
,	[	'Application'
	,	'Utils'
	,	'Transaction.Model'
	,	'Transaction.Model.Extensions'

	,	'underscore'
	]
,	function (
		Application
	,	Utils
	,	TransactionModel
	,	TransactionModelExtensions

	,	_
	)
{
	'use strict';

	return TransactionModel.extend({

		name: 'Invoice'

	,	setExtraListColumns: function ()
		{
			if (this.isMultiCurrency)
			{
				this.columns.amount_remaining = new nlobjSearchColumn('formulanumeric').setFormula('{amountremaining} / {exchangerate}');
			}
			else
			{
				this.columns.amount_remaining = new nlobjSearchColumn('amountremaining');
			}

			this.columns.originalamountremaining = new nlobjSearchColumn('amountremaining');
			this.columns.originalamount = new nlobjSearchColumn('amount');
			this.columns.closedate = new nlobjSearchColumn('closedate');
			this.columns.duedate = new nlobjSearchColumn('duedate');
			this.columns.createdFromSaleorder = new nlobjSearchColumn('createdfrom');  //11/09/2019 Saad saad
			this.columns.custbody_customer_name = new nlobjSearchColumn('custbody_customer_name');
			this.columns.custbody_so_created_by =new nlobjSearchColumn('altname','custbody_so_created_by')  //30/08/2019 Saad SAAD
			if (this.isCustomColumnsEnabled())
			{
				this.setCustomColumns('invoiceOpen');
				this.setCustomColumns('invoicePaid');
		}
		}

	,	setExtraListFilters: function ()
		{
			var status = this.data.status;

			if (status)
			{
				var value = null;

				switch (status)
				{
					case 'open':
						value = 'CustInvc:A';
					break;

					case 'paid':
						value = 'CustInvc:B';
					break;
				}

				if (value)
				{
					this.filters.status_operator = 'and';
					this.filters.status = ['status', 'anyof', value];
				}
			}
		}
		// @method mapListResult Overrides the namesake method of Transaction.Model. It maps the received result with proper information
		// @param {Transaction.Model.List.Result.Record} result Base result to be extended
		// @param {nlobjSearchResult} record Instance of the record returned by NetSuite search
		// @return {Transaction.Model.List.Result.Record}
	,	mapListResult: function (result, record)
		{
			var due_date = record.getValue('duedate')
			,	close_date = record.getValue('closedate')
			,	transaction_date = record.getValue('trandate')
			,	due_date_millisenconds = !!due_date ? nlapiStringToDate(due_date).getTime() : (new Date()).getTime()
			,	due_in_milliseconds = due_date_millisenconds - this.now
			,	currencySymbol;

			if (this.result && this.result.selected_currency)
			{
				currencySymbol = this.result.selected_currency.symbol;
			}

			result.originalamount = record.getValue(this.columns.originalamount);
			result.original_amount_remaining = record.getValue(this.columns.originalamountremaining);

			result.amountremaining = Utils.toCurrency(record.getValue(this.columns.amount_remaining));
			result.amountremaining_formatted = Utils.formatCurrency(record.getValue(this.columns.amount_remaining), currencySymbol);

			result.closedate = close_date;

			result.closedateInMilliseconds = close_date ? nlapiStringToDate(close_date).getTime() : 0;
			result.tranDateInMilliseconds = transaction_date ? nlapiStringToDate(transaction_date).getTime() : 0;

			result.duedate = due_date;
			result.dueinmilliseconds = due_in_milliseconds;
			result.isOverdue = due_in_milliseconds <= 0 && ((-1 * due_in_milliseconds) / 1000 / 60 / 60 / 24) >= 1;
			result.isPartiallyPaid = record.getValue('amount') - record.getValue('amountremaining');
			var tempCreatedFrom = record.getText('createdfrom');    //11/09/2019 Saad saad
			result.createdFromSaleorder = tempCreatedFrom && tempCreatedFrom.indexOf('#') != -1 ? tempCreatedFrom.split('#')[1] : '';	//11/09/2019 Saad saad
			result.custbody_customer_name =	record.getValue('custbody_customer_name');
			result.custbody_so_created_by = record.getValue('altname','custbody_so_created_by');  //30/08/2019 Saad SAAD
			if (this.isCustomColumnsEnabled())
			{
				this.mapCustomColumns(result, record, 'invoiceOpen');
				this.mapCustomColumns(result, record, 'invoicePaid');
			}
			return result;
		}

	,	getExtraRecordFields: function ()
		{
			this.getAdjustments();
			this.getSalesRep();

			this.result.purchasenumber = this.record.getFieldValue('otherrefnum');
			this.result.dueDate = this.record.getFieldValue('duedate');
			this.result.amountDue = Utils.toCurrency(this.record.getFieldValue('amountremainingtotalbox'));
			this.result.custbody_customer_name = this.record.getFieldValue('custbody_customer_name');
			this.result.custbody_so_created_by = this.record.getFieldText('custbody_so_created_by');  //30/08/2019 Saad SAAD
			var currencySymbol;
			if (this.result && this.result.selected_currency)
			{
				currencySymbol = this.result.selected_currency.symbol;
			}

			this.result.amountDue_formatted = Utils.formatCurrency(this.record.getFieldValue('amountremainingtotalbox'), currencySymbol)
		}

	,	postGet: function ()
		{
			this.result.lines = _.reject(this.result.lines, function (line)
			{
				return line.quantity === 0;
			});
		}

	,	getStatus: function ()
		{
			this.result.status =
			{
				internalid: nlapiLookupField(this.result.recordtype, this.result.internalid, 'status')
			,	name: nlapiLookupField(this.result.recordtype, this.result.internalid, 'status', true)
			};
		}
	,	getCreatedFrom: function()
		{
			var created_from_internalid = nlapiLookupField(this.result.recordtype, this.result.internalid, 'createdfrom')
			,	recordtype = created_from_internalid ? Utils.getTransactionType(created_from_internalid) : ''
			,	tranid = recordtype ? nlapiLookupField(recordtype, created_from_internalid, 'tranid') : '';

			this.result.createdfrom =
			{
					internalid: created_from_internalid
				,	name: nlapiLookupField(this.result.recordtype, this.result.internalid, 'createdfrom', true) || ''
				,	recordtype: recordtype
				,	tranid: tranid
			};
		}
	,	getAdjustments: TransactionModelExtensions.getAdjustments

	,	getSalesRep: TransactionModelExtensions.getSalesRep

			// //@method list Allow search among transactions
			// //@param {Transaction.Model.List.Parameters} data
			// //@return {Transaction.Model.List.Result}
			// ,	list: function (data)
			// {
			//
			// 	this.preList();
			// 	// if(data.recordtype == 'salesorder'){
			// 	// 	var url = nlapiResolveURL('SUITELET','customscript_myaccountsuitelet',1,true);
			// 	// 	var res = nlapiRequestURL(url+"&action=getorders&user="+data.parent +
			// 	// 	"&page="+ data.page +"&clientname="+data.client_name+"&soid="+data.search_so_id+"&sort="+data.sort+"&clientid="+data.client_id);
			// 	// 	return JSON.parse(res.getBody());
			// 	// }
			// 	var self = this;
			//
			// 	this.data = data;
			// 	this.amountField = this.isMultiCurrency ? 'fxamount' : 'amount';
			//
			// 	var sortid = this.data.sort_list;				//29/08/2019 Saad Saad
			// 	if(this.data.client_id){
			// 		this.data.client_name = this.data.client_name.replace('%', ' ');
			// 		this.filters = {
			// 				'entity': ['entity', 'is', nlapiGetUser()]
			// 			,	'mainline_operator': 'and'
			// 			,	'mainline': ['mainline','is', 'F']
			// 			,	'client_operator': 'and'
			// 			,	'client_name': ['custcol_tailor_client_name', 'contains', this.data.client_name]
			// 		};
			// 	} else if(this.data.search_so_id ) {
			// 		this.filters = {
			// 				'entity': ['entity', 'is', nlapiGetUser()]
			// 			,	'mainline_operator': 'and'
			// 			,	'mainline': ['mainline','is', 'F']
			// 			,	'client_operator': 'and'
			// 			,	'client_soid': ['custcol_so_id', 'contains', this.data.search_so_id]
			// 		};
			// 	} else if(this.data.client_name) {
			// 			this.data.client_name = this.data.client_name.replace('%', ' ');
			// 			this.filters = {
			// 					'entity': ['entity', 'is', nlapiGetUser()]
			// 				,	'mainline_operator': 'and'
			// 				,	'mainline': ['mainline','is', 'F']
			// 				,	'client_operator': 'and'
			// 				,	'client_name': ['custcol_tailor_client_name', 'contains', this.data.client_name]
			// 			};
			// 		} else if(sortid) {			//29/08/2019 Saad Saad
			// 			this.filters = {
			// 					'entity': ['entity', 'is', nlapiGetUser()]
			// 				,	'mainline_operator': 'and'
			// 				,	'mainline': ['mainline','is', 'F']
			// 				,	'client_operator': 'and'
			// 				,	'so_status': ['status', 'anyof', ['SalesOrd:D','SalesOrd:E','SalesOrd:F','SalesOrd:B','SalesOrd:G']]
			// 			};
			//
			// 		} else if(this.data.types == 'CustInvc') {
			// 			this.filters = {
			// 				'entity': ['entity', 'is', nlapiGetUser()]
			// 				,	'mainline_operator': 'and'
			// 				,	'mainline': ['mainline','is', 'T']
			// 			};
			//
			// 		} else {
			// 		this.filters = {
			// 			'entity': ['entity', 'is', nlapiGetUser()]
			// 		,	'mainline_operator': 'and'
			// 		,	'mainline': ['mainline','is', 'F']
			// 		};
			//
			// 	}
			// 	this.columns = {
			// 			'trandate': new nlobjSearchColumn('trandate')
			// 		,	'internalid': new nlobjSearchColumn('internalid')
			// 		,	'tranid': new nlobjSearchColumn('tranid')
			// 		,	'status': new nlobjSearchColumn('status')
			// 		,	'amount': new nlobjSearchColumn(this.amountField)
			// 		};
			//
			// 	if (this.isMultiCurrency)
			// 	{
			// 		this.columns.currency = new nlobjSearchColumn('currency');
			// 	}
			//
			// 	if (this.data.from && this.data.to)
			// 	{
			// 		this.filters.date_operator = 'and';
			//
			// 		this.data.from = this.data.from.split('-');
			// 		this.data.to = this.data.to.split('-');
			//
			// 		this.filters.date = [
			// 			'trandate', 'within'
			// 		,	new Date(
			// 				this.data.from[0]
			// 			,	this.data.from[1]-1
			// 			,	this.data.from[2]
			// 			)
			// 		,	new Date(
			// 				this.data.to[0]
			// 			,	this.data.to[1]-1
			// 			,	this.data.to[2]
			// 			)
			// 		];
			// 	}
			// 	else if (this.data.from)
			// 	{
			// 		this.filters.date_from_operator = 'and';
			//
			// 		this.data.from = this.data.from.split('-');
			//
			// 		this.filters.date_from = [
			// 			'trandate'
			// 		,	'onOrAfter'
			// 		,	new Date(
			// 				this.data.from[0]
			// 			,	this.data.from[1]-1
			// 			,	this.data.from[2]
			// 			)
			// 		];
			// 	}
			// 	else if (this.data.to)
			// 	{
			// 		this.filters.date_to_operator = 'and';
			//
			// 		this.data.to = this.data.to.split('-');
			//
			// 		this.filters.date_to = [
			// 			'trandate'
			// 		,	'onOrBefore'
			// 		,	new Date(
			// 				this.data.to[0]
			// 			,	this.data.to[1]-1
			// 			,	this.data.to[2]
			// 			)
			// 		];
			// 	}
			//
			// 	if (this.data.internalid)
			// 	{
			// 		this.data.internalid  = _.isArray(this.data.internalid) ? this.data.internalid : this.data.internalid.split(',');
			// 		this.filters.internalid_operator = 'and';
			// 		this.filters.internalid  =  ['internalid', 'anyof', this.data.internalid];
			// 	}
			//
			// 	if (this.data.createdfrom)
			// 	{
			// 		this.filters.createdfrom_operator = 'and';
			// 		this.filters.createdfrom = ['createdfrom', 'is', this.data.createdfrom];
			// 	}
			//
			// 	if (this.data.types)
			// 	{
			// 		this.filters.types_operator = 'and';
			// 		this.filters.types = ['type', 'anyof', this.data.types.split(',')];
			// 	}
			//
			// 	if (this.isMultiSite)
			// 	{
			//
			// 		var site_id = 2 //ModelsInit.session.getSiteSettings(['siteid']).siteid //changed by salman 25-nov-2019 (Get data created on old site)
			// 		,	filter_site = Configuration.get('filterSite') || Configuration.get('filter_site')
			// 		,	search_filter_array = null;
			//
			// 		if (_.isString(filter_site) && filter_site === 'current')
			// 		{
			// 			search_filter_array = [site_id, '@NONE@'];
			// 		}
			// 		else if (_.isString(filter_site) && filter_site === 'all')
			// 		{
			// 			search_filter_array = [];
			// 		}
			// 		else if (_.isArray(filter_site))
			// 		{
			// 			search_filter_array = filter_site;
			// 			search_filter_array.push('@NONE@');
			// 		}
			// 		else if (_.isObject(filter_site) && filter_site.option)
			// 		{
			// 			switch (filter_site.option)
			// 			{
			// 				case 'all' :
			// 					search_filter_array = [];
			// 					break;
			// 				case 'siteIds' :
			// 					search_filter_array = filter_site.ids;
			// 					break;
			// 				default : //case 'current' (current site) is configuration default
			// 					search_filter_array = [site_id, '@NONE@'];
			// 					break;
			// 			}
			// 		}
			//
			// 		if (search_filter_array && search_filter_array.length)
			// 		{
			// 			this.filters.site_operator = 'and';
			// 			this.filters.site = ['website', 'anyof', _.uniq(search_filter_array)];
			// 		}
			// 	}
			//
			// 	this.setExtraListFilters();
			//
			// 	if (this.isCustomColumnsEnabled())
			// 	{
			// 		this.setCustomColumns();
			// 	}
			//
			// 	this.setExtraListColumns();
			//
			// 	if (this.data.sort)
			// 	{
			// 		_.each(this.data.sort.split(','), function (column_name)
			// 		{
			// 			if (self.columns[column_name])
			// 			{
			// 				self.columns[column_name].setSort(self.data.order >= 0);
			// 			}
			// 		});
			// 	}
			//
			//
			// 	//Salman Start 9/3/2019 Saad
			// 	if (this.data.page === 'all' || sortid == 'true')
			// 	{
			// 		this.search_results = Application.getAllSearchResults('transaction', _.values(this.filters), _.values(this.columns));
			// 	}
			// 	else
			// 	{
			// 		this.search_results = Application.getAllPaginatedSearchResults({
			// 			record_type: 'transaction'
			// 		,	filters: _.values(this.filters)
			// 		,	columns: _.values(this.columns)
			// 		,	page: this.data.page || 1
			// 		,	results_per_page : this.data.results_per_page || Configuration.get('suitescriptResultsPerPage')
			// 		});
			//
			// 	}
			//
			// 	var records = _.map(((this.data.page === 'all' || sortid == 'true') ? this.search_results : this.search_results.records) || [], function (record)
			// 	{
			// 		var selected_currency = Utils.getCurrencyById(record.getValue('currency'))
			// 		,	selected_currency_symbol = selected_currency ? selected_currency.symbol : selected_currency;
			//
			// 		//@class Transaction.Model.List.Result.Record
			// 		var result = {
			// 			//@property {String} recordtype
			// 			recordtype: record.getRecordType()
			// 			//@property {String} internalid
			// 		,	internalid: record.getValue('internalid')
			// 			//@property {String} tranid
			// 		,	tranid: record.getValue('tranid')
			// 			//@property {String} trandate
			// 		,	trandate: record.getValue('trandate')
			// 			//@property {Transaction.Status} status
			// 		,	status: {
			// 				//@class Transaction.Status
			// 				//@property {String} internalid
			// 				internalid: record.getValue('status')
			// 				//@property {String} name
			// 			,	name: record.getText('status')
			// 			}
			// 			//@class Transaction.Model.List.Result.Record
			// 			//@property {Number} amount
			// 		,	amount: Utils.toCurrency(record.getValue(self.amountField))
			// 			//@property {Currency?} currency
			// 		,	currency: self.isMultiCurrency ?
			// 			//@class Currency
			// 			{
			// 				//@property {String} internalid
			// 				internalid: record.getValue('currency')
			// 				//@property {String} name
			// 			,	name: record.getText('currency')
			// 			} : null
			// 			//@property {String} amount_formatted
			// 		,	amount_formatted: Utils.formatCurrency(record.getValue(self.amountField), selected_currency_symbol)
			// 		,	so_id: record.getValue('custcol_so_id')
			// 		,	customer_name: record.getValue('custbody_customer_name')
			// 		, 	item: record.getText('item')
			// 		,	date_needed: record.getValue('custcol_avt_date_needed')
			// 		,	fabric_status: record.getValue('custcol_avt_fabric_status')
			// 		,	cmt_status: record.getValue('custcol_avt_cmt_status')
			// 		,	flag: record.getValue('custcol_flag')
			//
			// 		};
			// 		return self.mapListResult(result, record);
			//
			// 	});
			//
			// 	var results_per_page =  this.data.results_per_page || Configuration.get('suitescriptResultsPerPage');
			// 	var pageNumber = parseInt(this.data.page);
			// 	if (this.data.page === 'all') {
			// 	this.results = records;
			// 	}
			// 	else if(data.recordtype == 'salesorder'){
			// 		if(data.sort == 'true'){
			// 		records.sort(function(a,b){
			// 			return (a.tranline_status === b.tranline_status )? 0 : a.tranline_status? -1 : 1;
			// 		});
			// 		records.sort(function(a,b){
			// 			return (a.clearstatus === b.clearstatus)? 0 : a.clearstatus? 1: -1;
			// 		})
			// 		records.sort(function(a,b){
			// 			return (a.custcol_flag === b.custcol_flag)? 0 : a.custcol_flag == 'F'? 1 : -1
			// 		});
			// 		}
			// 		var range_start = (pageNumber * results_per_page) - results_per_page
			// 		,	range_end = pageNumber * results_per_page
			// 		,	resultData = records.slice(range_start, range_end)
			// 		,	objResultData = {};
			// 		objResultData.page = pageNumber;
			// 		objResultData.recordsPerPage = results_per_page;
			// 		objResultData.records = resultData;
			// 		objResultData.totalRecordsFound = records.length;
			//
			// 		this.results = objResultData;
			// 		this.results.records = resultData;
			//
			// 	} else {
			//
			// 		this.results = this.search_results;
			// 		this.results.records = records;
			// 	}
			//
			// 	//Salman end 9/3/2019 Saad
			// 	this.postList();
			// 	return this.results;
			// 	// @class Transaction.Model
			// }


	});

});
