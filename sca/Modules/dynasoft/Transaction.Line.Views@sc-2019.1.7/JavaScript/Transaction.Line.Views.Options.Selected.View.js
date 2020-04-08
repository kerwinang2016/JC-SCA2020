/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Transaction.Line.Views
define('Transaction.Line.Views.Options.Selected.View'
,	[
		'Transaction.Line.Views.Option.View'
	,	'Profile.Model'

	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'

	,	'transaction_line_views_options_selected.tpl'

	,	'Backbone'
	,	'Utils'
	,	'FitProfile.View'
	]
,	function (
		TransactionLineViewsOptionView
	,	ProfileModel
	,	BackboneCompositeView
	,	BackboneCollectionView

	,	transaction_line_views_options_selected_tpl

	,	Backbone
	,	Utils
	,	FitProfileView
	)
{
	'use strict';

	//@class ItemOptions.Options.View.initialize
	//@property {Transaction.Line.Model} model

	//@class ItemOptions.Options.View
	return Backbone.View.extend({

		//@property {Function} template
			fitProfileDataCollection:[],
			template: transaction_line_views_options_selected_tpl

		//@method initialize Override default method to made current view composite
		//@param {ItemOptions.Options.View.initialize} options
		//@return {Void}
	,	initialize: function (options)
		{
			this.profile_model = ProfileModel.getInstance();
			this.options_config = this.profile_model.get('options_config');
			this.designOptionsHtmlContent = '';
			this.fitProfileOptionHtmlContent = '';
			this.client_Id = '';
			this.productType = '';
			this.expectedDateFlag = false;
			this.clientNameFlag = false;
			this.fit_profile_view = new FitProfileView(options);
			BackboneCompositeView.add(this);
		}

		//@property {ChildViews} childViews
	,	childViews: {
			'Options.Collection': function ()
			{
				this.getClientId();
				this.renderLineItemOption(this.options_config, 'designoptions');
				this.renderLineItemOption(this.options_config, 'fitprofile_summary');
				var sortedOptions = [];
				var allValues = this.model.getVisibleOptions();
				//29/08/2019 Saad SAAD
				var sortProductOption = ['custcol_producttype', 'custcol_tailor_client_name','custcol_flag_comment','custcol_expected_delivery_date', 'custcol_avt_date_needed',
				'custcol_designoptions_jacket', 'custcol_designoptions_trouser', 'custcol_designoptions_waistcoat', 'custcol_designoptions_shirt',
				'custcol_designoptions_overcoat','custcol_designoptions_ladiesjacket','custcol_designoptions_ladiespants','custcol_designoptions_ladiesskirt','custcol_designoptions_ssshirt','custcol_designoptions_trenchcoat', 'custcol_fitprofile_jacket', 'custcol_designoption_message', 'custcol_fitprofile_trouser', 'custcol_fitprofile_waistcoat',
				'custcol_fitprofile_shirt', 'custcol_fitprofile_overcoat','custcol_fitprofile_ladiesjacket','custcol_fitprofile_ladiespants','custcol_fitprofile_ladiesskirt','custcol_fitprofile_ssshirt','custcol_fitprofile_trenchcoat','custcol_fitprofile_message', 'custcol_fitprofile_jacket_in', 'custcol_fitprofile_trouser_in',
				'custcol_fitprofile_waistcoat_in', 'custcol_fitprofile_shirt_in', 'custcol_fitprofile_overcoat_in','custcol_fitprofile_ladiesjacket_in','custcol_fitprofile_ladiespants_in','custcol_fitprofile_ladiesskirt_in','custcol_fitprofile_ssshirt_in','custcol_fitprofile_trenchcoat_in', 'custcol_fitprofile_summary', 'custcol_custom_fabric_details',
				'custcol_fabric_quantity', 'custcol_site_cogs','custcol_tailor_cust_pricing', 'custcol_othervendorname', 'custcol_vendorpicked', 'custcol_ps_cart_item_id', 'custcol_tailor_client',
				'custcol_fabric_extra', 'custcol_order_list_line_item_total', 'custcolcustcol_item_check', 'custcol_avt_modified_date_needed', 'custcol_avt_is_modified_date_needed'];
				for(var i = 0; i < sortProductOption.length; i++){
					for(var j = 0; j < allValues.length; j++){
						if(sortProductOption[i] == allValues[j].attributes.cartOptionId){
							sortedOptions.push(allValues[j]);
						}
					}
				}
				var cogsHtmlContent = '';
				var line_option_client_name =this.model.get('options').findWhere({cartOptionId: 'custcol_tailor_client_name'});
				var line_option_expected_date =this.model.get('options').findWhere({cartOptionId: 'custcol_expected_delivery_date'});
				var tempCogsHmtlContent =this.model.get('options').findWhere({cartOptionId: 'custcol_site_cogs'});

				if(!line_option_client_name){
					this.clientNameFlag = true;
				}

				if(!line_option_expected_date){
					this.expectedDateFlag = true;
				}

				if(tempCogsHmtlContent && this.profile_model.get('hidebillingandcogs') == 'F'){
					var value = tempCogsHmtlContent.get('value');
					if(value){
						cogsHtmlContent = value.internalid || value.label
					}
				}

				if(!this.productType){
					var itemName = this.model.get('item').get('_name');
					if(itemName){
						if(itemName.indexOf('2-Piece Suit') != -1){
							this.productType = '2-Piece-Suit';

						} else if(itemName.indexOf('3-Piece Suit') != -1){
							this.productType = '3-Piece-Suit';

						} else if(itemName.indexOf('Shirt') != -1){
							this.productType = 'Shirt';

						} else if(itemName.indexOf('Jacket') != -1){
							this.productType = 'Jacket';

						} else if(itemName.indexOf('Trouser') != -1){
							this.productType = 'Trouser';

						} else if(itemName.indexOf('Waistcoat') != -1){
							this.productType = 'Waistcoat';

						} else if(itemName.indexOf('Overcoat') != -1){
							this.productType = 'Overcoat';
						}
					}
				}
				return new BackboneCollectionView({
					collection: sortedOptions
				,	childView: TransactionLineViewsOptionView
				,	viewsPerRow: 1
				,	childViewOptions: {
						line: this.model
					,	templateName: 'selected'
					,	designOptionsHtmlContent: this.designOptionsHtmlContent
					,	fitProfileOptionHtmlContent: this.fitProfileOptionHtmlContent
					,	productType: this.productType
					,	isProductList: this.options.isProductList
					,	client_Id: this.client_Id
					,	expectedDateFlag: this.expectedDateFlag
					,	clientNameFlag: this.clientNameFlag
					,	itemInternalId: this.model.get('item').get('internalid')
					,	customerId: this.profile_model.get('parent')
					,	cogsHtmlContent: cogsHtmlContent ? cogsHtmlContent : ''
					}
				});
			}
		}

	,	getClientId: function()
		{
			var optionsArr = this.model.get("options").models;
			for(var i = 0; i < optionsArr.length; i++){
				if(optionsArr[i].attributes.cartOptionId == 'custcol_tailor_client'){
					if(_.isObject(optionsArr[i].attributes.value)){
						this.client_Id = optionsArr[i].attributes.value.label || optionsArr[i].attributes.value.internalid;
						window.orderClientID=this.client_Id;
					}

				}
			}

		}

	,	renderLineItemOption : function(designOptionsConfig, fieldType){

		var self = this;
		var clientId=window.orderClientID;
		if(window.location.hash.indexOf('view/salesorder')==-1){
			var url = Utils.getAbsoluteUrl('javascript/extraQuantity.json');
			jQuery.ajax({
				url: url,
				type: 'get',
				async: false,
				success: function(data){
					window.extraQuantity = data;
				}
			});
			self.extraFabricJson = _.find(window.extraQuantity, function(extra){
				if(extra.name == 'extra'){return extra}
			});
			self.designOptionsJson = _.find(window.extraQuantity, function(extra){
				if(extra.name == 'designdetails'){return extra}
			});
		}
		var param = new Object();
			param.type = "get_profile";
			param.data = JSON.stringify({
				filters: ["custrecord_fp_client||anyof|list|" + clientId],
				columns: ["internalid", "name", "created", "lastmodified", "custrecord_fp_product_type", "custrecord_fp_measure_type", "custrecord_fp_measure_value"]
			});
			Utils.requestUrlAsync("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "GET", param).always(function (data) {
				self.fitProfileDataCollection=JSON.parse(data);
			});

			var selected_value = '', clothType = '';
			var CONSTANTS = {
					DESIGNOPTIONS 	: 'custcol_designoptions_',
					FITPROFILE		: 'custcol_fitprofile_'
			}

			var optionsValues = this.model.get("options").models;
			for(var index1 = 0; index1 < optionsValues.length; index1++){
				if(optionsValues[index1].attributes.value){

					selected_value = optionsValues[index1].attributes.value.label || optionsValues[index1].attributes.value.internalid;
					clothType = optionsValues[index1].attributes.cartOptionId;
					if( optionsValues[index1].attributes.cartOptionId == 'custcol_producttype'){
						this.productType = optionsValues[index1].attributes.value.label || optionsValues[index1].attributes.value.internalid;
					}

					if(clothType.indexOf(CONSTANTS.DESIGNOPTIONS) == -1 && clothType.indexOf(CONSTANTS.FITPROFILE) == -1){
						continue;
					}
					var selections = [];
					var clothType = clothType.replace(CONSTANTS.DESIGNOPTIONS, ""); // removes the custcol_designoptions prefix to get the clothType
					this.clothType = (clothType.toLowerCase() != 'ssshirt')?clothType.charAt(0).toUpperCase() + clothType.slice(1):'Short Sleeves Shirt'; // capitalize string
					var currentItemSelectedOptions;
					if(selected_value){
						currentItemSelectedOptions = JSON.parse(selected_value);
					} else {
						continue;
					}

					// console.log(CONSTANTS.DESIGNOPTIONS, currentItemSelectedOptions, selected_value);

					if(fieldType == 'designoptions' && optionsValues[index1].attributes.cartOptionId.indexOf(CONSTANTS.DESIGNOPTIONS) != -1){
					for (var index in currentItemSelectedOptions){
						var currentSelectedOption = currentItemSelectedOptions[index];
						for (var clothingIndex in designOptionsConfig){
							var currentCloth = designOptionsConfig[clothingIndex];
							var currentClothItemType = (currentCloth.item_type) ? currentCloth.item_type.replace(/-/g, '').toLowerCase() : '';
							if(currentCloth.item_type.toLowerCase().indexOf('short-sleeves-shirt')!=-1){currentClothItemType = 'ssshirt';}
							if (currentClothItemType == clothType.toLowerCase()){
								for (var optionsIndex in currentCloth.options){
									var currentOptions = currentCloth.options[optionsIndex];
									for (var fieldIndex in currentOptions.fields){
										var currentField = currentOptions.fields[fieldIndex];

										if (currentField.name == currentSelectedOption.name){
											var isTypeSelect = (currentField.type == 'select') ? true : false;
											var isTypeText = (currentField.type == 'text' || currentField.type == 'number') ? true : false;

											if (isTypeSelect)
											{
												for (var valueIndex in currentField.values){
													var currentValue = currentField.values[valueIndex];
													if (currentValue == currentSelectedOption.value){

														selections.push(
																{ 	"name" 	: currentField.label,
																	"value"	: currentField.texts[valueIndex]
																});
														break;
													}
												}
											}

											if (isTypeText)
											{

												selections.push(
														{ 	"name" 	: currentField.label,
															"value"	: currentSelectedOption.value
														});

											}


										};
									}
								}
							}
						}
					}
					if(selections){
						var template = '';
							template += '<div><b>' + this.clothType + '</b></div>';
							template += '<div>';
							template += '<ul>';
								_.each(selections, function (selection){
									template += '<li>' + selection.name +  ' : ' + selection.value + '</li>';
								});
								template += '</ul>';
								template += '</div>';
						this.designOptionsHtmlContent += template;
					}
				} else if(fieldType == 'fitprofile_summary'){
					if(optionsValues[index1].attributes.cartOptionId == 'custcol_fitprofile_summary'){
					  var selectedFitProfileOptions = JSON.parse(selected_value);
					  var template = '';
					  if (selectedFitProfileOptions) {
						template += '<div><b>Fit Profile Options</b></div>';
						template += '<div>';
						template += '<ul>';
						var quantity = 0;
						var designOptionDetails = [];
						_.each(selectedFitProfileOptions, function (fitProfileOption) {
							var designOptionDetail = _.find(optionsValues, function (optionValue) {
								if(fitProfileOption.name.toLowerCase().indexOf('short-sleeves-shirt')!=-1)
								{
									fitProfileOption.name='ssshirt';
								}
								if (optionValue.get('cartOptionId') == 'custcol_designoptions_'+fitProfileOption.name.replace(/-/g, '').toLowerCase()) {
									return optionValue;
								}
							});
							if(designOptionDetail != undefined && designOptionDetail.get('value') != undefined){
								designOptionDetails.push(JSON.parse(designOptionDetail.get('value').internalid));
							}
						});
						_.each(selectedFitProfileOptions, function (fitProfileOption, index) {
							var fitProfileDetail = _.find(self.fitProfileDataCollection, function (fitProfileRecord) {
								if (fitProfileRecord.internalid == fitProfileOption.id) {
									return fitProfileRecord;
								}
							});
							fitProfileDetail = (fitProfileDetail != undefined) ? JSON.parse(fitProfileDetail.custrecord_fp_measure_value) : [];

							//Jira:JC-49 RFC: added to fetch fitprofile against order from netsuite to display on order history.
							if(window.location.hash.indexOf('view/salesorder')!=-1){
								fitProfileDetail = _.find(optionsValues, function (optionValue) {
									if(fitProfileOption.name.toLowerCase().indexOf('short-sleeves-shirt')!=-1)
									{
										fitProfileOption.name='ssshirt';
									}
									if (optionValue.get('cartOptionId') == 'custcol_fitprofile_'+fitProfileOption.name.replace(/-/g, '').toLowerCase()) {
										return optionValue;
									}
								});
								fitProfileDetail = (fitProfileDetail != undefined) ? JSON.parse(fitProfileDetail.get('value').internalid) : [];
							}else{ //recalculate quantity if on cart page.


								var extraFabricValue = 0.0, extraFabric = _.find(optionsValues, function (optionValue) {
									if (optionValue.get('cartOptionId') == 'custcol_fabric_extra') {
										return optionValue;
									}
								});
								if(extraFabric && extraFabric.get('value')!=undefined){
									_.each(self.extraFabricJson.values, function(type){
										if(type.code == fitProfileOption.name){
											_.each(type.design, function(design){
												if(design.code == extraFabric.get('value').internalid){
													extraFabricValue = parseFloat(design.value);
												}
											})
										}
									})
								}
								var fabricQuantity = _.find(optionsValues, function (optionValue) {
									if (optionValue.get('cartOptionId') == 'custcol_fabric_quantity') {
										return optionValue;
									}
								});

								var product_type = _.find(optionsValues, function(option){
									if(option.get('cartOptionId') == "custcol_producttype"){return option;}
								});

								var existing_quantity = (index == 0) ? 0 : parseFloat(fabricQuantity.get('value').internalid);
								var fitProfileBlockValue = _.find(fitProfileDetail, function(option){
									return option.name == "block";
								});

								var extraDetails = {
									product_type: product_type.get('value').internalid,
									extra_fabric: extraFabricValue,
									existing_quantity: existing_quantity,
									blockValueMapping: (fitProfileBlockValue!=undefined)?(fitProfileOption.name+'-'+fitProfileBlockValue.value).toLowerCase():'',
									design_codes: self.designOptionsJson.values,
									design_options: _.flatten(designOptionDetails)
								};

								quantity = self.fit_profile_view.updateQuantity(fitProfileOption.id, extraDetails);

								//update model with latest fit profile values and quantity.
								_.map(self.model.get('options').models, function(model){
									if(model.get('cartOptionId') == 'custcol_fitprofile_'+fitProfileOption.name.toLowerCase()){
										model.set('value', {label: JSON.stringify(fitProfileDetail), internalid: JSON.stringify(fitProfileDetail)});
									}
									if(model.get('cartOptionId') == 'custcol_fabric_quantity'){
										model.set('value', {label: quantity.toFixed(2), internalid: quantity.toFixed(2)})
									}
								});
							}
							var fitProfileDetailHtml = '<ul>';
							_.each(fitProfileDetail, function(option){
								if(option.value != 0 && option.name.indexOf('-hide-checkbox')==-1){
									fitProfileDetailHtml += "<li>"+option.name +" : "+option.value+"</li>";
								}
							});
							fitProfileDetailHtml += "</ul>";
							if(fitProfileOption.name.toLowerCase().indexOf('ssshirt')!=-1)
							{
								fitProfileOption.name='Short-Sleeves-Shirt';
							}
							template += '<li>' + fitProfileOption.name + ' : ' + fitProfileOption.value + fitProfileDetailHtml +'</li>';
						});
						template += '</ul>';
						template += '</div>';
						this.fitProfileOptionHtmlContent += template;
					}
				   }

				}
			}

		}

		}


		//@method getContext
		//@return {ItemOptions.Options.View.Context}
	,	getContext: function ()
		{
			//@class ItemOptions.Options.View.Context
			return {
				model: this.model
			};
			//@class ItemOptions.Options.View
		}

	});
});
