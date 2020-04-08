/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductDetails
define('ProductDetails.Options.Selector.View'
,	[
	   	'Profile.Model'
	,	'ProductViews.Option.View'

	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'ProductViews.Price.View'
	,	'ProductLine.Stock.View'
	,	'ProductLine.StockDescription.View'
	,	'ProductDetails.Options.Selector.Pusher.View'

	,	'product_details_options_selector.tpl'

	,	'Backbone'
	,	'Utils'
	]
,	function (
		ProfileModel
	,	ProductViewsOptionView

	,	BackboneCompositeView
	,	BackboneCollectionView
	,	ProductViewsPriceView
	,	ProductLineStockView
	,	ProductLineStockDescriptionView
	,	ProductDetailsOptionsSelectorPusherView

	,	product_details_options_selector_tpl

	,	Backbone
	,	Utils
	)
{
	'use strict';

	//@class ProductDetails.Options.Selector.View.initialize
	//@property {Transaction.Line.Model} model

	return Backbone.View.extend({

			//@property {Function} template
			template: product_details_options_selector_tpl

			//@method initialize Override default method to made current view composite
			//@param {ProductDetails.Options.Selector.View.initialize} options
			//@return {Void}
		,	initialize: function ()
			{
				this.profile_model = ProfileModel.getInstance();
				this.designRestrictions = JSON.parse(JSON.parse(this.profile_model.get('designoptionRestrictionData')));
				this.favouriteOptions =  JSON.parse(JSON.parse(this.profile_model.get('favouriteOptionsData')));
				this.options_config = this.profile_model.get('options_config');
				this.count = 0;
				this.selectedLineObj = this.options.selected_line_obj;
				this.selectedLineData = this.options.selected_line_data;
				Backbone.View.prototype.initialize.apply(this, arguments);
				BackboneCompositeView.add(this);
			}

			//@method render Override default method to made current view composite
			//@param {ProductDetails.Options.Selector.View.render}
			//@return {Void}
		,	render: function ()
			{
				if (!this.model.get('options').length)
				{
					return;
				}

				this._render();
			}
			//@property {ChildViews} childViews
		,	childViews: {
				'Pusher': function ()
				{
					return new ProductDetailsOptionsSelectorPusherView({
						model: this.model
					});
				}
			,	'Options.Collection': function ()
				{
					var selectedDesignOption = this.getSelectedDesignOption();
					var selectedCategoryNameArr = this.model.get('custitem_clothing_type').split(',');
					var tempCollection = this.model.getVisibleOptions();
					var collection = [];
					var flag = false;
					for (var i = 0; i < tempCollection.length; i++) { //Will fix it with actual data
						if(!flag){
							var categoryName = tempCollection[i].get('label').replace(/\s+/g, '');
							for (var j = 0; j < selectedCategoryNameArr.length; j++) {
								if (categoryName.indexOf(selectedCategoryNameArr[j].trim()) != -1 || categoryName.indexOf(selectedCategoryNameArr[j].replace(/-/g, "").trim()) != -1) {
									collection.push(tempCollection[i]);
									flag = true;
									break;
								}
							}

						} else {
							break;
						}
					}
					return new BackboneCollectionView({
						collection: collection
					,	childView: ProductViewsOptionView
					,	viewsPerRow: 1
					,	childViewOptions: {
							line: this.model
						,	item: this.model.get('item')
						,	templateName: 'selector'
						,	show_required_label: this.options.show_required_label
						,	selectedDesignOption : selectedDesignOption
						,	options_holder: this.options.options_holder
						}
					});
				}
			,	'Item.Price': function ()
				{
					return new ProductViewsPriceView({
						model: this.model
					,	origin: 'PDPOPTIONS'
					});
				}
			,	'Item.Stock': function ()
				{
					return new ProductLineStockView({
						model: this.model
					});
				}
			,	'StockDescription': function ()
				{
					return new ProductLineStockDescriptionView({
						model: this.model
					});
				}
			}

			,	getSelectedDesignOption: function ()
				{
					var options_config = this.options_config
						, 	favouriteOptions = this.favouriteOptions
						, 	designRestrictions = this.designRestrictions
						, 	designOptions = new Object();
					var currentItemTypes;
					if (this.model.get('custitem_clothing_type') && this.model.get('custitem_clothing_type') != "" && this.model.get('custitem_clothing_type') != "nbsp;"){
						currentItemTypes = this.model.get('custitem_clothing_type').split(', ');
					}

					//03-12-2019 umar & saad
					var param ={};
					param.id=this.profile_model.get('parent');
					param.type="get_designoption_restriction";
					_.requestUrlAsync("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "GET", param).always(function (designData) {
						designRestrictions = JSON.parse(JSON.parse(designData));
					});
					_.each(options_config, function(clothingType){

						if (currentItemTypes && currentItemTypes.indexOf(clothingType.item_type) >= 0){
							// iterate clothing component for each clothing type (Style and Make, Lapel, etc)
							_.each(clothingType.options, function(component){

								// iterate every options for each component
								_.each(component.fields, function(field){
									// find restrictions
									var currentRestriction = _.where(designRestrictions, {name: field.name}),
										currentValues = [],
										restrictions = null;

									// restrict fields to be displayed
									if (currentRestriction && currentRestriction.length > 0){
										restrictions = currentRestriction[0].value.trim().split(",");
									}

									var currentFavouriteOption = favouriteOptions ? favouriteOptions[field.name] : "";
									// set restrictions
									for(var i = 0; i < field.values.length; i++){
										var currentFieldValue = field.values[i];
										var isFavourite = currentFieldValue == currentFavouriteOption;

										var isSelectType = (field.type == 'select') ? true : false;
										var isTextType = (field.type == 'text') ? true : false;
										var isNumberType = (field.type == 'number') ? true : false;
										if (isSelectType)
										{

											if (restrictions && restrictions != null){
												// for items with restrictions, only add options that are indicated in the config
												if (restrictions.indexOf(field.values[i]) >= 0){
													currentValues.push({
														name	:	field.texts[i],
														value	:	field.values[i],
														isFavourite : isFavourite
													});
												}
											} else {

												currentValues.push({
													name	:	field.texts[i],
													value	:	field.values[i],
													isFavourite : isFavourite
												});
											}
											
											// instantiate if object does not exist yet
											if (!designOptions[clothingType.item_type]){
												designOptions[clothingType.item_type] = {};
											}

											if (!designOptions[clothingType.item_type][component.label]){
												designOptions[clothingType.item_type][component.label] = {}
											}

											// set field values to be displayed
											if (currentValues.length > 0){
												designOptions[clothingType.item_type][component.label][field.label] = {
														type 	:	field.type,
														values 	:	currentValues,
														label	:	field.label,
														name	: 	field.name
												};
											}
										}
										if (isTextType || isNumberType)
										{
											// instantiate if object does not exist yet
											if (!designOptions[clothingType.item_type]){
												designOptions[clothingType.item_type] = {};
											}
											designOptions[clothingType.item_type][component.label][field.label] = {
													type 	:	field.type,
													label	:	field.label,
													name	: 	field.name,
													maxlength: field.maxlength?field.maxlength:"",
													placeholder: field.placeholder?field.placeholder:"",
													dataplaceholder: field.dataplaceholder? field.dataplaceholder: "",
													datatype: field.datatype? field.datatype: "",
													value	: 	''//currentFavouriteOption?currentFavouriteOption:(_.isObjectExist(objCartDesignOptionsMapping['' + field.name + ''])) ? objCartDesignOptionsMapping['' + field.name + ''] : ''
											};
										}

									}
								});
							});

						}

					});
					return designOptions;

				}

			//@method getContext
			//@return {ProductDetails.Options.Selector.View.Context}
		,	getContext: function ()
			{
				//@class ProductDetails.Options.Selector.View.Context
				return {
						//@property {ProductModel} model
						model: this.model
						//@property {Boolean} showPusher
					,	showPusher: this.options.show_pusher
						//@property {Boolean} showRequiredLabel
					,	showRequiredLabel: this.options.show_required_label
				};
				//@class ProductDetails.Options.Selector.View
			}

	});
});
