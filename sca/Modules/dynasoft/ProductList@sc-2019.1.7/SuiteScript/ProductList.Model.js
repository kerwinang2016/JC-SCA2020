/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// ProductList.Model.js
// ----------------
// Handles creating, fetching and updating Product Lists
define(
	'ProductList.Model'
,	[
		'SC.Model'
	,	'Application'
	,	'SC.Models.Init'
	,	'ProductList.Item.Search'
	,	'Utils'
	,	'Configuration'
	,	'underscore'
	]
,	function(
		SCModel
	,	Application
	,	ModelsInit
	,	ProductListItemSearch
	,	Utils
	,	Configuration
	,	_
	)
{
	'use strict';
	return SCModel.extend({
		name: 'ProductList'
		// ## General settings
	,	configuration: Configuration.get('productList')
	,	later_type_id: '2'
	,	quote_type_id: '4'

	,	verifySession: function()
		{
			if (!!_.result(this.configuration, 'loginRequired') && !ModelsInit.session.isLoggedIn2())
			{
				throw unauthorizedError;
			}
		}

	,	getColumns: function ()
		{
			return {
				internalid: new nlobjSearchColumn('internalid')
			,	templateid: new nlobjSearchColumn('custrecord_ns_pl_pl_templateid')
			,	name: new nlobjSearchColumn('name')
			,	description: new nlobjSearchColumn('custrecord_ns_pl_pl_description')
			,	owner: new nlobjSearchColumn('custrecord_ns_pl_pl_owner')
			,	scope: new nlobjSearchColumn('custrecord_ns_pl_pl_scope')
			,	type: new nlobjSearchColumn('custrecord_ns_pl_pl_type')
			,	created: new nlobjSearchColumn('created')
			,	lastmodified: new nlobjSearchColumn('lastmodified')
			};
		}

		// Returns a product list based on a given userId and id
	,	get: function (user, id)
		{
			this.verifySession();

			var filters = [new nlobjSearchFilter('internalid', null, 'is', id)
				,	new nlobjSearchFilter('isinactive', null, 'is', 'F')

				]
			,	product_lists = this.searchHelper(filters, this.getColumns(), true, "", "", "",user);
			if(user)
				filters.push(new nlobjSearchFilter('custrecord_ns_pl_pl_owner', null, 'is', user));
			if (product_lists.length >= 1)
			{
				return product_lists[0];
			}
			else
			{
				throw notFoundError;
			}
		}

		// Returns the user's saved for later product list
	,	getSavedForLaterProductList: function (user, customFiltersObj)
		{
			return this.getSpecialTypeProductList(user, this.later_type_id, customFiltersObj);
		}

	,	getRequestAQuoteProductList: function (user)
		{
			return this.getSpecialTypeProductList(user, this.quote_type_id);
		}

	,	getSpecialTypeProductList: function (user, type_id, customFiltersObj)
		{

			this.verifySession();
			var filters = [new nlobjSearchFilter('custrecord_ns_pl_pl_type', null, 'is', type_id)

				,	new nlobjSearchFilter('isinactive', null, 'is', 'F')];
				if(user)
				filters.push(new nlobjSearchFilter('custrecord_ns_pl_pl_owner', null, 'is', user));
			product_lists = this.searchHelper(filters, this.getColumns(), true, '', '', customFiltersObj, user);

			if (product_lists.length >= 1)
			{
				return product_lists[0];
			}
			else
			{
				var sfl_template = _(_(this.configuration.listTemplates).filter(function (pl)
				{
					return pl.typeId && pl.typeId === type_id;
				})).first();
				if (sfl_template)
				{
					if (!sfl_template.scope)
					{
						sfl_template.scope = { id: type_id, name: 'private' };
					}

					if (!sfl_template.description)
					{
						sfl_template.description = '';
					}

					return sfl_template;
				}
				throw notFoundError;
			}
		}

		// Sanitize html input
	,	sanitize: function (text)
		{
			return text ? text.replace(/<br>/g, '\n').replace(/</g, '&lt;').replace(/\>/g, '&gt;') : '';
		}

	,	searchHelper: function(filters, columns, include_store_items, order, template_ids, customFiltersObj, user)
		{
			// Sets the sort order
			var order_tokens = order && order.split(':') || []
			,	sort_column = order_tokens[0] || 'name'
			,	sort_direction = order_tokens[1] || 'ASC'
			,	productLists = [];

			columns[sort_column] && columns[sort_column].setSort(sort_direction === 'DESC');

			// Makes the request and format the response
			var records = Application.getAllSearchResults('customrecord_ns_pl_productlist', filters, _.values(columns));

			_.each(records, function (productListSearchRecord)
			{

				var product_list_type_text = productListSearchRecord.getText('custrecord_ns_pl_pl_type')
				,	last_modified_date = nlapiStringToDate(productListSearchRecord.getValue('lastmodified'), window.dateformat)
				,	last_modified_date_str = nlapiDateToString(last_modified_date, window.dateformat)
				,	productList = {
						internalid: productListSearchRecord.getId()
					,	templateId: productListSearchRecord.getValue('custrecord_ns_pl_pl_templateid')
					,	name: productListSearchRecord.getValue('name')
					,	description: productListSearchRecord.getValue('custrecord_ns_pl_pl_description') ? productListSearchRecord.getValue('custrecord_ns_pl_pl_description').replace(/\n/g, '<br>') : ''
					,	owner: {
							id: productListSearchRecord.getValue('custrecord_ns_pl_pl_owner')
						,	name: productListSearchRecord.getText('custrecord_ns_pl_pl_owner')
						}
					,	scopeId: productListSearchRecord.getValue('custrecord_ns_pl_pl_scope')
					,	scopeName: productListSearchRecord.getText('custrecord_ns_pl_pl_scope')
					,	typeId: productListSearchRecord.getValue('custrecord_ns_pl_pl_type')
					,	typeName: product_list_type_text
					,	created: productListSearchRecord.getValue('created')
					,	lastmodified: productListSearchRecord.getValue('lastmodified')
					,	lastmodifieddate: last_modified_date_str
					,	items: []
					// ProductListItemSearch.search(productListSearchRecord.getValue('custrecord_ns_pl_pl_owner'), productListSearchRecord.getId(), include_store_items, {
					// 			sort: 'created'
					// 		,	order: '-1'
					// 		,	page: -1
					// 	}, customFiltersObj)
					};

				if (template_ids && productList.templateId)
				{
					template_ids.push(productList.templateId);
				}
				productLists.push(productList);
			});
			var plitems = ProductListItemSearch.search(user, null, include_store_items, {
	          sort: 'created'
	        ,	order: '-1'
	        ,	page: -1
	      },customFiltersObj
	    );

			nlapiLogExecution('debug','plitems',plitems.length);
			for(var i=0; i<productLists.length; i++){

				var items = _.filter(plitems, function(pli){
					return pli.productListId == productLists[i].internalid;
				});
				productLists[i].items = items;
			}
			return productLists;
		}

		// Retrieves all Product Lists for a given user
	,	search: function (user, order)
		{

			var filters = [
					new nlobjSearchFilter('isinactive', null, 'is', 'F')

				]
			,	template_ids = []
			,	product_lists = this.searchHelper(filters, this.getColumns(), false, order, template_ids)
			,	self = this;
			if(user){
				filters.push(new nlobjSearchFilter('custrecord_ns_pl_pl_owner', null, 'is', user));
			}
			// Add possible missing predefined list templates
			_(this.configuration.listTemplates).each(function(template) {
				if (!_(template_ids).contains(template.templateId))
				{
					if (!template.templateId || !template.name)
					{
						console.log('Error: Wrong predefined Product List. Please check backend configuration.');
					}
					else
					{
						if (!template.scopeId)
						{
							template.scopeId = '2';
							template.scopeName = 'private';
						}

						if (!template.description)
						{
							template.description = '';
						}

						if (!template.typeId)
						{
							template.typeId = '3';
							template.typeName = 'predefined';
						}

						// This conversion to "string" is necessary since there exist an inconsistency between backend response and default values in ProductList.json
						template.scopeId = template.scopeId + '';

						product_lists.push(template);
					}
				}
			});

			if (this.isSingleList())
			{
				return _.filter(product_lists, function(pl)
				{
					// Only return predefined lists.
					return pl.typeName === 'predefined';
				});
			}

			return product_lists.filter(function (pl)
			{
				return pl.typeId !== self.later_type_id && pl.typeId !== self.quote_type_id;
			});
		}

	,	isSingleList: function ()
		{
			var self = this;

			return !this.configuration.additionEnabled && this.configuration.listTemplates && _.filter(this.configuration.listTemplates, function (pl) { return !pl.typeId || (pl.typeId !== self.later_type_id && pl.typeId !== self.quote_type_id); }).length === 1;
		}

		// Creates a new Product List record
	,	create: function (user, data)
		{
			// this.verifySession();

			// var productList = nlapiCreateRecord('customrecord_ns_pl_productlist');

			// data.templateId && productList.setFieldValue('custrecord_ns_pl_pl_templateid', data.templateId);
			// data.scopeId && productList.setFieldValue('custrecord_ns_pl_pl_scope', data.scopeId);
			// data.typeId && productList.setFieldValue('custrecord_ns_pl_pl_type', data.typeId);
			// data.name && productList.setFieldValue('name', this.sanitize(data.name));
			// data.description && productList.setFieldValue('custrecord_ns_pl_pl_description', this.sanitize(data.description));

			// productList.setFieldValue('custrecord_ns_pl_pl_owner', user);

			// return nlapiSubmitRecord(productList);

			try {

				this.verifySession();

				var parent = user;
				if(parent != nlapiGetUser()){
					var url = nlapiResolveURL('SUITELET','customscript_myaccountsuitelet',1,true);
					var res = nlapiRequestURL(url+"&action=createproductlist&user="+parent,JSON.stringify(data));
					var body = JSON.parse(res.getBody());
					return body;
				}
				var productList = nlapiCreateRecord('customrecord_ns_pl_productlist');

				data.templateid && productList.setFieldValue('custrecord_ns_pl_pl_templateid', data.templateid);
				data.scope && data.scope.id && productList.setFieldValue('custrecord_ns_pl_pl_scope', data.scope.id);
				data.type && data.type.id && productList.setFieldValue('custrecord_ns_pl_pl_type', data.type.id);
				data.name && productList.setFieldValue('name', this.sanitize(data.name));
				data.description && productList.setFieldValue('custrecord_ns_pl_pl_description', this.sanitize(data.description));

				productList.setFieldValue('custrecord_ns_pl_pl_owner', nlapiGetUser());

				return nlapiSubmitRecord(productList);

			} catch(e){
				nlapiLogExecution("error", "Error Message Product List:", e.message);
				return e.message;
			}
		}

		// Updates a given Product List given its id
	,	update: function (user, id, data)
		{
			this.verifySession();

			var product_list = nlapiLoadRecord('customrecord_ns_pl_productlist', id);

			if (parseInt(product_list.getFieldValue('custrecord_ns_pl_pl_owner'), 10) !== user)
			{
				throw unauthorizedError;
			}

			data.templateId && product_list.setFieldValue('custrecord_ns_pl_pl_templateid', data.templateId);
			data.scopeId && product_list.setFieldValue('custrecord_ns_pl_pl_scope', data.scopeId);
			data.typeId && product_list.setFieldValue('custrecord_ns_pl_pl_type', data.typeId);
			data.name && product_list.setFieldValue('name', this.sanitize(data.name));
			product_list.setFieldValue('custrecord_ns_pl_pl_description', data.description ? this.sanitize(data.description) : '');

			nlapiSubmitRecord(product_list);
		}

		// Deletes a Product List given its id
	,	delete: function(user, id)
		{
			this.verifySession();

			var product_list = nlapiLoadRecord('customrecord_ns_pl_productlist', id);

			if (parseInt(product_list.getFieldValue('custrecord_ns_pl_pl_owner'), 10) !== user)
			{
				throw unauthorizedError;
			}

			product_list.setFieldValue('isinactive', 'T');

			var internalid = nlapiSubmitRecord(product_list);

			return internalid;
		}
	});
});
