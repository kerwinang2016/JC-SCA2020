/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductList
define('ProductList.Item.Edit.View'
,	[	'ProductList.Item.Model'
	,	'GlobalViews.StarRating.View'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'ProductViews.Price.View'
	,	'ProductDetails.Options.Selector.View'
	,	'FitProfile.View'

	,	'product_list_edit_item.tpl'

	,	'underscore'
	,	'jQuery'
	,	'Backbone'
	,	'Backbone.FormView'
	,	'Utils'
	]
,	function (
		ProductListItemModel
	,	GlobalViewsStarRatingView
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	ProductViewsPriceView
	,	ProductDetailsOptionsSelectorView
	,	FitProfileView

	,	product_list_edit_item_tpl

	,	_
	,	jQuery
	,	Backbone
	,	BackboneFormView
	,	Utils
	)
{
	'use strict';

	// @class ProductList.Item.Edit.View View to handle Product Lists Item edition. @extends Backbone.View
	return Backbone.View.extend({

		template: product_list_edit_item_tpl

	,	title: _('Edit item').translate()

	,	page_header: _('Edit item').translate()

	,	modalClass: 'global-views-modal-large'

	,	events: {
			'submit form' : 'submitForm'

		//,	'change [name="quantity"]': 'updateQuantity'
		//,	'keypress [name="quantity"]': 'ignoreEnter'
		//,	'click [data-ui-action="add"]' : 'addQuantity'
		//,	'click [data-ui-action="minus"]' : 'subQuantity'

		,	'change [name="description"]': 'updateDescription'
		,	'keypress [name="description"]': 'ignoreEnter'

		,	'change [name="priority"]': 'updatePriority'

		,	'keydown [data-toggle="text-option"]': 'tabNavigationFix'
		,	'focus [data-toggle="text-option"]': 'tabNavigationFix'

		}

	,	bindings: {
			'[name="description"]': 'description'
		}

	,	initialize: function (options)
		{

			var self = this;
			this.options = options;
			this.application = options.application;
			this.parentView = options.parentView;
			this.target = options.target;
			this.title = options.title;
			this.page_header = options.title;
			this.clientId = '';
			this.productType = '';
			this.confirm_edit_method = options.confirm_edit_method;

			BackboneCompositeView.add(this);
			BackboneFormView.add(this);
			
			this.model.get('options').each(function (product_option)
			{
				if (product_option.attributes.cartOptionId == "custcol_tailor_client") {
					if (_.isObject(product_option.attributes.value)) {
						self.clientId = product_option.attributes.value.internalid || product_option.attributes.value.label;
					}
					
				}

				if (product_option.attributes.cartOptionId == "custcol_producttype") { 
					if (_.isObject(product_option.attributes.value)) {
						self.productType = product_option.attributes.value.internalid || product_option.attributes.value.label;
					}
					
				}
			});
		}

		// Edit the current item
	,	submitForm: function (e)
		{
			e.preventDefault();
			var self = this;
			this.setOption();
			this.$('[data-action="edit"]').attr('disabled', 'true');
			this.model.save(null,{validate:false}).done(function (new_attributes)
			{
				self.parentView[self.confirm_edit_method](new_attributes);

				var item_list = _.findWhere(self.application.ProductListModule.Utils.getProductLists().models, {id: self.parentView.model.id});
				item_list && item_list.get('items').get(self.model.id).set('quantity', new_attributes.quantity);

				self.$('[data-action="edit"]').attr('disabled', 'false');
				self.destroy();
				location.hash = '#/wishlist/?';
			
			});
			
		}

		// Updates the quantity of the model
	,	updateQuantity: function (e)
		{
			var new_quantity = parseInt(jQuery(e.target).val(), 10)
			,	min_quantity = this.getMinimumQuantity()
			,	max_quantity = this.getMaximumQuantity()
			,	current_quantity = this.model.get('quantity');

			new_quantity = (new_quantity >= min_quantity) ? new_quantity : min_quantity;

			new_quantity = (max_quantity !== 0 && new_quantity > max_quantity) ? max_quantity : new_quantity;

			jQuery(e.target).val(new_quantity);

			if (new_quantity !== current_quantity)
			{
				this.model.set('quantity', new_quantity);
				this.storeFocus(e);
				this.render();
			}
		}

		// @method addQuantity Increase the product's Quantity by 1
		// @param {HTMLEvent} e
	,	addQuantity: function (e)
		{
			e.preventDefault();

			var $element = jQuery(e.target)
			,	oldValue = $element.parent().find('input').val()
			,	newVal = parseInt(oldValue, 10) + 1;

			var input = $element.parent().find('input');

			input.val(newVal);
			input.trigger('change');
		}

		// @method subQuantity Decreases the product's Quantity by 1
		// @param {HTMLEvent} e
	,	subQuantity: function (e)
		{
			e.preventDefault();

			var $element = jQuery(e.target)
			,	oldValue = $element.parent().find('input').val()
			,	newVal = parseInt(oldValue, 10) - 1;

			newVal = Math.max(1, newVal);

			var input = $element.parent().find('input');

			input.val(newVal);
			input.trigger('change');
		}

		// @method getMinimumQuantity Returns the minimum purchasable quantity of the active item
	,	getMinimumQuantity : function()
		{
			return this.getMinMaxQuantity('_minimumQuantity', 1);
		}

	// @method getMaximumQuantity Returns the minimum purchasable quantity of the active item
	,	getMaximumQuantity : function()
		{
			return this.getMinMaxQuantity('_maximumQuantity', 0);
		}

	,	getMinMaxQuantity: function(minMax, minMaxNumber)
		{
			if(this.model.isMatrixChild())
			{
				var optionsSelected = this.model.get('itemDetails').itemOptions
				,	optionsAvailable = this.model.get('itemDetails').getPosibleOptions()
				,	activeItem = this.model.getMatrixItem(optionsSelected, optionsAvailable);

				return activeItem && activeItem.get(minMax) ? activeItem.get(minMax) : minMaxNumber;
			}
			else
			{
				return this.model.get('item').get(minMax) ? this.model.get('item').get(minMax) : minMaxNumber;
			}
		}

		// Updates the description of the model
	,	updateDescription: function (e)
		{
			var new_description = jQuery(e.target).val()
			,	current_description = this.model.get('description');

			if (new_description !== current_description)
			{
				this.model.set('description', new_description);
				this.storeFocus(e);
			}
		}

		// Updates the priority of the model
	,	updatePriority: function (e)
		{
			var new_priority = jQuery(e.target).val()
			,	current_priority = this.model.get('priority');

			if (new_priority !== current_priority)
			{
				this.model.set('priority', {id: new_priority } );
				this.storeFocus(e);
			}
		}

		// Sets an item option (matrix or custom)
	,	setOption: function ()
		{
			var self = this;
			var optionsLength = this.model.get('options').models.length;

			var productTypeArr = {
				"3-Piece-Suit": ['Jacket', 'Trouser', 'Waistcoat']
			,   "2-Piece-Suit": ['Jacket', 'Trouser']
			,   "L-3PC-Suit": ['Ladies-Jacket', 'Ladies-Skirt', 'Ladies-Pants']
			,   "L-2PC-Skirt": ['Ladies-Jacket', 'Ladies-Skirt']
			,   "L-2PC-Pants": ['Ladies-Jacket', 'Ladies-Pants']
			}
			
			var clothingTypes = (productTypeArr[this.productType] != undefined) ? productTypeArr[this.productType] : [this.productType];

			// clothingTypes = tempClothingType[0].split(', ');
		
			for (var i = 0; i < optionsLength; i++) {
		
				if (this.model.get('options').models[i].attributes.cartOptionId == 'custcol_othervendorname') {
					var otherVendorName = jQuery('#fabric-cmt-othervendorname').val() ? jQuery('#fabric-cmt-othervendorname').val() : ''
					this.model.get('options').models[i].attributes.value = {
						internalid: otherVendorName,
						label: otherVendorName
					}
				}
		
				var index = i;
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
		
					if (self.model.get('options').models[index].attributes.cartOptionId == internalId) {
						self.model.get('options').models[index].attributes.value = {
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
						if (self.model.get('options').models[index].attributes.cartOptionId == fitInColumn) {
							self.model.get('options').models[index].attributes.value = {
								internalid: JSON.stringify(fpvIN),
								label: JSON.stringify(fpvIN)
							}
						}
						if (self.model.get('options').models[index].attributes.cartOptionId == fitColumn) {
							self.model.get('options').models[index].attributes.value = {
								internalid: JSON.stringify(fitProfileValue),
								label: JSON.stringify(fitProfileValue)
							}
						}
					}
				});
		
		
				// Updates the quantity of the model
				var fabricQty = jQuery('[name="custcol_fabric_quantity"]').val() ? jQuery('[name="custcol_fabric_quantity"]').val() : "0.00";
				if (this.model.get('options').models[i].attributes.cartOptionId == 'custcol_fabric_quantity') {
					this.model.get('options').models[i].attributes.value = {
						internalid: fabricQty,
						label: fabricQty
					}
				}
		
		
				if (this.model.get('options').models[i].attributes.cartOptionId == 'custcol_designoption_message') {
					this.model.get('options').models[i].attributes.value = {
						internalid: jQuery('#designoption-message').val(),
						label: jQuery('#designoption-message').val()
					}
				}
		
				if (this.model.get('options').models[i].attributes.cartOptionId == 'custcol_fitprofile_message') {
					this.model.get('options').models[i].attributes.value = {
						internalid: jQuery('#fitprofile-message').val(),
						label: jQuery('#fitprofile-message').val()
					}
				}
		
				if (this.model.get('options').models[i].attributes.cartOptionId == 'custcol_tailor_cust_pricing') {
					this.model.get('options').models[i].attributes.value = {
						internalid: jQuery('#fitprofile-message').val(),
						label: jQuery('#fitprofile-message').val()
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
		
				if (this.model.get('options').models[i].attributes.cartOptionId == 'custcol_fitprofile_summary') {
					this.model.get('options').models[i].attributes.value = {
						internalid: JSON.stringify(fitProfileSummary),
						label: JSON.stringify(fitProfileSummary)
					}
				}
		
		
		
				if (this.model.get('options').models[i].attributes.cartOptionId == 'custcol_fabric_extra') {
					this.model.get('options').models[i].attributes.value = {
						internalid: jQuery('#fabric_extra option:selected').text(),
						label: jQuery('#fabric_extra option:selected').text()
					}
				}

			}
		}

		// view.storeFocus
		// Computes and store the current state of the item and refresh the whole view, re-rendering the view at the end
		// This also updates the url, but it does not generates a history point
	,	storeFocus: function ()
		{
			var focused_element = this.$(':focus').get(0);

			this.focusedElement = focused_element ? Utils.getFullPathForElement(focused_element) : null;
		}

		// view.tabNavigationFix:
		// When you blur on an input field the whole page gets rendered,
		// so the function of hitting tab to navigate to the next input stops working
		// This solves that problem by storing a a ref to the current input
	,	tabNavigationFix: function (e)
		{
			this.hideError();

			// If the user is hitting tab we set tabNavigation to true, for any other event we turn ir off
			this.tabNavigation = (e.type === 'keydown' && e.which === 9);
			this.tabNavigationUpsidedown = e.shiftKey;
			this.tabNavigationCurrent = Utils.getFullPathForElement(e.target);
		}

	,	afterAppend: function ()
		{
			this.focusedElement && this.$(this.focusedElement).focus();

			if (this.tabNavigation)
			{
				var current_index = this.$(':input').index(this.$(this.tabNavigationCurrent).get(0))
				,	next_index = this.tabNavigationUpsidedown ? current_index - 1 : current_index + 1;

				this.$(':input:eq('+ next_index +')').focus();
			}
		}

		// view.showInModal:
		// Takes care of showing the pdp in a modal, and changes the template, doesn't trigger the
		// after events because those are triggered by showContent
	,	showInModal: function (options)
		{
			this.template = 'product_list_edit_item';

			return this.application.getLayout().showInModal(this, options);
		}

		// don't want to trigger form submit when user presses enter when in the quantity input text
	,	ignoreEnter: function (e)
		{
			if (e.keyCode === 13)
			{
				e.preventDefault();
				e.stopPropagation();
			}
		}

	,	childViews:
		{
			'ItemViews.Price': function()
			{
				return new ProductViewsPriceView({
					model:this.model
				,	origin: 'PRODUCTLISTDETAILSEDIT'
				});
			}
		,	'GlobalViews.StarRating': function()
			{
				return new GlobalViewsStarRatingView({
					model:this.model.get('item')
				});
			}
		,	'ItemDetails.Options': function()
			{
				return new ProductDetailsOptionsSelectorView({
					model: this.model
				,	selected_line_data: this.options.selectedEditOptions
				,	options_holder: this.options.options_holder
					
				});
			}
		,	'FitProfile':function()
		{ 
			
			if(this.options.options_holder){
				var selectedFitProfile = this.options.options_holder['custcol_fitprofile_summary'];
			}
			return new FitProfileView({
				model:this.model
			,	clientID: this.clientId
			,	selectedFitProfilesObj: selectedFitProfile
			,	productListEditProductType: this.productType
			});

			

		}	
		}

		// @method getContext
		// @return {ProductList.Item.Edit.View.Context}
	,	getContext: function()
		{
			var line = this.model
			,	item = line.get('item')
			,	min_quantity = item.get('_minimumQuantity')
			,	max_quantity = this.getMaximumQuantity()
			,	priority = line.get('priority')
			,	quantity = 1;

			this.model.get('options').each(function (product_option) {
				if (product_option.attributes.cartOptionId == "custcol_fabric_quantity") {
					if (_.isObject(product_option.attributes.value)) {
						quantity = product_option.attributes.value.internalid || product_option.attributes.value.label
					}
					
				}
			});

			//@class ProductList.Item.Edit.View.Context
			return {
				//@property {Boolean} showRating
				showRating: SC.ENVIRONMENT.REVIEWS_CONFIG && SC.ENVIRONMENT.REVIEWS_CONFIG.enabled
				// @property {Integer} quantity
			,	quantity : quantity
				//@property {Boolean} showMinimumQuantity
			,	showMinimumQuantity: min_quantity > 1
				//@property {Number} minQuantity
			,	minQuantity: min_quantity
				//@property {Boolean} showMaximumQuantity
			,	showMaximumQuantity: max_quantity > 0
				//@property {Number} maxQuantity
			,	maxQuantity: max_quantity
				// @property {String} description
			,	description : line.get('description')
				// @property {String} productId
			,	productId : item.get('internalid')
				// @property {String} productName
			,	productName : item.get('_name')
				// @property {String} itemCreatedDate
			,	itemCreatedDate : line.get('created')
				// @property {Boolean} isSelectionCompleteForEdit
			,	isSelectionCompleteForEdit : line.areAttributesValid(['quantity','options'], {})
				// @property {Boolean} isPriority1
			,	isPriority1 : priority.id === '1'
				// @property {Boolean} isPriority2
			,	isPriority2 : priority.id === '2'
				// @property {Boolean} isPriority3
			,	isPriority3 : priority.id === '3'
				// @property {ImageContainer} thumbnail
			,	thumbnail: this.model.getThumbnail()
			};
		}
	});
});
