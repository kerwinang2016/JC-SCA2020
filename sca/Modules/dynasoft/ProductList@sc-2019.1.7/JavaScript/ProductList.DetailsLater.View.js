/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductList
define('ProductList.DetailsLater.View'
	,	[
			'product_list_details_later.tpl'
		,	'ProductList.DetailsLaterMacro.View'
		,	'ProductList.Details.View'
		,	'ProductList.Deletion.View'
		,	'LiveOrder.Model'
		,	'Profile.Model'
		,	'ProductList.Item.Collection'
		
		,	'Backbone.CollectionView'
		,	'Backbone.CompositeView'

		,	'products_detail_later_cell.tpl'
		,	'backbone_collection_view_row.tpl'		

		,	'underscore'
		,	'jQuery'
		,	'Backbone'
		,	'Backbone.View'
		,	'Backbone.View.render'
		]
	,	function(
			product_list_details_later_tpl
		,	ProductListDetailsLaterMacroView
		,	ProductListDetailsView
		,	ProductListDeletionView
		,	LiveOrderModel
		,	ProfileModel
		,	ProductListItemCollection

		,	BackboneCollectionView
		,	BackboneCompositeView

		,	products_detail_later_cell_tpl
		,	backbone_collection_view_row_tpl		

		,	_
		,	jQuery		
		,	Backbone
		)
{
	'use strict';

	var product_list_promise;

	// @class ProductList.DetailsLater.View @extends Backbone.View
	return Backbone.View.extend({

		template: product_list_details_later_tpl

	,	events: {
			// items events
			'click [data-action="add-to-cart"]' : 'addItemToCartHandler'
		,	'click [data-action="add-items-to-cart"]': 'addItemsToCartBulkHandler'
		,	'click [data-action="delete-item"]' : 'askDeleteListItem'
		,	'change [data-action="change-quantity"]': 'updateItemQuantity'
		,	'keyup [data-action="change-quantity"]': 'updateItemQuantity'
		,	'click [data-ui-action="add"]' : 'addQuantity'
		,	'click [data-ui-action="minus"]' : 'subQuantity'
		,	'click [data-action="update-item"]': 'updateComment'
		}

	,	initialize: function(options)
		{
			//this.loadProductList();
			BackboneCompositeView.add(this);
		
			this.options = options;
			this.application = options.application; 
			this.cart = LiveOrderModel.getInstance();

			this.model.on('change', this.render, this);

			this.model.get('items').on('add remove change reset', this.render, this);

			this.promise = this.loadProductList();
			this.collection = this.model.get('items');

		}

	,	render: function ()
		{

			if (ProfileModel.getInstance().get('isLoggedIn') === 'T')
			{
				this._render();
				
				this.$('[data-action="pushable"]').scPush();
					}
			else
			{
				this.$el.empty();
			}

			return this;
		}

	,	loadProductList: function ()
		{
			var self = this;

			if (!product_list_promise)
			{
				ProfileModel.getPromise().done(function()
				{
					if(ProfileModel.getInstance().get('isLoggedIn') === 'T')
					{
						product_list_promise = self.options.application.ProductListModule.Utils.getSavedForLaterProductList().done(function (attributes)
						{
							self.model.set(attributes);
						});
					}
				});
			}

			return product_list_promise;
		}


		// @method updateComment executes on blur of the comment input. Finds the item in the product list, updates its comment and saves the list model
		,	updateComment: function(e)
		{
			e.preventDefault();

			var product_list_itemid = this.$(e.target).closest('article').data('id');
			var commentValue = jQuery('#comment_' + product_list_itemid).val();
			var productListArr = this.promise.responseJSON.items;
			var optionsValue;

			for(var i = 0; i < productListArr.length; i++){
				if(productListArr[i].internalid = product_list_itemid){
					optionsValue = productListArr[i].options;
					break;
				}
			}

			var itemModel = this.model.get('items').get(product_list_itemid);
			
			if(optionsValue){
				for(var i = 0; i < optionsValue.length; i++){
					if(optionsValue[i].cartOptionId == 'custcol_saved_for_later_comment'){
						if(commentValue){
							optionsValue[i].value = {internalid: commentValue, label: commentValue }
						} else {
							jQuery('#comment_' + product_list_itemid).val(commentValue);
						}
					}

					for(var j = 0; j < itemModel.get('options').models.length; j++){
						if(optionsValue[i].cartOptionId == itemModel.get('options').models[j].attributes.cartOptionId ){
							if(optionsValue[i].value){
								itemModel.get('options').models[j].attributes.value = optionsValue[i].value;
							}
							break;
						}
					}
				
				}
			}

			itemModel.save(null, {validate: false});
	
		}	

		// @method addItemToCartHandler Add a particular item into the cart
	,	addItemToCartHandler : function (e)
		{
			e.stopPropagation();
			e.preventDefault();
			var selected_product_list_item_id = this.$(e.target).closest('article').data('id')
			,	selected_product_list_item = this.model.get('items').get(selected_product_list_item_id);
			//8/28/2019 Saad
			for(var j = 0; j < selected_product_list_item.get('options').models.length; j++){
				if(selected_product_list_item.get('options').models[j].attributes.cartOptionId == 'custcol_avt_wbs_copy_key'){
					var selectedItemInternalId = selected_product_list_item.get('item').get('internalid');
					var itemUniqueCopy = selectedItemInternalId + '_' + new Date().getTime();	
					selected_product_list_item.get('options').models[j].attributes.value = {internalid: itemUniqueCopy, label: itemUniqueCopy};
				} 

				if(selected_product_list_item.get('options').models[j].attributes.cartOptionId == 'custcol_site_cogs'){
					var dateNeeded = '1/1/1900';
					selected_product_list_item.get('options').models[j].attributes.value = {internalid: '<div></div>', label: '<div></div>'};
				}


				if(selected_product_list_item.get('options').models[j].attributes.cartOptionId == 'custcol_avt_modified_date_needed'){
					var dateNeeded = '1/1/1900';
					selected_product_list_item.get('options').models[j].attributes.value = {internalid: dateNeeded, label: dateNeeded};
				}

				if(selected_product_list_item.get('options').models[j].attributes.cartOptionId == 'custcol_avt_date_needed'){
					var dateNeeded = '1/1/1900';
					selected_product_list_item.get('options').models[j].attributes.value = {internalid: dateNeeded, label: dateNeeded};
				} 

			}
			var	add_to_cart_promise = this.cart.addLine(selected_product_list_item)
			,	whole_promise = jQuery.when(add_to_cart_promise, this.deleteListItem(selected_product_list_item));//.then(jQuery.proxy(this, 'executeAddToCartCallback'));

			this.disableElementsOnPromise(whole_promise,  this.$(e.target).closest('article').find('button'));
			
		}

		//@method addItemsToCartBulkHandler
	,	addItemsToCartBulkHandler: function(e)
		{
			e.preventDefault();

			var self = this
			,	selected_models = this._getSelection()
			, 	productListArr = this.promise.responseJSON.items
			,	selectedItemInternalId = '';

			//no items selected: no opt
			if (selected_models.items.length < 1)
			{
				return;
			}
	
			for(var i = 0; i < selected_models.items.models.length; i++){
				var optionsLength = selected_models.items.models[i].get('options').models.length;
				var selectedEditOptions;
				var lineIntenalId = selected_models.items.models[i].get('internalid');
				for(var m = 0;  m < productListArr.length; m++){
					if(productListArr[m].internalid == lineIntenalId){
						selectedItemInternalId = productListArr[m].item.internalid;
						selectedEditOptions = productListArr[m].options
						break;
					}
				}

				for(var j = 0; j < optionsLength; j++){
					for(var k = 0; k < selectedEditOptions.length; k++){

						if(selected_models.items.models[i].get('options').models[j].attributes.cartOptionId == selectedEditOptions[k].cartOptionId){
							if(selectedEditOptions[k].value){
								selected_models.items.models[i].get('options').models[j].attributes.value = selectedEditOptions[k].value
							} else if (selected_models.items.models[i].get('options').models[j].attributes.cartOptionId == 'custcol_avt_wbs_copy_key') {
								var itemUniqueCopy = selectedItemInternalId + '_' + new Date().getTime();
								selected_models.items.models[i].get('options').models[j].attributes.value = {internalid: itemUniqueCopy, label: itemUniqueCopy}
							} else {

								selected_models.items.models[i].get('options').models[j].attributes.value = {internalid: "", label: ""}
							}
							break;
						}

					}
				}
			}

			var button_selector = selected_models.button_selector.join(',')
			//add items to cart
			,	add_to_cart_promise = this.cart.addProducts(selected_models.items.models, true);


			add_to_cart_promise.then(function ()
			{
				//var selectedModelsLength = selected_models.items.models.length;
				self.deleteItemsHandlerForSavedItem(selected_models);
			});

				this.disableElementsOnPromise(add_to_cart_promise, button_selector);
		}

	// @method showConfirmationHelper
	,	showConfirmationHelper: function (selected_item)
		{
			this.showConfirmationMessage(_('Good! The items were successfully added to your cart. You can continue to <a href="#" data-touchpoint="viewcart">view cart and checkout</a>').translate());

			//selected item may be undefined
			if (_.isUndefined(selected_item) === true)
			{
				return;
			}

			this.addedToCartView = new ProductListAddedToCartView({
				application: this.application
			,	parentView: this
			,	item: selected_item
			});

			this.application.getLayout().showInModal(this.addedToCartView);
		}	

	// @method _getSelection @return {items:ProductList.Item.Collection,items_for_cart:Array<Backbone.Model>,button_selector:String}
	,	_getSelection: function()
		{
			var items = []
			,	button_selector = [];

			//Filter items for bulk operation
			_.each(this.collection.models, function(pli)
			{
				//irrelevant items: no-op
				var lineId = pli.get('internalid');
				var isLineChecked = jQuery('#line_check_box_' + lineId).is(":checked"); 
				if (isLineChecked !== true)
				{
					return;
				}

				items.push(pli);

				var	item_internal_id = pli.getItemId();
				button_selector.push('article[data-item-id="' + item_internal_id + '"] a, article[data-item-id="' + item_internal_id + '"] button');
			});
			return {
				items: new ProductListItemCollection(items)
			,	button_selector: button_selector
			};
		}	

		// @method addQuantity Increase the product's Quantity by 1
		// @param {HTMLEvent} e 
	,	addQuantity: function (e)
		{
			e.preventDefault();

			var $element = jQuery(e.target)
			,	oldValue = $element.parent().find('input').val()
			,	newVal = parseFloat(oldValue) + 1;

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
			,	newVal = parseFloat(oldValue) - 1;

			newVal = Math.max(1, newVal);

			var input = $element.parent().find('input');

			input.val(newVal);
			input.trigger('change');
		}

		// @method askDeleteListItem opens a confirmation dialog for deleting an item from the Saved for Later list.
		// @param {HTMLEvent} e
	,	askDeleteListItem : function (e)
		{
			e.stopPropagation();

			this.deleteConfirmationView = new ProductListDeletionView({
				application: this.application
			,	parentView: this
			,	target: e.target
			,	title: _('Delete selected items').translate()
			,	body: _('Are you sure you want to remove selected items?').translate()
			,	confirmLabel: _('Yes').translate()
			,	confirm_delete_method: 'deleteListItemHandler'
			});

			this.deleteConfirmationView.showInModal();
		}

		// @method deleteListItemHandler deletes a single item from the Saved for Later list.
		// @param {HTMLEvent} e
	,	deleteListItemHandler: function (target)
		{
			var self = this
			,	itemid = jQuery(target).closest('article').data('id')
			,	product_list_item = this.model.get('items').findWhere({
					internalid: itemid + ''
				})
			,	success = function ()
			{
				if (self.application.getLayout().updateMenuItemsUI)
				{
					self.application.getLayout().updateMenuItemsUI();
				}

				self.deleteConfirmationView.$containerModal.removeClass('fade').modal('hide').data('bs.modal', null);
				self.render();
				self.showConfirmationMessage(_('The item was removed from your product list').translate(), true);
			};

			self.model.get('items').remove(product_list_item);		
			self.deleteListItem(product_list_item, success);
		}

	,	deleteListItem: ProductListDetailsView.prototype.deleteListItem

	,	deleteItemsHandlerForSavedItem: ProductListDetailsView.prototype.deleteItemsHandlerForSavedItem 

	,	disableElementsOnPromise: ProductListDetailsView.prototype.disableElementsOnPromise

	,	updateItemQuantity : ProductListDetailsView.prototype.updateItemQuantity

	,	updateItemQuantityHelper: ProductListDetailsView.prototype.updateItemQuantityHelper
	
	,	childViews:
		{
			'ProductList.DetailsLater.Collection': function()
			{
				return new BackboneCollectionView({
					collection: this.model.get('items')
				,	childView: ProductListDetailsLaterMacroView
				,	viewsPerRow: 1
				,	cellTemplate: products_detail_later_cell_tpl
				,	rowTemplate: backbone_collection_view_row_tpl
				,	childViewOptions: {
						application: this.application
					}
				});
			} 
		}

		// @method getContext @return {ProductList.DetailsLater.View.Context}
	,	getContext: function()
		{
			var items = this.model.get('items')
			,	itemsLength = items.length;
			
			if(!window.fitterDetailObjectArr){
				window.trackFitterIds = [];			
				window.fitterDetailObjectArr = [];
			}

			
			if(itemsLength > 0){
				for(var i = 0; i < itemsLength; i++){
					var obj = {};
					var fitterId = items.models[i].attributes.fitterid;
					var fitterName = items.models[i].attributes.fittername;
					if(fitterId){
						if(window.trackFitterIds.indexOf(fitterId) == '-1'){
							obj.fitterId = fitterId;
							obj.fitterName = fitterName;
							window.fitterDetailObjectArr.push(obj);
							window.trackFitterIds.push(fitterId);
						}

					}
				}
			}
			
			// @class ProductList.DetailsLater.View.Context
			return {
				// @property {Integer} itemsLength
				itemsLength : itemsLength
				// @property {Boolean} hasItems
			,	hasItems : itemsLength > 0
				// @property {Boolean} isEmpty
			,	isEmpty : itemsLength === 0
				// @property {Boolean} hasMoreThanOneItem
			,	hasMoreThanOneItem : itemsLength > 1
			,	fitterDetailObjectArr: window.fitterDetailObjectArr.length > 0 ? window.fitterDetailObjectArr : false
			};
		}

	});
});