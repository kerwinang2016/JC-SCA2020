/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductList
// ProductList.Item.Model
define('ProductList.Item.Model'
,	[	'Product.Model'
	,	'Item.Model'
	,	'underscore'
	,	'Backbone'
	,	'Utils'
	]
,	function (
		ProductModel
	,	Item
	,	_
	,	Backbone
	)
{
	'use strict';

	function validateLength (value, name)
	{
		var max_length = 300;

		if (value && value.length > max_length)
		{
			return _('$(0) must be at most $(1) characters').translate(name, max_length);
		}
	}

	// @class ProductList.Item.Model @extends Product.Model
	var ProductListItemModel = ProductModel.extend(
		{
			urlRoot: _.getAbsoluteUrl('services/ProductList.Item.Service.ss')

		,	defaults : {
				priority : {id: '2', name: 'medium'}
			,	options: ''
			}

			// Name is required
		,	validation: _.extend({}, ProductModel.prototype.validation, {
					name: {
						required: true
					,	msg: _('Name is required').translate()
					}
				,	description: { fn: validateLength }
			})

		,	className: 'ProductList.Item.Model'

			// redefine url to avoid possible cache problems from browser
		,	url: function ()
			{
				var base_url = Backbone.Model.prototype.url.apply(this, arguments)
				,	product_list = this.get('productList')
				,	url_params = {
						t: new Date().getTime()
				};

				if (product_list && product_list.owner)
				{
					url_params.user = product_list.owner;
				}

				return _.addParamsToUrl(base_url, url_params);
			}

			// @method initialize Overrides default method because in vinson optional item options with undefined value
			// were not accepted and now they are.
			// @constructor
		,	initialize: function (attributes)
			{
				// This work around was made to maintain the compatility with product lists saving the child item in the record
				if (attributes && attributes.item && attributes.item.matrix_parent)
				{
					attributes.item = _.extend(attributes.item, attributes.item.matrix_parent);
					delete attributes.item.matrix_parent;
				}

				var item_aux = new Item(attributes.item)
				,	item_options = item_aux.get('options');

				item_options.each( function(item_option, i)
				{
					var option = _.findWhere(attributes.options, {'cartOptionId' : item_option.get('cartOptionId')});

					if (!option)
					{
						attributes.options.push(item_option.toJSON());
					}
					else if (_.isObject(option.value) && _.isEmpty(option.value))
					{
						attributes.options[i] = item_option.toJSON();
					}
				});

				ProductModel.prototype.initialize.apply(this, arguments);
			}

			// @method getOptionsArray Returns options as an array. This is the way ItemDetailModel expects when initialized. @return {Array<Object>}
		,	getOptionsArray: function ()
			{
				// Iterate on the stored Product List Item options and create an id/value object compatible with the existing options renderer...
				var option_values = []
				,	selected_options = this.get('options');

				_.each(selected_options, function (value, key)
				{
					option_values.push({
						id: key
					,	value: value.value
					,	displayvalue: value.displayvalue
					});
				});

				return option_values;
			}

			// @method fulfillsMinimumQuantityRequirement Returns true if a product can be purchased due to minimum quantity requirements. @returns {Boolean}
		,	fulfillsMinimumQuantityRequirement: function ()
			{
				return this.get('item').get('_minimumQuantity') <= this.get('quantity');
			}

		,	fulfillsMaximumQuantityRequirement: function ()
			{
				return (this.get('item').get('_maximumQuantity')) ? this.get('item').get('_maximumQuantity') >= this.get('quantity') : true;
			}

			// @method getItemForCart Gets the ProductModel for the cart options_details should be passed together with options values,
			// otherwise they will not be validated and not set!!!
			// @return {internalid:String,quantity:Number,options:Object,options:Object}
		,	getItemForCart: function (id, qty, options_details, options)
			{
				return new ProductModel({
					internalid: id
				,	quantity: qty
				,	_optionsDetails: options_details
				,	options: options
				});
			}

			// @method getMatrixItem Gets the subitem which properties has the values passed as parameters
			// @return matrix subitem model
		,	getMatrixItem : function(optionsSelected, optionsAvailable)
			{
				var objSearch = {};
				_.each(_.keys(optionsSelected), function(option)
				{
					var optionName = _.findWhere(optionsAvailable, {'cartOptionId' : option}).itemOptionId;
					objSearch[optionName] = optionsSelected[option].label;
				});
				return _.findWhere(this.item.matrixchilditems_detail, objSearch);
			}

			// @method isMatrixChild
			// @return true if this item is matrix
		,	isMatrixChild: function()
			{
				return this.item && this.item.matrix_parent && this.item.itemoptions_detail ? true : false;
			}

		,	clone: function clone ()
			{
				return new ProductListItemModel(this.toJSON());
			}

		,	toJSON: function toJSON ()
			{
				var result = ProductModel.prototype.toJSON.apply(this, arguments)
				,	self = this;

				result.description = this.get('description');
				result.productList = this.get('productList');
				result.priority = this.get('priority');
				result.created = this.get('created');
				result.createddate = this.get('createddate');
				result.lastmodified = this.get('lastmodified');
				result.item.internalid = this.getItem().get('internalid');

				_.each(result.options, function (option)
				{
					var opt = self.get('options').findWhere({cartOptionId: option.cartOptionId});
					option.values = opt && opt.get('values');
				});

				return result;
			}

		,	getItemId: function ()
			{
				//We override this method from the Product.Model so when generating the JSON representation of this model
				//we always return the parent item id
				return this.get('item').get('internalid');
			}
		}
	,	{
		//@method createFromProduct
		//@param {Product.Model} product
		//@return {ProductList.Item.Model}
		createFromProduct: function (product) {
			var attributes = product.toJSON();
			delete attributes.internalid;
			var clientId;
			if (Backbone.history.fragment.split("?").length > 1) { //Added salman June-2019
				var fragmentArray = Backbone.history.fragment.split("?")

				for (var i = fragmentArray.length - 1; i >= 0; i--) {
					if (fragmentArray[i].match('client')) {
						clientId = fragmentArray[i].split("=")[1].split("&")[0];
						break;
					}
				}
			}
			_.each(attributes.options, function (option) {

				//Salman Start 13-June-2019
				var self = this

				var fabricdetails = {
					code: jQuery('#fabric-cmt-code').val(),
					collection: jQuery('#fabric-cmt-collection').val(),
					vendor: jQuery('#fabric-cmt-vendor').val(),
					othervendor: jQuery('#fabric-cmt-othervendorname').val()
				}

				if (option.cartOptionId == 'custcol_othervendorname') {
					var otherVendorName = jQuery('#fabric-cmt-othervendorname').val() ? jQuery('#fabric-cmt-othervendorname').val() : ''
					option.value = {
						internalid: otherVendorName,
						label: otherVendorName
					}
				}

				if (option.cartOptionId == 'custcol_tailor_client') {
					option.value = {
						internalid: clientId,
						label: clientId
					}
				}

				if (option.cartOptionId == 'custcol_custom_fabric_details') {
					option.value = {
						internalid: JSON.stringify(fabricdetails),
						label: JSON.stringify(fabricdetails)
					}
				}

				if (option.cartOptionId == 'custcol_vendorpicked') {
					option.value = {
						internalid: fabricdetails.vendor,
						label: JSON.stringify(fabricdetails)
					}
				}

				// // update design option hidden fields
				if (product.get('custitem_clothing_type') && product.get('custitem_clothing_type') != "&nbsp;") {
					var clothingTypes = product.get('custitem_clothing_type').split(', ');

					var selectedUnits = "CM";

					_.each(clothingTypes, function (clothingType) {
						//Design Option
						var internalId = "custcol_designoptions_" + clothingType.toLowerCase();
						var designOptions = '';
						if (clothingType !== '&nbsp;') {
							var designOptionsList = [];
							jQuery("div#design-option-" + clothingType + "").find(":input").each(function () {
								var currentDesignOptions = {
									'name': jQuery(this).attr("id"),
									'value': jQuery(this).val()
								};
								designOptionsList.push(currentDesignOptions);
							});

							designOptions = designOptionsList;
						}

						if (option.cartOptionId == internalId) {
							option.value = {
								internalid: JSON.stringify(designOptions),
								label: JSON.stringify(designOptions)
							}
						}

						//Fit Profile
						var selectedProfile = jQuery('#profiles-options-' + clothingType).val()
						if (selectedProfile) {
							var fitColumn = "custcol_fitprofile_" + clothingType.toLowerCase();
							var fitValue = '';
							var profile_collection = window.currentFitProfile;
							for (var i = 0; i < profile_collection.length; i++) {
								if (profile_collection[i].internalid == selectedProfile) {
									fitValue = profile_collection[i].custrecord_fp_measure_value;
								}
							}

							var fitProfileValue = JSON.parse(fitValue);
							var fpvIN = JSON.parse(JSON.stringify(fitProfileValue));
							if (fitProfileValue[0].value == 'Inches') {
								_.each(fitProfileValue, function (value, key, obj) {

									if (obj[key].name === 'units') {
										obj[key].value = 'CM';
									}
									//Try parse if value is number
									if (!isNaN(obj[key].value)) {
										obj[key].value = (obj[key].value * 2.54).toFixed(2);
									}
								});
							}
							if (fpvIN[0].value == 'CM') {
								_.each(fpvIN, function (value, key, obj) {

									if (obj[key].name === 'units') {
										obj[key].value = 'Inches';
									}
									//Try parse if value is number
									if (!isNaN(obj[key].value)) {
										obj[key].value = (obj[key].value / 2.54).toFixed(2);
									}
								});
							}
							var fitInColumn = fitColumn + '_in';
							if (option.cartOptionId == fitInColumn) {
								option.value = {
									internalid: JSON.stringify(fpvIN),
									label: JSON.stringify(fpvIN)
								}
							}
							if (option.cartOptionId == fitColumn) {
								option.value = {
									internalid: JSON.stringify(fitProfileValue),
									label: JSON.stringify(fitProfileValue)
								}
							}
						}
					});

					if (option.cartOptionId == 'custcol_producttype') {
						option.value = {
							internalid: product.get('custcol_producttype'),
							label: product.get('custcol_producttype')
						}
					}
					// Updates the quantity of the model
					var fabricQty = jQuery('[name="custcol_fabric_quantity"]').val() ? jQuery('[name="custcol_fabric_quantity"]').val() : "0.00";
					if (option.cartOptionId == 'custcol_fabric_quantity') {
						option.value = {
							internalid: fabricQty,
							label: fabricQty
						}
					}
					if (option.cartOptionId == 'custcol_ps_cart_item_id') {
						option.value = {
							internalid: "ITEM_" + (Date.now() / 1000 | 0),
							label: "ITEM_" + (Date.now() / 1000 | 0)
						}
					}

					if (option.cartOptionId == 'custcol_designoption_message') {
						option.value = {
							internalid: jQuery('#designoption-message').val(),
							label: jQuery('#designoption-message').val()
						}
					}

					if (option.cartOptionId == 'custcol_fitprofile_message') {
						option.value = {
							internalid: jQuery('#fitprofile-message').val(),
							label: jQuery('#fitprofile-message').val()
						}
					}

					if (option.cartOptionId == 'custcol_tailor_cust_pricing') {
						option.value = {
							internalid: jQuery('#fitprofile-message').val(),
							label: jQuery('#fitprofile-message').val()
						}
					}



					var tailorPricing = jQuery('span[itemprop="price"]').attr("data-rate") ? jQuery('span[itemprop="price"]').attr("data-rate").replace(",", "") : "0.00";
					if (option.cartOptionId == 'custcol_tailor_cust_pricing') {
						option.value = {
							internalid: tailorPricing,
							label: tailorPricing
						}
					}

					var fitProfileSummary = [],
						measureList = [],
						measureType = "",
						currentFitProfile = window.currentFitProfile;

					jQuery(".profiles-options-shopflow").each(function (index) {
						var $el = jQuery(this);
						if ($el.find(":selected").text() != "Select a profile") {
							measureList = currentFitProfile;
							var mid = "";
							var blockvalue = "";
							_.each(measureList, function (lineItem) {
								if (lineItem.internalid == $el.find(":selected").val()) {
									measureType = lineItem.custrecord_fp_measure_type;
									mid = lineItem.internalid;
									blockvalue = lineItem.custrecord_fp_block_value;
								}
							});
							fitProfileSummary.push({
								'name': $el.attr('data-type'),
								'value': $el.find(":selected").text(),
								'type': measureType,
								'id': mid,
								'blockvalue': blockvalue
							});

						}
					});

					if (option.cartOptionId == 'custcol_fitprofile_summary') {
						option.value = {
							internalid: JSON.stringify(fitProfileSummary),
							label: JSON.stringify(fitProfileSummary)
						}
					}
				} else {
					if (product.get('itemtype') === "NonInvtPart") {
						if (option.cartOptionId == 'custcol_fabric_quantity') {
							option.value = {
								internalid: jQuery('[name="custcol_fabric_quantity"]').val(),
								label: jQuery('[name="custcol_fabric_quantity"]').val()
							}
						}
					}

					if (option.cartOptionId == 'custcol_ps_cart_item_id') {
						option.value = {
							internalid: "ITEM_" + (Date.now() / 1000 | 0),
							label: "ITEM_" + (Date.now() / 1000 | 0)
						}
					}

					var tailorPricing = jQuery('span[itemprop="price"]').attr("data-rate") ? jQuery('span[itemprop="price"]').attr("data-rate").replace(",", "") : "0.00";
					if (option.cartOptionId == 'custcol_tailor_cust_pricing') {
						option.value = {
							internalid: tailorPricing,
							label: tailorPricing
						}
					}



				}

				// // if (this.model.itemOptions && this.model.itemOptions.GIFTCERTRECIPIENTEMAIL) {
				// //     if (!Backbone.Validation.patterns.email.test(this.model.itemOptions.GIFTCERTRECIPIENTEMAIL.label)) {
				// //         self.showError(_('Recipient email is invalid').translate());
				// //         return;
				// //     }
				// // }

				var dateNeeded = '1/1/1900';
				if (option.cartOptionId == 'custcol_avt_date_needed') {
					option.value = {
						internalid: dateNeeded,
						label: dateNeeded
					}
				}

				if (option.cartOptionId == 'custcol_fabric_extra') {
					option.value = {
						internalid: jQuery('#fabric_extra option:selected').text(),
						label: jQuery('#fabric_extra option:selected').text()
					}
				}

				if (option.cartOptionId == 'custcol_order_list_line_item_total') { //JHD-34
					option.value = {
						internalid: '0.00',
						label: '0.00'
					}
				}

				var isItemChck = jQuery("#chkItem").is(':checked') ? 'T' : 'F';
				if (option.cartOptionId == 'custcolcustcol_item_check') {
					option.value = {
						internalid: isItemChck,
						label: isItemChck
					}
				}

			});

			attributes.item = product.get('item').toJSON();

			attributes.custcol_producttype = product.get('custcol_producttype');
			attributes.custitem_clothing_type = product.get('custitem_clothing_type');
			attributes.quantity = 1;

			return new ProductListItemModel(attributes);
		}

			//@method createFromProduct
			//@param {Product.Model} product
			//@return {ProductList.Item.Model}
		,	createFromTransactionLine: function (transaction_line)
			{
				var attributes = transaction_line.toJSON();

				delete attributes.internalid;

				_.each(attributes.options, function (option)
				{
					option.values = transaction_line.get('options').findWhere({cartOptionId: option.cartOptionId}).get('values');
				});

				return new ProductListItemModel(attributes);
			}
		}
	);

	return ProductListItemModel;
});
