/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Transaction
define('LiveOrder.Line.Model'
,	[
		'Transaction.Line.Model'
	,	'Item.Model'
	,	'underscore'
	,	'Utils'
	]
,	function (
		TransactionLineModel
	,	ItemModel
	,	_
	)
{
	'use strict';

	var LiveOrderLineModel = TransactionLineModel.extend(
		{
			urlRoot: _.getAbsoluteUrl('services/LiveOrder.Line.Service.ss')

		,	initialize: function initialize ()
			{
				// call the initialize of the parent object, equivalent to super()
				TransactionLineModel.prototype.initialize.apply(this, arguments);

				this.on('error', function (model, jqXhr)
				{
					var result = JSON.parse(jqXhr.responseText)
					,	error_details = result.errorDetails;

					if (error_details && error_details.status === 'LINE_ROLLBACK')
					{
						model.set('internalid', error_details.newLineId);
					}
				});

			}
			// @method toJSON Override default method to send only require data to the back-end
			// @return {Transaction.Line.Model.JSON}
		,	toJSON: function toJSON ()
			{

				// @class Transaction.Line.Model.JSON Class used to send a transaction line representation to the back-end
				// without sending all the heavy weight JSON that is not totally needed by the back-end
				// @public @extlayer
				return {
					// @property {Transaction.Line.Model.JSON.Item} item @public @extlayer
					// @class Transaction.Line.Model.JSON.Item  @public @extlayer
					item: {
						// @property {String} internalid @public @extlayer
						internalid: this.getItemId()
						// @property {String} type @public @extlayer
					,	type: this.attributes.item.get('itemtype')
					}
					// @class Transaction.Line.Model.JSON
					// @property {Number} quantity @public @extlayer
				,	quantity: this.attributes.quantity
					// @property {String} internalid @public @extlayer
				,	internalid: this.attributes.internalid
					// @property {Arra<Object>} options @public @extlayer
				,	options: this.get('options').toJSON()
					// @property {Number} splitquantity @public @extlayer
				,	splitquantity: this.attributes.splitquantity
					// @property {Number} shipaddress @public @extlayer
				,	shipaddress: this.attributes.shipaddress
					// @property {Number} shipmethod @public @extlayer
				,	shipmethod: this.attributes.shipmethod
					// @property {Number} location @public @extlayer
				,	location: this.attributes.location && this.attributes.location.attributes && this.attributes.location.attributes.internalid || ''
					// @property {String} fulfillmentChoice @public @extlayer
				,	fulfillmentChoice: this.attributes.fulfillmentChoice || 'ship'
					//@property {Boolean} freeGift
				,	freeGift: this.attributes.free_gift === true
				};
				//@class Transaction.Line.Model
			}

			// @method isEqual Compares two LiveOrder lines and answer if they are the same
			// We are extending Transaction.Line.Model here; this method overrides the namesake one in this model.
			// This is so because if pickup in store is enabled, we need to differentiate between lines that look the same but has different delivery methods
			// @param {Transaction.Line.Model} other_line
			// @return {Boolean}
		,	isEqual: function isEqual (other_line)
			{
				return !!(other_line && this.getItemId() === other_line.getItemId() &&
					_.isEqual(this.get('options').toJSON(), other_line.get('options').toJSON()) &&
					(this.get('location') && this.get('location').get('internalid')) === (other_line.get('location') && other_line.get('location').get('internalid')) &&
					this.get('fulfillmentChoice') === other_line.get('fulfillmentChoice') );
			}
		}

	,	{
			// @method createFromProduct
			// @param {Product.Model} product
			// @return {LiveOrder.Line.Model}
			createFromProduct: function createFromProduct (product, expectedDate, clientName, isProductListModule)
			{
				var clientId;
				if (Backbone.history.fragment.split("?").length > 1) { //Added salman June-2019
					var fragmentArray = Backbone.history.fragment.split("?")
				
					for (var i = fragmentArray.length - 1; i >= 0; i--) {
						if (fragmentArray[i].match('client')) {
							var tempClientIdSplit = fragmentArray[i].split("=")[1].split("&")[0];
							
							if(tempClientIdSplit.indexOf('|') != '-1'){
								clientId = tempClientIdSplit.split('|')[0];
							} else {
								clientId = tempClientIdSplit;
							}

							break;
						}
					}
				}
				var line = new LiveOrderLineModel(product.toJSON())
				,	item = product.get('item')
				,	item_images_detail = item.get('itemimages_detail')
				,	is_matrix_item = !!item.get('_matrixChilds').length;

				if (_.isEqual(item_images_detail, {}) && item.get('_matrixParent').get('internalid') && item.get('_matrixParent').get('itemimages_detail'))
				{
					item_images_detail = item.get('_matrixParent').get('itemimages_detail');
				}

				line.set('item', product.getItem().clone(), {silent:true});
				line.get('item').set('itemimages_detail', item_images_detail, {silent:true});
				line.get('item').set('itemid', item.get('itemid'), {silent:true});
				line.set('rate_formatted', product.getPrice().price_formatted, {silent:true});

				if(isProductListModule){
					product.get('options').each(function (product_option)
					{
						
						var line_option = line.get('options').findWhere({cartOptionId: product_option.get('cartOptionId')});
						line_option.attributes = _.extend({}, product_option.attributes, line_option.attributes);
					});
				} else {
					product.get('options').each(function (product_option)
					{
						var line_option = line.get('options').findWhere({cartOptionId: product_option.get('cartOptionId')});

										//Salman Start 13-June-2019
					var self = this

					var fabricdetails = {
						code: jQuery('#fabric-cmt-code').val(),
						collection: jQuery('#fabric-cmt-collection').val(),
						vendor: jQuery('#fabric-cmt-vendor').val(),
						othervendor: jQuery('#fabric-cmt-othervendorname').val()
					}
					
					if (line_option.attributes.cartOptionId == 'custcol_othervendorname') {
						var otherVendorName = jQuery('#fabric-cmt-othervendorname').val() ? jQuery('#fabric-cmt-othervendorname').val() : ''
						line_option.attributes.value = {internalid: otherVendorName, label: otherVendorName}
					}
					
					if (line_option.attributes.cartOptionId == 'custcol_expected_delivery_date') {
						if(expectedDate){
							var temp = expectedDate.split('-');
							var date = temp[2] + '/' + temp[1] + '/' + temp[0];
							line_option.attributes.value = {internalid: date, label: date}

						}
					}

					if (line_option.attributes.cartOptionId == 'custcol_tailor_client_name') {
						line_option.attributes.value = {internalid: clientName, label: clientName}
					}

					if (line_option.attributes.cartOptionId == 'custcol_custom_fabric_details') {
						line_option.attributes.value = {internalid: JSON.stringify(fabricdetails), label: JSON.stringify(fabricdetails)}
					}

					if (line_option.attributes.cartOptionId == 'custcol_vendorpicked') {
						line_option.attributes.value = {internalid: fabricdetails.vendor, label: JSON.stringify(fabricdetails)}
					}

					// // update design option hidden fields
					if (product.get('custitem_clothing_type') && product.get('custitem_clothing_type') != "&nbsp;") {
						var clothingTypes = product.get('custitem_clothing_type').split(', ');
						
						var selectedUnits = "CM";

						_.each(clothingTypes, function (clothingType) {
							//Design Option
							if(clothingType.toLowerCase().indexOf('short-sleeves-shirt')!=-1){clothingType = 'ssshirt';}
							var internalId = "custcol_designoptions_" + clothingType.trim().replace(/-/g, "").toLowerCase();
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

							if (line_option.attributes.cartOptionId == internalId) {
								line_option.attributes.value = {internalid: JSON.stringify(designOptions), label: JSON.stringify(designOptions)}
							}

							//Fit Profile
							var selectedProfile = jQuery('#profiles-options-' + clothingType).val()
							if (selectedProfile) {
								var fitColumn = "custcol_fitprofile_" + clothingType.trim().replace(/-/g, "").toLowerCase();
								var fitValue = '';
								var profile_collection = window.currentFitProfile;
								for(var i = 0; i < profile_collection.length; i++){
									if(profile_collection[i].internalid == selectedProfile){
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
											obj[key].value = (obj[key].value/2.54).toFixed(2);
										}
									});
								}
								var fitInColumn = fitColumn+'_in';
								if (line_option.attributes.cartOptionId == fitInColumn) {
									line_option.attributes.value = {internalid: JSON.stringify(fpvIN), label: JSON.stringify(fpvIN)}
								}
								if (line_option.attributes.cartOptionId == fitColumn) {
									line_option.attributes.value = {internalid: JSON.stringify(fitProfileValue), label: JSON.stringify(fitProfileValue)}
								}
							}
						});
						
						if (line_option.attributes.cartOptionId == 'custcol_producttype') {
							line_option.attributes.value = {internalid: product.get('custcol_producttype'), label: product.get('custcol_producttype')}
						}
						// Updates the quantity of the model
						var fabricQty = jQuery('[name="custcol_fabric_quantity"]').val() ?  jQuery('[name="custcol_fabric_quantity"]').val() : "0.00";
						if (line_option.attributes.cartOptionId == 'custcol_fabric_quantity') {
							line_option.attributes.value = {internalid: fabricQty, label: fabricQty}
						}
						if (line_option.attributes.cartOptionId == 'custcol_ps_cart_item_id') {
							line_option.attributes.value = {internalid: "ITEM_" + (Date.now() / 1000 | 0), label: "ITEM_" + (Date.now() / 1000 | 0)}
						}

						if (line_option.attributes.cartOptionId == 'custcol_designoption_message') {
							line_option.attributes.value = {internalid: jQuery('#designoption-message').val(), label: jQuery('#designoption-message').val()}
						}

						if (line_option.attributes.cartOptionId == 'custcol_fitprofile_message') {
							line_option.attributes.value = {internalid: jQuery('#fitprofile-message').val(), label: jQuery('#fitprofile-message').val()}
						}

						if (line_option.attributes.cartOptionId == 'custcol_tailor_client') {
							line_option.attributes.value = {internalid: clientId, label: clientId}
						}
						
						var tailorPricing = jQuery('span[itemprop="price"]').attr("data-rate") ? jQuery('span[itemprop="price"]').attr("data-rate").replace(",", "") : "0.00";
						if (line_option.attributes.cartOptionId == 'custcol_tailor_cust_pricing') {
							line_option.attributes.value = {internalid: tailorPricing, label: tailorPricing}
						}

						var fitProfileSummary = []
							, measureList = []
							, measureType = ""
							, currentFitProfile = window.currentFitProfile;

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
						
						if (line_option.attributes.cartOptionId == 'custcol_fitprofile_summary') {
							line_option.attributes.value = {internalid: JSON.stringify(fitProfileSummary), label: JSON.stringify(fitProfileSummary)}
						}
					} else {
						if (product.get('itemtype') === "NonInvtPart") {
							if (line_option.attributes.cartOptionId == 'custcol_fabric_quantity') {
								line_option.attributes.value = {internalid: jQuery('[name="custcol_fabric_quantity"]').val(), label: jQuery('[name="custcol_fabric_quantity"]').val()}
							}
						}

						if (line_option.attributes.cartOptionId == 'custcol_ps_cart_item_id') {
							line_option.attributes.value = {internalid: "ITEM_" + (Date.now() / 1000 | 0), label: "ITEM_" + (Date.now() / 1000 | 0)}
						}
						
						var tailorPricing = jQuery('span[itemprop="price"]').attr("data-rate") ? jQuery('span[itemprop="price"]').attr("data-rate").replace(",", "") : "0.00";
						if (line_option.attributes.cartOptionId == 'custcol_tailor_cust_pricing') {
							line_option.attributes.value = {internalid: tailorPricing, label: tailorPricing}
						}

						if (line_option.attributes.cartOptionId == 'custcol_tailor_client') {
							line_option.attributes.value = {internalid: clientId, label: clientId}
						}

					}
					
					// // if (this.model.itemOptions && this.model.itemOptions.GIFTCERTRECIPIENTEMAIL) {
					// //     if (!Backbone.Validation.patterns.email.test(this.model.itemOptions.GIFTCERTRECIPIENTEMAIL.label)) {
					// //         self.showError(_('Recipient email is invalid').translate());
					// //         return;
					// //     }
					// // }

					var dateNeeded = '1/1/1900';
					var holdFabric = 'F';
					var holdProduction = 'F';
					if (line_option.attributes.cartOptionId == 'custcol_avt_modified_date_needed') {
						line_option.attributes.value = {internalid: dateNeeded, label: dateNeeded}
					}
					
					if (line_option.attributes.cartOptionId == 'custcol_avt_wbs_copy_key') {
						line_option.attributes.value = {internalid: 'No Copy', label: 'No Copy'}
					}

					if (line_option.attributes.cartOptionId == 'custcol_site_cogs') {
						line_option.attributes.value = {internalid: '<div></div>', label: '<div></div>'}
					}
					
					if (line_option.attributes.cartOptionId == 'custcol_avt_date_needed') {
						line_option.attributes.value = {internalid: dateNeeded, label: dateNeeded}
					}

					if (line_option.attributes.cartOptionId == 'custcol_fabric_extra') {
						line_option.attributes.value = {internalid: jQuery('#fabric_extra option:selected').text(), label: jQuery('#fabric_extra option:selected').text()}
					}

					if (line_option.attributes.cartOptionId == 'custcol_order_list_line_item_total') { //JHD-34
						line_option.attributes.value = {internalid: '0.00', label: '0.00'}
					}

					var isItemChck = jQuery("#chkItem").is(':checked') ? 'T' : 'F';
					if (line_option.attributes.cartOptionId == 'custcolcustcol_item_check') {
						line_option.attributes.value = {internalid: isItemChck, label: isItemChck}
					}
				
					//Salman End 13-June-2019

						line_option.attributes = _.extend({}, product_option.attributes, line_option.attributes);
					});

			}
				if (is_matrix_item)
				{
					line.get('item').set('matrix_parent', product.get('item'));
				}
				
				return line;
			}
		
			// @method createFromOuterLine Creates a LiveOrder.Line.Model from the outer representation of a line exposed by Extensibility Layer
			// @param {Line} outer_line
			// @return {LiveOrder.Line.Model}
		,	createFromOuterLine: function createFromOuterLine (outer_line)
			{
				var item = outer_line.item;
				
				outer_line = _.extend(outer_line, outer_line.extras);
				delete outer_line.extras;
				
				item = _.extend(item, item.extras);
				delete item.extras;
				outer_line.item = item;
				
				var new_line = new LiveOrderLineModel(outer_line);
				return new_line;
			}
		}
	);

	return LiveOrderLineModel;
});
