/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Cart
define('Cart.Detailed.View'
,	[	'Backbone.CompositeView'
	,	'GlobalViews.Message.View'
	,	'Backbone.CollectionView'
	,	'Backbone.FormView'

	,	'Cart.Lines.View'
	,	'Cart.Lines.Free.View'
	,	'Cart.Promocode.Notifications.View'
	,	'Item.Model'
	, 	'Profile.Model'

	,	'Cart.Summary.View'
	,	'Cart.Item.Summary.View'
	,	'Cart.Item.Actions.View'
	,	'SC.Configuration'
	,	'Tracker'

	,	'cart_detailed.tpl'
	,	'cart_lines_free.tpl'

	,	'Utils'
	,	'underscore'
	,	'Backbone'

	,	'jQuery'
	,	'jQuery.scStickyButton'
	]
,	function (
		BackboneCompositeView
	,	GlobalViewsMessageView
	,	BackboneCollectionView
	,	BackboneFormView

	,	CartLinesView
	,	CartLinesFreeView
	,	CartPromocodeNotifications
	,	ItemDetailsModel
	,	ProfileModel

	,	CartSummaryView
	,	CartItemSummaryView
	,	CartItemActionsView
	,	Configuration
	,	Tracker

	,	cart_detailed_tpl
	,	cart_lines_free_tpl

	,	Utils
	,	_
	,	Backbone

	,	jQuery
	)
{
	'use strict';

	var colapsibles_states = {};

	// @class Cart.Detailed.View This is the Shopping Cart view @extends Backbone.View
	return Backbone.View.extend({

		// @property {Function} template
		template: cart_detailed_tpl

	,	enhancedEcommercePage: true

		// @property {String} title
	,	title: _('Order List').translate()	//16/12/2019 saad

		// @property {String} page_header
	,	page_header: _('Order List').translate()	//16/12/2019 saad

		// @property {Object} attributes
	,	attributes: {
			'id': 'Cart.Detailed.View'
		,	'data-root-component-id': 'Cart.Detailed.View'
		}

	,	bindings: {
			'[name="zip"]': 'zip'
		}

		// @property {Object} events
	,	events: {
			'change [data-type="cart-item-quantity-input"]': 'debouncedUpdateItemQuantity'
		,	'keypress [data-type="cart-item-quantity-input"]': 'debouncedUpdateItemQuantity'
		,	'submit [data-action="update-quantity"]': 'updateItemQuantityFormSubmit'
		,	'click [data-action="remove-item"]': 'removeItem'
		,	'change [name="custcol_avt_date_needed"]': 'debouncedUpdateDateNeeded'
		,	'change [name="order_list_line_item_total"]': 'debouncedUpdateCustomTailorPricing'

		,	'submit form[data-action="estimate-tax-ship"]': 'estimateTaxShip'
		,	'click [data-action="remove-shipping-address"]': 'removeShippingAddress'
		,	'click [data-touchpoint="checkout"]': 'trackEvent'
		,	'change [data-action="estimate-tax-ship-country"]': 'changeCountry'
		,	'click [data-action="copy-to-cart"]' : 'copyItemToCartHandler'
		,	'click [id="swx-butt-save-for-later-filter"]': 'saveForLaterFilter'
		,	'click [id="swx-butt-save-for-later-filter-clear"]': 'saveForLaterClearFilter'
		, 	'click [data-action="show-archived-items"]': 'showArchivedItems'
		}

		// @method initialize
		// @param {Cart.Detailed.View.InitializeParameters} options
		// @return {Void}
	,	initialize: function (options)
		{
			this.application = options.application;
			this.showEstimated = false;
			this.profile_model = ProfileModel.getInstance();



			this.model.on('change', this.render, this);
			this.model.get('lines').on('add remove', this.render, this);
			this.model.on('LINE_ROLLBACK', this.render, this);
			this.model.on('promocodeNotificationShown', this.removePromocodeNotification, this);

			this.on('afterCompositeViewRender', this.resetColapsiblesState, this);
			this.on('afterCompositeViewRender', this.initPlugins, this);

			this.options = options;
			SC.sessioncheck();
		}

		// @method getBreadcrumbPages
		// @return {BreadcrumbPage}
	,	getBreadcrumbPages: function ()
		{
			return {href: '/cart', text: _('Order List').translate()};  //16/12/2019 saad
		}

	,	saveForLaterFilter: function (e)
		{
			e.preventDefault();
			var self = this;
			var $target = jQuery(e.target);
			var fitterfilter = jQuery('#filter_fitter').val();
			var stFilterSaveForLaterValue = jQuery("[id='swx_filter_save_for_later_client']").val();
			var fromDateSaveForLaterValue = jQuery("[id='from_save_later']").val();
			var toDateSaveForLaterValue = jQuery("[id='to_save_later']").val();

			var filters = {};
			window.clientNameFilter = '';
			if(fitterfilter != '-1'){
					filters.custrecord_ns_pl_pli_fitter = fitterfilter;
			}
			if(stFilterSaveForLaterValue != ""){
				window.clientNameFilter = stFilterSaveForLaterValue;
				filters.client = stFilterSaveForLaterValue;
			}

			if(!_.isEmpty(fromDateSaveForLaterValue) && !_.isEmpty(toDateSaveForLaterValue)){
				filters.from_date = fromDateSaveForLaterValue;
				filters.to_date = toDateSaveForLaterValue;
			}

			this.utils.getFilteredProductList(JSON.stringify(filters)).done(function (attributes)
			{
				self.productListModel.set(attributes);
				jQuery('#filter_fitter').val(fitterfilter);
				jQuery("[id='swx_filter_save_for_later_client']").val(stFilterSaveForLaterValue);
				jQuery("[id='from_save_later']").val(fromDateSaveForLaterValue);
				jQuery("[id='to_save_later']").val(toDateSaveForLaterValue);
			});

		}

	,	saveForLaterClearFilter: function (e)
		{
			e.preventDefault();
			var self = this;

			this.utils.getFilteredProductList().done(function (attributes)
			{
				self.productListModel.set(attributes);
				jQuery('#filter_fitter').val('-1');
				jQuery("[id='swx_filter_save_for_later_client']").val('');

			});

		}

	,	showArchivedItems: function (e)
		{
			e.preventDefault();
			var self = this;
			var $target = jQuery(e.target);
			var archivedFilter = jQuery('#show-archived-items')[0].checked;

			var filters = {};
			if(archivedFilter){
				filters.custrecord_ns_pl_pli_isarchived = 'T';
			} else {
				filters.custrecord_ns_pl_pli_isarchived = 'F';
			}

			this.utils.getFilteredProductList(JSON.stringify(filters)).done(function (attributes)
			{
				self.productListModel.set(attributes);
				jQuery('#show-archived-items').prop('checked', archivedFilter);

			});

		}

		// @method initPlugins
		// initialize plugins
	,	initPlugins: function initPlugins()
		{
			if (Configuration.get('siteSettings.sitetype') === 'ADVANCED')
			{
				this.$('[data-action="sticky"]').scStickyButton();
			}


			Utils.initBxSlider(this.$('[data-type="carousel-items"]'), Configuration.get('bxSliderDefaults'));
		}

	,	render: function render ()
		{
			this.storeColapsiblesState();

			this._render();

			return this;
		}
		// @method hideError
	,	hideError: function hideError(selector)
		{
			var el = (selector)? selector.find('[data-type="alert-placeholder"]') : this.$('[data-type="alert-placeholder"]');
			el.empty();
		}

		// @method showError
	,	showError: function showError (message, line, error_details)
		{
			var placeholder;

			this.hideError();

			if (line)
			{
				// if we detect its a rolled back item, (this i an item that was deleted
				// but the new options were not valid and was added back to it original state)
				// We will move all the references to the new line id
				if (error_details && error_details.status === 'LINE_ROLLBACK')
				{
					var new_line_id = error_details.newLineId;

					line.attr('id', new_line_id);

					line.find('[name="internalid"]').attr({
						id: 'update-internalid-' + new_line_id
					,	value: new_line_id
					});
				}

				placeholder = line.find('[data-type="alert-placeholder"]');
				this.hideError(line);
			}
			else
			{
				placeholder = this.$('[data-type="alert-placeholder"]');
				this.hideError();
			}

			// Finds or create the placeholder for the error message
			if (!placeholder.length)
			{
				placeholder = jQuery('<div/>', {'data-type': 'alert-placeholder'});
				this.$el.prepend(placeholder);
			}

			var global_view_message = new GlobalViewsMessageView({
					message: message
				,	type: 'error'
				,	closable: true
			});

			// Renders the error message and into the placeholder
			placeholder.append(global_view_message.render().$el.html());

			// Re Enables all posible disableded buttons of the line or the entire view
			if (line)
			{
				line.find(':disabled').attr('disabled', false);
			}
			else
			{
				this.$(':disabled').attr('disabled', false);
			}
		}

		// @method validInputValue
		// Check if the input[type="number"] has empty string or NaN value
		// input.val() == '' && validInput == false: NaN
		// input.val() == '' && validInput == true: empty string
	,	validInputValue: function(input)
		{
			// html5 validation
			if ((input.validity) && (!input.validity.valid) || input.value === '')
			{
				return false;
			}

			// Fallback to browsers that don't yet support html5 input validation
			return !isNaN(input.value);
		}

		// @method updateItemQuantity
		// Finds the item in the cart model, updates its quantity and saves the cart model
	,	updateItemQuantity: function updateItemQuantity(e)
		{
			var self = this
			,	$line = null
			,	$form = jQuery(e.target).closest('form')
			,	options = $form.serializeObject()
			,	internalid = options.internalid
			,	line = this.model.get('lines').get(internalid)
			,	$input = $form.find('[name="quantity"]')
			,	validInput = this.validInputValue($input[0]);

			if (!line || this.isRemoving)
			{
				return;
			}

			if (!validInput || options.quantity)
			{
				var	new_quantity = parseInt(options.quantity, 10)
				,	item = line.get('item')
				,	min_quantity = item ? item.get('_minimumQuantity', true) : line.get('minimumquantity')
				,	max_quantity = item ? item.get('_maximumQuantity', true) : line.get('maximumquantity')
				,	current_quantity = parseInt(line.get('quantity'), 10);

				new_quantity = (new_quantity >= min_quantity) ? new_quantity : current_quantity;

				new_quantity = (!!max_quantity && new_quantity > max_quantity) ? current_quantity : new_quantity;

				$input.val(new_quantity);

				if (new_quantity !==  current_quantity)
				{

					$line = this.$('#' + internalid);
					$input.val(new_quantity).prop('disabled', true);
					line.set('quantity', new_quantity);

					var invalid = line.validate();

					if (!invalid)
					{
						var update_promise = this.model.updateLine(line);

						this.disableElementsOnPromise(update_promise, '#' + internalid + ' button');

						update_promise.fail(function (jqXhr)
						{
							jqXhr.preventDefault = true;
							var result = JSON.parse(jqXhr.responseText);

							self.showError(result.errorMessage, $line, result.errorDetails);
							line.set('quantity', current_quantity);
						}).always(function ()
						{
							$input.prop('disabled', false);
						});
					}
					else
					{
						var placeholder = this.$('#' + internalid + ' [data-type="alert-placeholder"]');
						placeholder.empty();

						_.each(invalid, function(value)
						{
							var global_view_message = new GlobalViewsMessageView({
									message: value
								,	type: 'error'
								,	closable: true
							});

							placeholder.append(global_view_message.render().$el.html());
						});

						$input.prop('disabled', false);
						line.set('quantity', current_quantity);
					}
				}
			}
		}

		// @method updateItemQuantity
		// Finds the item in the cart model, updates its quantity and saves the cart model
	,	updateDateNeeded: function updateDateNeeded(e)
		{
			var self = this
			,	internalid = jQuery(e.target).data('internalid')
			,	line = this.model.get('lines').get(internalid)
			,	inputDateNeeded = jQuery(e.target).val()
			,	validInput = this.validInputValue(inputDateNeeded)
			,	id = e.target.id;


			if (!line)
			{
				return;
			}

			if (!validInput)
			{
				var	newDateNeeded = inputDateNeeded
				if(this.model.get('lines').length > 1){
					var r = confirm('Would you like to apply this date to all items?');
					if(r == true){
						var lineOptions = line.get("options").models;
						for (var i = 0; i < lineOptions.length; i++) {
							if (lineOptions[i].attributes.cartOptionId == "custcol_avt_modified_date_needed") {
									var temp = newDateNeeded.split('-');
									var date = temp[2] + '/' + temp[1] + '/' + temp[0]
									lineOptions[i].attributes.value = {
										internalid: date,
										label: date
									}
									var invalid = line.validate();

									if (!invalid) {
										var update_promise = this.model.updateLine(line);

										this.disableElementsOnPromise(update_promise, '#' + internalid + ' button');

										update_promise.fail(function (jqXhr) {
											jqXhr.preventDefault = true;
											var result = JSON.parse(jqXhr.responseText);

											self.showError(result.errorMessage, $line, result.errorDetails);
										}).always(function () {
											jQuery("#" + id).prop('disabled', false);
										});
									}
									break;
							}
						}
					}
					else{

						var lineOptions = line.get("options").models;
						for(var i = 0; i < lineOptions.length; i++){
							if(lineOptions[i].attributes.cartOptionId == "custcol_avt_date_needed"){
								var oldDateNeeded = lineOptions[i].attributes.value.label || lineOptions[i].attributes.value.internalid
								if(oldDateNeeded != newDateNeeded){
									var temp = newDateNeeded.split('-');
									var date = temp[2] + '/' + temp[1] + '/' + temp[0]
									lineOptions[i].attributes.value = {internalid: date , label: date }
									var invalid = line.validate();

									if (!invalid)
									{
										var update_promise = this.model.updateLine(line);

										this.disableElementsOnPromise(update_promise, '#' + internalid + ' button');

										update_promise.fail(function (jqXhr)
										{
											jqXhr.preventDefault = true;
											var result = JSON.parse(jqXhr.responseText);

											self.showError(result.errorMessage, $line, result.errorDetails);
										}).always(function ()
										{
											jQuery("#" + id).prop('disabled', false);
										});
									}
									break;
								}
							}
						}
					}

				} else {
					var lineOptions = line.get("options").models;
					for(var i = 0; i < lineOptions.length; i++){
						if(lineOptions[i].attributes.cartOptionId == "custcol_avt_date_needed"){
							var oldDateNeeded = lineOptions[i].attributes.value.label || lineOptions[i].attributes.value.internalid
							if(oldDateNeeded != newDateNeeded){
								var temp = newDateNeeded.split('-');
								var date = temp[2] + '/' + temp[1] + '/' + temp[0]
								lineOptions[i].attributes.value = {internalid: date , label: date }
								var invalid = line.validate();

								if (!invalid)
								{
									var update_promise = this.model.updateLine(line);

									this.disableElementsOnPromise(update_promise, '#' + internalid + ' button');

									update_promise.fail(function (jqXhr)
									{
										jqXhr.preventDefault = true;
										var result = JSON.parse(jqXhr.responseText);

										self.showError(result.errorMessage, $line, result.errorDetails);
									}).always(function ()
									{
										jQuery("#" + id).prop('disabled', false);
									});
								}
								break;
							}
						}
					}
			}

			}
		}

	,	updateCustomTailorPricing: function updateCustomTailorPricing(e)
		{
			var self = this
			,	internalid = jQuery(e.target).data('internalid')
			,	line = this.model.get('lines').get(internalid)
			,	inputTailorPrice = jQuery(e.target).val()
			,	validInput = this.validInputValue(inputTailorPrice)
			,	id = e.target.id;


			if (!line)
			{
				return;
			}

			if (!validInput)
			{
				var	newTailoPrice = inputTailorPrice
				var lineOptions = line.get("options").models

				for(var i = 0; i < lineOptions.length; i++){
					if(lineOptions[i].attributes.cartOptionId == "custcol_order_list_line_item_total"){
						var oldTailoPrice = lineOptions[i].attributes.value.label || lineOptions[i].attributes.value.internalid
						if(oldTailoPrice != newTailoPrice){
							lineOptions[i].attributes.value = {internalid: newTailoPrice , label: newTailoPrice }
							var invalid = line.validate();

							if (!invalid)
							{
								var update_promise = this.model.updateLine(line);

								this.disableElementsOnPromise(update_promise, '#' + internalid + ' button');

								update_promise.fail(function (jqXhr)
								{
									jqXhr.preventDefault = true;
									var result = JSON.parse(jqXhr.responseText);

									self.showError(result.errorMessage, $line, result.errorDetails);
								}).always(function ()
								{
									jQuery("#" + id).prop('disabled', false);
								});
							}
							break;
						}
					}
				}

			}
		}

	,	debouncedUpdateItemQuantity: _.debounce(function(e)
		{
			this.updateItemQuantity(e);
		}, 1000)

	,	debouncedUpdateDateNeeded: _.debounce(function(e)
		{
			this.updateDateNeeded(e);
		}, 1000)

	,	debouncedUpdateCustomTailorPricing: _.debounce(function(e)
		{
			this.updateCustomTailorPricing(e);
		}, 1000)

		// @method updateItemQuantityFormSubmit
	,	updateItemQuantityFormSubmit: function updateItemQuantityFormSubmit(e)
		{
			e.preventDefault();
			this.updateItemQuantity(e);
		}

		/** start copy item **/
		// Add a particular item into the cart
	,	copyItemToCartHandler : function (e) //Added salman 6/23/2019 Saad
		{
			e.preventDefault();

			var self = this
			,	product = this.model.get('lines').get(jQuery(e.target).data('internalid'));
			// var selected_product_list_item_id = jQuery('#' + product).data('data-item-id');

			var option_values = []
			var selected_options = product.get('options');

			// _.each(selected_options, function(value, key) {
			// 	option_values.push({id: key, value: value.value, displayvalue: value.displayvalue});
			// });


			var selected_item = product.get('item');
			var selected_item_internalid = selected_item.get('internalid');
			var item_detail = self.getItemForCart(selected_item_internalid, product.get('quantity'));

			item_detail.set('_optionsDetails', selected_item.get('itemoptions_detail'));
			item_detail.setOptionsArray(selected_options.models, true);
			item_detail.setOption('custcol_avt_wbs_copy_key', selected_item_internalid.toString() + '_' + new Date().getTime());

			for(var i = 0; i < selected_options.models.length; i++){
				if (selected_options.models[i].attributes.cartOptionId == "custcol_avt_wbs_copy_key") {
					var copyItem = selected_item_internalid.toString() + '_' + new Date().getTime();

					selected_options.models[i].attributes.value = {
						internalid: copyItem,
						label: copyItem
					}
				}

				if (selected_options.models[i].attributes.cartOptionId == "custcol_site_cogs") {
					selected_options.models[i].attributes.value = {
						internalid: '<div></div>',
						label: '<div></div>'
					}
				}
			}
			var add_to_cart_promise = this.copyItemToCart(item_detail, selected_options.models)
			,	whole_promise = null;


			if (this.sflMode)
			{
				//whole_promise = jQuery.when(add_to_cart_promise, this.deleteListItem(selected_product_list_item)).then(jQuery.proxy(this, 'executeAddToCartCallback'));
				whole_promise = jQuery.when(add_to_cart_promise).then(jQuery.proxy(this, 'executeAddToCartCallback'));
			}
			else
			{
				//whole_promise = jQuery.when(add_to_cart_promise).then(jQuery.proxy(this, 'showConfirmationHelper', selected_product_list_item));
			}

			if (whole_promise)
			{
				this.disableElementsOnPromise(whole_promise, 'article[data-item-id="' + selected_item_internalid + '"] a, article[data-item-id="' + selected_item_internalid + '"] button');
			}

			// add_to_cart_promise.success(function ()
			// {
			// 	self.showContent()/*.done(function (view)
			// 	{
			// 		view.resetColapsiblesState();
			// 	});*/
			// });

			// setTimeout(function(){
			// 	location.reload();
			// }, 1500);


		}

	,	downloadQuote: function ()
	{
		var self = this;
		var client_collection = this.client_collection;
		var param = new Object();
		var liveOrderDetails = new Array();
		var root = "https://forms.na2.netsuite.com";
		var subtotal = 0;

		_.each(this.model.get('lines').models, function (line, index){
			var cartLine = new Object()
			var tai_cli = _.where(line.get("options"), {cartOptionId: "custcol_tailor_client"});
			var lineInternalid = line.get('internalid');
			if(tai_cli[0])
			var	clientID ;
			var	tailorPricingColumn
			,	fitProfileNotesColumn
			,	displayOpNotesColumn
			,	quantityColumn
			,	displayOptionsJacket
			,	displayOptionsTrouser
			,	displayOptionsWaistcoat
			,	displayOptionsOvercoat
			,	displayOptionsShirt
			,	displayOptionsLadiesJacket
			,	displayOptionsLadiesPant
			,	displayOptionsLadiesSkirt
			,	displayOptionsShortSleevesShirt
			,	displayOptionsTrenchcoat
			,	fitProfileJacket
			,	fitProfileTrouser
			,	fitProfileWaistcoat
			,	fitProfileOvercoat
			,	fitProfileShirt
			,	fitProfileLadiesJacket
			,	fitProfileLadiesPants
			,	fitProfileLadiesSkirt
			,	fitProfileShortSleevesShirt
			,	fitProfileTrenchcoat
			,	customFabricDetails
			,	lineItemTotal
			,	lineClientName
			cartLine.itemName = line.get('item').get('_name');
			cartLine.internalid = line.get('item').get('internalid');

			var lineOptionsValues = line.get("options").models;
			for(var i = 0; i < lineOptionsValues.length; i++){
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_tailor_client"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						clientID =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_order_list_line_item_total"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						tailorPricingColumn =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_fitprofile_message"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						fitProfileNotesColumn =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_designoption_message"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						displayOpNotesColumn =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_fabric_quantity"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						quantityColumn =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_designoptions_jacket"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						displayOptionsJacket =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_designoptions_trouser"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						displayOptionsTrouser =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_designoptions_waistcoat"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						displayOptionsWaistcoat =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_designoptions_overcoat"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						displayOptionsOvercoat =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_designoptions_shirt"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						displayOptionsShirt =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_designoptions_ladiesjacket"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						displayOptionsLadiesJacket =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_designoptions_ladiespants"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						displayOptionsLadiesPant =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_designoptions_ladiesskirt"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						displayOptionsLadiesSkirt =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_designoptions_ssshirt"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						displayOptionsShortSleevesShirt =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_designoptions_trenchcoat"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						displayOptionsTrenchcoat =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_fitprofile_jacket"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						fitProfileJacket =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_fitprofile_trouser"){

					if(_.isObject(lineOptionsValues[i].attributes.value)){
						fitProfileTrouser =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_fitprofile_waistcoat"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						fitProfileWaistcoat =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_fitprofile_overcoat"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						fitProfileOvercoat =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_fitprofile_shirt"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						fitProfileShirt =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_fitprofile_ladiesjacket"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						fitProfileLadiesJacket =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_fitprofile_ladiespants"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						fitProfileLadiesPants =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_fitprofile_ladiesskirt"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						fitProfileLadiesSkirt =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_fitprofile_ssshirt"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						fitProfileShortSleevesShirt =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_fitprofile_trenchcoat"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						fitProfileTrenchcoat =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_custom_fabric_details"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						customFabricDetails =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_order_list_line_item_total"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						lineItemTotal =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}

				if(lineOptionsValues[i].attributes.cartOptionId == "custcol_tailor_client_name"){
					if(_.isObject(lineOptionsValues[i].attributes.value)){
						lineClientName =	lineOptionsValues[i].attributes.value.label || lineOptionsValues[i].attributes.value.internalid
					}
				}
			}

			if(!lineClientName){
				var clientNameFieldClass = 'transaction-line-views-selected-client-name-value-' + lineInternalid;
				var tempLineClientName = $("." + clientNameFieldClass).text();
				if(tempLineClientName){
					lineClientName = tempLineClientName;
				}
			}
			cartLine.price =  "";
			if(!_.isUndefined(tailorPricingColumn) && !_.isUndefined(tailorPricingColumn[0])){
				subtotal += parseFloat(tailorPricingColumn[0].value);
				cartLine.price = _.formatCurrency(tailorPricingColumn[0].value);
			}

			cartLine.sku = line.get('item').get('_sku');

			cartLine.clientName = lineClientName;
			cartLine.displayOptionsJacket = displayOptionsJacket ? displayOptionsJacket : '';
			cartLine.displayOptionsTrouser = displayOptionsTrouser ? displayOptionsTrouser : '';
			cartLine.displayOptionsWaistcoat = displayOptionsWaistcoat ? displayOptionsWaistcoat : '';
			cartLine.displayOptionsOvercoat = displayOptionsOvercoat ? displayOptionsOvercoat : '';
			cartLine.displayOptionsShirt = displayOptionsShirt ? displayOptionsShirt : '';
			cartLine.displayOptionsLadiesJacket = displayOptionsLadiesJacket ? displayOptionsLadiesJacket : '';
			cartLine.displayOptionsLadiesPant = displayOptionsLadiesPant ? displayOptionsLadiesPant : '';
			cartLine.displayOptionsLadiesSkirt = displayOptionsLadiesSkirt ? displayOptionsLadiesSkirt : '';
			cartLine.displayOptionsShortSleevesShirt = displayOptionsShortSleevesShirt ? displayOptionsShortSleevesShirt : '';
			cartLine.displayOptionsTrenchcoat = displayOptionsTrenchcoat ? displayOptionsTrenchcoat : '';

			cartLine.fitProfileJacket = fitProfileJacket ? fitProfileJacket : '';
			cartLine.fitProfileTrouser = fitProfileTrouser ? fitProfileTrouser : '';
			cartLine.fitProfileWaistcoat = fitProfileWaistcoat ? fitProfileWaistcoat : '';
			cartLine.fitProfileOvercoat = fitProfileOvercoat ? fitProfileOvercoat : '';
			cartLine.fitProfileShirt = fitProfileShirt ? fitProfileShirt : '';
			cartLine.fitProfileLadiesJacket = fitProfileLadiesJacket ? fitProfileLadiesJacket : '';
			cartLine.fitProfileLadiesPants = fitProfileLadiesPants ? fitProfileLadiesPants : '';
			cartLine.fitProfileLadiesSkirt = fitProfileLadiesSkirt ? fitProfileLadiesSkirt : '';
			cartLine.fitProfileShortSleevesShirt = fitProfileShortSleevesShirt ? fitProfileShortSleevesShirt : '';
			cartLine.fitProfileTrenchcoat = fitProfileTrenchcoat ? fitProfileTrenchcoat : '';
			cartLine.customFabricDetails = customFabricDetails ? customFabricDetails : '';
			cartLine.displayOpNotes = displayOpNotesColumn;

			//cartLine.fitProfile = line.get('fitProfileOptions');
			cartLine.fitProfileNotes = fitProfileNotesColumn ? fitProfileNotesColumn : '';
			cartLine.fabricQuantity = quantityColumn ? quantityColumn : '';
			cartLine.lineItemTotal = lineItemTotal ? lineItemTotal : ''; //JHD-35

			liveOrderDetails.push(cartLine);
		});


		var date = new Date()
		,	day = date.getDate()
		,	month = date.getMonth() + 1
		,	year = date.getFullYear();

		var dateString = day+"/"+month+"/"+year;

		subtotal = subtotal ? _.formatCurrency(subtotal) : "0.0";
		if(liveOrderDetails.length > 0){
			param.data = JSON.stringify({
				"id": this.profile_model.get("parent")
			,	"name":  this.profile_model.get("name")
			,	"items" : liveOrderDetails
			,	"subtotal_formatted" : subtotal
			,	"currency_symbol" : this.profile_model.get('currency').symbol
			,	"dateString" : dateString
			});
			if(this.model.get('lines').models.length > 0){
				Utils.requestUrl("customscript_ps_sl_pdf_quote", "customdeploy_ps_sl_pdf_quote", "POST", param).always(function(data){
					if(data){
						jQuery('#btn-download-pdf').attr('target', '_blank');
						jQuery('#btn-download-pdf').attr('href', root + '/app/site/hosting/scriptlet.nl?script=125&deploy=1&compid=3857857&h=6a943f516e1e8db343aa&custparam_record_id='+data);
						jQuery('#btn-download-pdf').css('display', 'block');
					}

				});
			}
		}
		}

	,	getColumnValue: function(col)
		{
			if(!_.isUndefined(col) && !_.isEmpty(col)){
				return col[0].value;
			} else {
				return "";
			}
		}

	,	executeAddToCartCallback: function()
		{
			if (!this.addToCartCallback)
			{
				return;
			}

			this.addToCartCallback();
		}

		// Gets the ItemDetailsModel for the cart
	,	getItemForCart: function (id, qty, opts)
		{
			return new ItemDetailsModel({
				internalid: id
			,	quantity: qty
			,	options: opts
			});
		}

		// Adds the item to the cart
	,	copyItemToCart: function (item, options)
		{
			//return this.cart.addItem(item);
			return this.model.addItem(item, options);
		}

		/** end copy item **/

		// @method removeItem
		// handles the click event of the remove button
		// removes the item from the cart model and saves it.
	,	removeItem: function removeItem(e)
		{
			var message = _.translate("Are you sure that you want to delete this item?");
			if (window.confirm(message)) {
				var self = this
				,	product = this.model.get('lines').get(this.$(e.target).data('internalid'))
				,	remove_promise = this.model.removeLine(product)
				,	internalid = product.get('internalid');

				this.isRemoving = true;

				this.disableElementsOnPromise(remove_promise, 'article[id="' + internalid + '"] a, article[id="' + internalid + '"] button');

				remove_promise.always(function ()
					{
						self.isRemoving = false;
						// location.reload();
					});
				return remove_promise;
			}

			return false;
		}

		// @method estimateTaxShip
		// Sets a fake address with country and zip code based on the options.
	,	estimateTaxShip: function estimateTaxShip(e)
		{
			e.preventDefault();

			var options = this.$(e.target).serializeObject()
			,	self = this;

			var fake_address = {
				zip: options.zip
			,	country: options.country
			};

			this.model.cancelableTrigger('before:LiveOrder.estimateShipping', fake_address)
			.then(function()
			{
				var address_internalid = fake_address.zip + '-' + fake_address.country + '-null';
				fake_address.internalid = address_internalid;
				self.model.get('addresses').push(fake_address);

				self.model.set('shipaddress', address_internalid);

				var promise = self.saveForm(e);

				if (promise)
				{
					self.swapEstimationStatus();
				}

				promise.done(function(lines)
				{
					self.model.cancelableTrigger('after:LiveOrder.estimateShipping', _.isUndefined(lines) ? false : lines);
				});

			});
		}

		// @method changeEstimationStatus
	,	swapEstimationStatus: function swapEstimationStatus ()
		{
			this.showEstimated = !this.showEstimated;
		}

		// @method removeShippingAddress
		// sets a fake null address so it gets removed by the backend
	,	removeShippingAddress: function removeShippingAddress(e)
		{
			var self = this
			,	ship_address = self.model.get('addresses');

			self.model.cancelableTrigger('before:LiveOrder.clearEstimateShipping', ship_address)
			.then(function()
			{
				e.preventDefault();

				self.swapEstimationStatus();

				self.model.save({
					shipmethod: null
				,	shipaddress: null
				});

				self.model.cancelableTrigger('after:LiveOrder.clearEstimateShipping', true);
			});
		}

		// @method changeCountry
	,	changeCountry: function changeCountry(e)
		{
			e.preventDefault();

			var options = this.$(e.target).serializeObject()
			,	AddressModel = this.model.get('addresses').model;

			this.model.get('addresses').add(new AddressModel({ country: options.country, internalid: options.country }));
			this.model.set({ shipaddress: options.country });

		}

		// @method resetColapsiblesState
		// @return {Void}
	,	resetColapsiblesState: function resetColapsiblesState()
		{
			var self = this;
			_.each(colapsibles_states, function (is_in, element_selector)
			{
				self.$(element_selector)[ is_in ? 'addClass' : 'removeClass' ]('in').css('height',  is_in ? 'auto' : '0');
			});
		}

		// @method storeColapsiblesState
		// @return {Void}
	,	storeColapsiblesState: function ()
		{
			this.$('.collapse').each(function (index, element)
			{
				colapsibles_states[Utils.getFullPathForElement(element)] = jQuery(element).hasClass('in');
			});
		}

		// @method removePromocodeNotification
		// @param String promocode_id
		// @return {Void}
	,	removePromocodeNotification: function(promocode_id)
		{
			var promocode = _.findWhere(this.model.get('promocodes'), {internalid: promocode_id});

			delete promocode.notification;
		}

	,	trackEvent: function ()
		{
			Tracker.getInstance().trackProceedToCheckout();
		}

	,	destroy: function ()
		{
			colapsibles_states = {};

			this.model.off('change', this.render, this);
			this.model.get('lines').off('add remove', this.render, this);
			this.model.off('LINE_ROLLBACK', this.render, this);

			this.off('afterCompositeViewRender', this.resetColapsiblesState, this);
			this.off('afterCompositeViewRender', this.initPlugins, this);

			this._destroy();
		}

		// @property {ChildViews} childViews
	,	childViews: {
				'Cart.Summary': function ()
				{
					return new CartSummaryView({
						model: this.model
					,	showEstimated: this.showEstimated
					,	application: this.application
					});
				}
			,	'Item.ListNavigable': function ()
				{

					var lines = _.filter(this.model.get('lines').models || [], function (line) { return line.get('free_gift') !== true; });

					return new BackboneCollectionView({
							collection: lines
						,	viewsPerRow: 1
						,	childView: CartLinesView
						,	childViewOptions: {
								navigable: true
							,	application: this.application
							,	SummaryView: CartItemSummaryView
							,	ActionsView: CartItemActionsView
							,	showAlert: false
							}
					});
				}

			,	'Promocode.Notifications': function ()
				{
					var promotions = _.filter(this.model.get('promocodes') || [], function (promocode) { return promocode.notification === true; });

					if(promotions.length){
						return new BackboneCollectionView({
							collection: promotions
						,	viewsPerRow: 1
						,	childView: CartPromocodeNotifications
						,	childViewOptions: {
								parentModel: this.model
							}
						});
					}
				}

			,	'Item.FreeGift': function ()
				{
					var free_gifts = _.filter(this.model.get('lines').models || [], function (line) { return line.get('free_gift') === true; });

					if(free_gifts.length){
						return new BackboneCollectionView({
								collection: free_gifts
							,	viewsPerRow: 1
							,	childView: CartLinesFreeView
							,	childViewOptions: {
								navigable: true
							}
						});
					}
				}
			,	'FreeGift.Info': function ()
				{
					var message
					,	free_gifts = _.filter(this.model.get('lines').models || [], function (line) { return line.get('free_gift') === true; });

					if(free_gifts.length === 1){
						message = _.translate('The following item is free but it may generate shipping costs.');
					}
					else if (free_gifts.length > 1)
					{
						message = _.translate('The following items are free but they may generate shipping costs.');
					}

					if(message)
					{
						return new GlobalViewsMessageView({
							message: message
						,	type: 'info'
						,	closable: false
						});
					}
				}
		}

		//@method getExtraChildrenOptions Overridable method used to add params to url to open the accordion
		//@return {Cart.Detailed.View.ExtraChildrenOptions}
	,	getExtraChildrenOptions: function ()
		{
			//@class Cart.Detailed.View.ExtraChildrenOptions
			return {
				// @property {String} urlOptions
				urlOptions: this.options.urlOptions
			};
			//@class Cart.Detailed.View
		}

		// @method getContext @return {Cart.Detailed.View.Context}
	,	getContext: function ()
		{
			var lines = this.model.get('lines')
			,	product_count = lines.length
			,	item_count = _.reduce(lines.models, function(memo, line){ return memo + line.get('quantity'); }, 0)
			,	product_and_items_count = '';

			if (product_count === 1)
			{
				if (item_count === 1)
				{
					product_and_items_count =  _('1 Product, 1 Item').translate();
				}
				else
				{
					product_and_items_count = _('1 Product, $(0) Items').translate(item_count);
				}
			}
			else
			{
				if (item_count === 1)
				{
					product_and_items_count = _('$(0) Products, 1 Item').translate(product_count);
				}
				else
				{
					product_and_items_count = _('$(0) Products, $(1) Items').translate(product_count, item_count);
				}
			}

			var self = this;

			// setTimeout(function(){
				self.downloadQuote();
			// }, 2000);

			// @class Cart.Detailed.View.Context
			return {

					//@property {LiveOrder.Model} model
					model: this.model
					//@property {Boolean} showLines
				,	showLines: !!(lines && lines.length)
					//@property {Orderline.Collection} lines
				,	lines: lines
					//@property {String} productsAndItemsCount
				,	productsAndItemsCount: product_and_items_count
					//@property {Number} productCount
				,	productCount: product_count
					//@property {Number} itemCount
				,	itemCount: item_count
					//@property {String} pageHeader
				,	pageHeader: this.page_header
			};
			// @class Cart.Detailed.View
		}
	});
});
