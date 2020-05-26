/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('ProductList.Item.Search'
,	[
		'Application'
	,	'SC.Models.Init'
	,	'Utils'
	,	'Configuration'

	,	'underscore'
	]
,	function (
		Application
	,	ModelsInit
	,	Utils
	,	Configuration

	,	_
	)
{
	'use strict';

	var StoreItem;

	try {
		StoreItem = require('StoreItem.Model');
	}
	catch(e)
	{
	}

	return {

		configuration: Configuration.get().productList

	,	verifySession: function()
		{
			if (this.configuration.loginRequired && !ModelsInit.session.isLoggedIn2())
			{
				throw unauthorizedError;
			}
		}

	,	getProductName: function (item)
		{
			if (!item)
			{
				return '';
			}

			// If its a matrix child it will use the name of the parent
			if (item && item.matrix_parent && item.matrix_parent.internalid)
			{
				return item.matrix_parent.storedisplayname2 || item.matrix_parent.displayname;
			}

			// Other ways return its own name
			return item.storedisplayname2 || item.displayname;
		}

		// Retrieves all Product List Items related to the given Product List Id
	,	search: function (user, product_list_id, include_store_item, sort_and_paging_data, customFiltersObj)
		{
			var filters = [
				new nlobjSearchFilter('isinactive', null, 'is', 'F') // 09/01/2020 filter added
			]
			,	sort_column = sort_and_paging_data.sort
			,	sort_direction = sort_and_paging_data.order;
			if(user){

				filters.push(new nlobjSearchFilter('custrecord_ns_pl_pl_owner', 'custrecord_ns_pl_pli_productlist', 'is', user));
			}
			if(product_list_id){
				filters.push(new nlobjSearchFilter('custrecord_ns_pl_pli_productlist', null, 'is', product_list_id));
			}
			var to = new Date();
			var from = new Date();
			from.setMonth(to.getMonth() - 3);
			to.setHours('24');
			// filters.push(new nlobjSearchFilter('created', null, 'onOrAfter', 'ninetyDaysAgo')); // 09/01/2020 RFC: added filter to stop limit being exceeded.

			if (customFiltersObj != '{}' && customFiltersObj) {
				var custFiltersObj = JSON.parse(customFiltersObj);
				if (custFiltersObj && custFiltersObj.custrecord_ns_pl_pli_fitter) {
					filters.push(new nlobjSearchFilter('custrecord_ns_pl_pli_fitter', null, 'anyof', custFiltersObj.custrecord_ns_pl_pli_fitter))
				}

				if(custFiltersObj.from_date != undefined && custFiltersObj.to_date != undefined){
					fromDate = custFiltersObj.from_date.split('-');
					from = new Date(fromDate[0], fromDate[1]-1, fromDate[2]);
					toDate = custFiltersObj.to_date.split('-');
					to = new Date(toDate[0], toDate[1]-1, toDate[2]);
				}

				if (custFiltersObj && custFiltersObj.custrecord_ns_pl_pli_isarchived) {
					filters.push(new nlobjSearchFilter('custrecord_ns_pl_pli_isarchived', null, 'is', custFiltersObj.custrecord_ns_pl_pli_isarchived))
				}
				if (custFiltersObj && custFiltersObj.isinactive) { //16/09/2019
					filters.push(new nlobjSearchFilter('isinactive', null, 'is', custFiltersObj.isinactive))
				} else //16/09/2019
				{
					filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'))
				}
			} else {
				filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'))
			}

			filters.push(new nlobjSearchFilter('created', null, 'within', from, to));

			if (!sort_column)
			{
				sort_column = 'created';
			}

			if (sort_column === 'priority')
			{
				sort_column = 'priority_value';
			}

			if (!sort_direction)
			{
				sort_direction = '-1';
			}

			var search_lines = this.searchHelper(filters, sort_column, sort_direction === '-1' ? 'DESC' : 'ASC', include_store_item, customFiltersObj);


			if (include_store_item && sort_column === 'price')
			{
				//-1 for descending, 1 for ascending
				search_lines = this.sortLinesByPrice(search_lines, sort_direction === '-1' ? -1 : 1);
			}

			return search_lines;
		}

		//UX expect the list to be sorted by price considering discounts and bulk pricing
		//this price is not present on data-store, so in memory rules and sorting are required.
	,	sortLinesByPrice: function (lines, sort_direction)
		{
			return _.sortBy(lines, function (line)
			{
				//defaults to price level 1
				var price_detail = line.item.onlinecustomerprice_detail || {}
				,	price = price_detail.onlinecustomerprice || line.item.pricelevel1 || 0
				,	quantity = line.quantity;

				if (quantity && price_detail.priceschedule && price_detail.priceschedule.length)
				{
					var price_schedule = _.find(price_detail.priceschedule, function(price_schedule)
					{
						return	(price_schedule.minimumquantity <= quantity && quantity < price_schedule.maximumquantity) ||
								(price_schedule.minimumquantity <= quantity && !price_schedule.maximumquantity);
					});

					price = price_schedule.price;
				}

				return price * sort_direction;
			});
		}

	,	parseLineOptionsFromProductList: function (options_object)
		{
			var result = [];
			_.each(options_object, function (value, key)
			{
				result.push({
					cartOptionId: key
				,	value: {
						internalid: value.value
					,	label: value.displayvalue
					}
					//new values
				,	itemOptionId: value.itemOptionId
				,	label: value.label
				,	type: value.type
				,	values: value.values
				});
			});

			return result;
		}

	,	getObjClientInternalid: function (paramOptions)
		{
			var clientInternalId = '';

			var objPlOptions= paramOptions;
			var isObjKeyTailorClientExist = (this.isObjectExist(objPlOptions['custcol_tailor_client'])) ? true : false;

			if (isObjKeyTailorClientExist)
			{
				var objCustColClient = objPlOptions['custcol_tailor_client'];
				var isObjKeyCustcolTailorClientValueExist = (this.isObjectExist(objCustColClient['value'])) ? true : false;

				if (isObjKeyCustcolTailorClientValueExist)
				{
					clientInternalId = objCustColClient['value'];
				}
			}

			return clientInternalId;
		}

	,	isObjectExist: function(objFld)
		{
		   var isObjExist = (typeof objFld != "undefined") ? true : false;
		   return isObjExist;
		}
	, isNullOrEmpty: function(valueStr)
		{
		   return(valueStr == null || valueStr == "" || valueStr == undefined);
		}
	,	getObjClientMapping: function (paramArrClientIds)
		{
			var objRet = {};
			var arrClientIds = (!this.isNullOrEmpty(paramArrClientIds)) ? paramArrClientIds : [];
			var arrClientIdsTotal = (!this.isNullOrEmpty(arrClientIds)) ? arrClientIds.length : 0;
			var hasArrClientIds = (arrClientIdsTotal != 0) ? true : false;

			if (hasArrClientIds)
			{
				var arrFilters = [  new nlobjSearchFilter('internalid', null, 'anyof', arrClientIds) ];
				var arrColumns = [  new nlobjSearchColumn('custrecord_tc_first_name'), new nlobjSearchColumn('custrecord_tc_last_name') ];
				var searchResults = nlapiSearchRecord('customrecord_sc_tailor_client', null, arrFilters, arrColumns);
				var searchResultsTotal = (!this.isNullOrEmpty(searchResults)) ? searchResults.length : 0;
				var hasSearchResults = (searchResultsTotal != 0) ? true : false;

				if (hasSearchResults)
				{
					for (var xj = 0; xj < searchResultsTotal; xj++)
					{
						var searchResult = searchResults[xj];
						var clientInternalId = searchResult.getId();
						var clientFirstName = searchResult.getValue('custrecord_tc_first_name');
						var clientLastName = searchResult.getValue('custrecord_tc_last_name');

						var isObjKeyMappingExist = (this.isObjectExist(objRet['' + clientInternalId + ''])) ? true : false;

						if (!isObjKeyMappingExist)
						{
							objRet['' + clientInternalId + ''] = {};
							objRet['' + clientInternalId + '']['internalid'] = clientInternalId;
							objRet['' + clientInternalId + '']['firstname'] = clientFirstName;
							objRet['' + clientInternalId + '']['lastname'] = clientLastName;
						}
					}
				}
			}

			return objRet;
		}
	, isNullOrEmptyObject:	function (obj)
		{
		   var hasOwnProperty = Object.prototype.hasOwnProperty;

		   if (obj.length && obj.length > 0) { return false; }
		   for (var key in obj) { if (hasOwnProperty.call(obj, key)) return false; }
		   return true;
		}
	,	searchHelper: function (filters, sort_column, sort_direction, include_store_item, customFiltersObj)
		{
			// Selects the columns
			var productListItemColumns = {
				internalid: new nlobjSearchColumn('internalid')
			,	name:  new nlobjSearchColumn('formulatext', 'custrecord_ns_pl_pli_item').setFormula('case when LENGTH({custrecord_ns_pl_pli_item.displayname}) > 0 then {custrecord_ns_pl_pli_item.displayname} else {custrecord_ns_pl_pli_item.itemid} end')
			,	sku:  new nlobjSearchColumn('formulatext', 'custrecord_ns_pl_pli_item').setFormula('{custrecord_ns_pl_pli_item.itemid}')
			,	description: new nlobjSearchColumn('custrecord_ns_pl_pli_description')
			,	options: new nlobjSearchColumn('custrecord_ns_pl_pli_options')
			,	quantity: new nlobjSearchColumn('custrecord_ns_pl_pli_quantity')
			,	price: new nlobjSearchColumn('price', 'custrecord_ns_pl_pli_item')
			,	created: new nlobjSearchColumn('created')
			,	item_id: new nlobjSearchColumn('custrecord_ns_pl_pli_item')
			,	item_type: new nlobjSearchColumn('type', 'custrecord_ns_pl_pli_item')
			,	item_matrix_parent: new nlobjSearchColumn('parent', 'custrecord_ns_pl_pli_item')
			,	priority: new nlobjSearchColumn('custrecord_ns_pl_pli_priority')
			,	priority_value: new nlobjSearchColumn('custrecord_ns_pl_plip_value', 'custrecord_ns_pl_pli_priority')
			,	lastmodified: new nlobjSearchColumn('lastmodified')
			, 	fitter: new nlobjSearchColumn('custrecord_ns_pl_pli_fitter')
			, 	custrecord_ns_pl_pli_isarchived: new nlobjSearchColumn('custrecord_ns_pl_pli_isarchived')
			,	isinactive: new nlobjSearchColumn('isinactive')			//16/09/2019
			, custrecord_ns_pl_pli_productlist: new nlobjSearchColumn('custrecord_ns_pl_pli_productlist')
			};

			productListItemColumns[sort_column] && productListItemColumns[sort_column].setSort(sort_direction === 'DESC');

			// Makes the request and format the response
			var records = Application.getAllSearchResults('customrecord_ns_pl_productlistitem', filters, _.values(productListItemColumns))
			,	productlist_items = []
			,	self = this
			,	custFiltersObj = '';

			if(customFiltersObj != '{}' && customFiltersObj) {
				custFiltersObj = JSON.parse(customFiltersObj);
			}
			// nlapiLogExecution('debug','custFiltersObj',JSON.stringify(custFiltersObj));
			var arrClientRecord = [];
			//nlapiLogExecution('debug','PLI RECORDS LENGTH', records.length)
			_(records).each(function (productListItemSearchRecord)
			{
				var objPlOptions = JSON.parse(productListItemSearchRecord.getValue('custrecord_ns_pl_pli_options') || '{}');
				var hasObjPlOptions = (!self.isNullOrEmptyObject(objPlOptions)) ? true : false;

				if (hasObjPlOptions)
				{
					var isObjKeyTailorClientExist = (self.isObjectExist(objPlOptions['custcol_tailor_client'])) ? true : false;

					if (isObjKeyTailorClientExist)
					{
						var objCustColClient = objPlOptions['custcol_tailor_client']
						var isObjKeyCustcolTailorClientValueExist = (self.isObjectExist(objCustColClient['value'])) ? true : false;

						if (isObjKeyCustcolTailorClientValueExist)
						{
							var clientInternalId = objCustColClient['value'];
							var hasClientInternalId = (!self.isNullOrEmpty(clientInternalId)) ? true : false;
							var isPushArrClientRecord = (hasClientInternalId) ? arrClientRecord.push(clientInternalId) : '';
						}
					}
				}
			});

			var objClientMapping = self.getObjClientMapping(arrClientRecord);
			nlapiLogExecution('debug','objClientMapping',JSON.stringify(objClientMapping));
			_(records).each(function (productListItemSearchRecord)
			{
				var itemInternalId = productListItemSearchRecord.getValue('custrecord_ns_pl_pli_item')
				,	itemId = productListItemSearchRecord.getText('custrecord_ns_pl_pli_item')
				,	itemMatrixParent = productListItemSearchRecord.getValue('parent', 'custrecord_ns_pl_pli_item')
				,	created_date = nlapiStringToDate(productListItemSearchRecord.getValue('created'), window.dateformat)
				,	created_date_str = nlapiDateToString(created_date, window.dateformat)
				,	itemType = productListItemSearchRecord.getValue('type', 'custrecord_ns_pl_pli_item')
				,	productListItem = {
						internalid: productListItemSearchRecord.getId()
					,	description: productListItemSearchRecord.getValue('custrecord_ns_pl_pli_description')
					,	options: self.parseLineOptionsFromProductList(JSON.parse(productListItemSearchRecord.getValue('custrecord_ns_pl_pli_options') || '{}'))
					, optionscopy: JSON.parse(productListItemSearchRecord.getValue('custrecord_ns_pl_pli_options') || '{}')
					,	quantity: parseInt(productListItemSearchRecord.getValue('custrecord_ns_pl_pli_quantity'), 10)
					,	created: productListItemSearchRecord.getValue('created')
					,	createddate: created_date_str
					,	lastmodified: productListItemSearchRecord.getValue('lastmodified')
					,	custrecord_ns_pl_pli_isarchived: productListItemSearchRecord.getValue('custrecord_ns_pl_pli_isarchived')
					, fittername: productListItemSearchRecord.getText('custrecord_ns_pl_pli_fitter') ? productListItemSearchRecord.getText('custrecord_ns_pl_pli_fitter') : productListItemSearchRecord.getText('custrecord_ns_pl_pl_owner','custrecord_ns_pl_pli_productlist')
					, fitterid:productListItemSearchRecord.getValue('custrecord_ns_pl_pli_fitter') ? productListItemSearchRecord.getValue('custrecord_ns_pl_pli_fitter') : productListItemSearchRecord.getValue('custrecord_ns_pl_pl_owner','custrecord_ns_pl_pli_productlist')
					, productListId: productListItemSearchRecord.getValue('custrecord_ns_pl_pli_productlist')
					,	isinactive:	productListItemSearchRecord.getValue('isinactive')  //16/09/2019

					// we temporary store the item reference, after this loop we use StoreItem.preloadItems instead doing multiple StoreItem.get()
					,	store_item_reference: {
							id: itemInternalId
						,	internalid: itemInternalId
						,	type: itemType
						,	matrix_parent: itemMatrixParent
						,	itemid: itemId
						}
					,	client: {
							id: ''
						,	firstname: ''
						,	lastname: ''
						}
					,	priority: {
							id: productListItemSearchRecord.getValue('custrecord_ns_pl_pli_priority')
						,	name: productListItemSearchRecord.getText('custrecord_ns_pl_pli_priority')
						}
					};
					var clientInternalId = self.getObjClientInternalid(productListItem['optionscopy']);
					// nlapiLogExecution('debug','internalid',productListItem['internalid']);
					// nlapiLogExecution('debug','clientInternalId',JSON.stringify(clientInternalId));
					var isClientInternalIdExistInMapping = (self.isObjectExist(objClientMapping['' + clientInternalId + ''])) ? true : false;

					if (isClientInternalIdExistInMapping)
					{
						productListItem['client']['id'] = objClientMapping['' + clientInternalId + '']['internalid']
						productListItem['client']['firstname'] = objClientMapping['' + clientInternalId + '']['firstname']
						productListItem['client']['lastname'] = objClientMapping['' + clientInternalId + '']['lastname']
					}
					var completename = productListItem['client']['firstname'] + " " + productListItem['client']['lastname'];
					completename = completename.toLowerCase();

					if(custFiltersObj && custFiltersObj.client){
						custFiltersObj.client = custFiltersObj.client.toLowerCase();
					}
						// nlapiLogExecution('debug','custFiltersObj.client',custFiltersObj.client);
					if(custFiltersObj && custFiltersObj.client && completename.indexOf(custFiltersObj.client) == -1){// &&
						// productListItem.client.firstname.indexOf(plifilters.client) == -1 custFiltersObj
						// productListItem.client.firstname.indexOf(plifilters.client) == -1)
						// {}
					}
		      else{

						// nlapiLogExecution('debug','custFiltersObj',JSON.stringify(custFiltersObj));
		  			productlist_items.push(productListItem);
		      }
			});
			nlapiLogExecution('debug','productlist_items',productlist_items.length);

			var store_item_references = _(productlist_items).pluck('store_item_reference')
			,	results = [];

			// preload all the store items at once for performance
			StoreItem && StoreItem.preloadItems(store_item_references);
			_(productlist_items).each(function (productlist_item)
			{
				//nlapiLogExecution('debug','store_item_reference',JSON.stringify(productlist_item));
				if(productlist_item.store_item_reference){
				var store_item_reference = productlist_item.store_item_reference
				// get the item - fast because it was preloaded before. Can be null!
				,	store_item = StoreItem ? StoreItem.get(store_item_reference.id, store_item_reference.type) : store_item_reference;

				delete productlist_item.store_item_reference;

				if (!store_item)
				{
					return;
				}

				if (include_store_item || !StoreItem)
				{
					productlist_item.item = store_item;
					//Parse the internalid to number to be SearchAPI complaint
					productlist_item.item.internalid = parseInt(productlist_item.item.internalid,10);
				}
				else
				{
					// only include basic store item data - fix the name to support matrix item names.
					productlist_item.item = {
						internalid: parseInt(store_item_reference.id, 10)
					,	displayname: self.getProductName(store_item)
					,	ispurchasable: store_item.ispurchasable
					,	itemoptions_detail: store_item.itemoptions_detail
					,	minimumquantity: store_item.minimumquantity
					};
				}

				if (!include_store_item && store_item && store_item.matrix_parent)
				{
					productlist_item.item.matrix_parent = store_item.matrix_parent;
				}

				results.push(productlist_item);
				}
			});

			return results;
		}
	};
});
