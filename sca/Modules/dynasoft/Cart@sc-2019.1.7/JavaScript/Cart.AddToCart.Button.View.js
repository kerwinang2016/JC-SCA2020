/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Cart
define(
	'Cart.AddToCart.Button.View'
,	[
		'LiveOrder.Model'
	,	'LiveOrder.Line.Model'
	,	'Profile.Model'
	,	'Cart.Confirmation.Helpers'

	,	'cart_add_to_cart_button.tpl'

	,	'Backbone'
	,	'underscore'
	,	'Utils'
	,	'Conflict_Codes_Mapping_V2'
	]
,	function (
		LiveOrderModel
	,	LiveOrderLineModel
	,	ProfileModel
	,	CartConfirmationHelpers

	,	cart_add_to_cart_button_tpl

	,	Backbone
	,	_
	,	Utils
	,	Conflict_Codes
	)
{
	'use strict';

	//@class Cart.AddToCart.Button.View @extend Backbone.View
	return Backbone.View.extend({

		//@property {Function} template
		template: cart_add_to_cart_button_tpl

	,	noFitProfile: false // 20/11/2019 Umar Zulfiqar

	,	events: {
			//'mouseup [data-type="add-to-cart"]': 'addToCart'
			'click [data-type="add-to-cart"]': 'addToCart'
		,	'click [id=show-error-cart-modal-close]': 'closeErrorModal'
		}

		//@method initialize
		//@param {ProductDeatils.AddToCart.ViewCart.AddToCart.Button.View.Initialize.Options} options
		//@return {Void}
	,	initialize: function initialize (options)
		{

			this.profile_model = ProfileModel.getInstance();
			this.getExpectedDate();
			this.expectedDate = '';
			this.clientName = '';
			Backbone.View.prototype.initialize.apply(this, arguments);

			this.cart = LiveOrderModel.getInstance();

			this.model.on('change', this.render, this);

			if (Backbone.history.fragment.split("?").length > 1) { //Added salman June-2019
				var fragmentArray = Backbone.history.fragment.split("?")

				for(var i = fragmentArray.length -1; i >= 0; i--){
					if(fragmentArray[i].match('client')){
						this.clientId = fragmentArray[i].split("=")[1].split("&")[0];
						break;
					}
				}
			}

			var historyFragment = decodeURIComponent(Backbone.history.fragment);
            if (options.pList) {
                options.pList = decodeURIComponent(options.pList);
                this.clientId = options.pList.split("client=")[1].split("|")[0];
                if(options.pList.split('|').length >2)
                  this.productList = options.pList.split("|")[1].split('|')[0];
                else {
                  this.productList = options.pList.split("|")[1].split('&')[0];
                }
                this.itemList = options.pList.split("|")[2];
            } else {
              if(this.getClientId(historyFragment)){
                this.clientId = this.getClientId(historyFragment).split('|')[0]// || historyFragment.split("?")[1].split("client=")[1].split("&")[0] || null;
                this.productList = this.getClientId(historyFragment).split('|')[1];
                this.itemList = this.getClientId(historyFragment).split('|')[2];
              }
			}

			this.getNameDetails();

		}

	,	getExpectedDate: function()
		{
			//JHD-7 Start
			var customerId = this.profile_model.get('parent'),
				scriptId = "customscript_sl_expected_delivery_date",
				deployId = "customdeploy_sl_expected_delivery_date",
				itemId = this.model.get('item').get('internalid'),
				self = this;

				var param = new Object();
				param.customerid = customerId;
				param.itemid = itemId;
				Utils.requestUrl(scriptId, deployId, "GET", param).always(function(data){
					if(data){
						data = JSON.parse(data);
						self.expectedDate = data.expecteddate;
					}
				});
			//JHD-7 End
		}

	, 	getNameDetails: function ()
		{
			var	scriptId = "customscript_ps_sl_set_scafieldset",
				deployId = "customdeploy_ps_sl_set_scafieldset",
				self = this;

				var param = new Object();
				param.id = this.clientId;
				param.type = 'get_client_name_details'
				Utils.requestUrl(scriptId, deployId, "GET", param).always(function(data){
					if(data){
						data = JSON.parse(data);
						if(data[0]){
							self.clientName = data[0] + ' ';

						}

						if(data[1]) {
							self.clientName += data[1];
						}
					}
				});
		}

	, 	getClientId: function (fragment)
		{
			var fragmentArray = fragment.split("?");
			for (var i = fragmentArray.length - 1; i >= 0; i--) {
				if (fragmentArray[i].match('client')) {
					return fragmentArray[i].split('client=')[1].split("&")[0];
				}
			};
		}

	,	closeErrorModal: function()
		{
			jQuery('#show-error-cart-modal').hide();
		}

		//@method destroy Override default method to detach from change event of the current model
		//@return {Void}
	,	destroy: function destroy ()
		{
			Backbone.View.prototype.destroy.apply(this, arguments);

			this.model.off('change', this.render, this);
		}

		//@method getAddToCartValidators Returns the extra validation to add a product into the cart
		//@return {BackboneValidationObject}
	,	getAddToCartValidators: function getAddToCartValidators ()
		{
			var self = this;

			return {
				quantity: {
					fn : function ()
					{
						var line_on_cart = self.cart.findLine(self.model)
						,	quantity = self.model.get('quantity')
						,	minimum_quantity = self.model.getItem().get('_minimumQuantity') || 1
						,	maximum_quantity = self.model.getItem().get('_maximumQuantity');

						if (!_.isNumber(quantity) || _.isNaN(quantity) || quantity < 1)
						{
							return _.translate('Invalid quantity value');
						}
						else if (!line_on_cart && quantity < minimum_quantity)
						{
							return _.translate('Please add $(0) or more of this item', minimum_quantity);
						}
						else if(!!maximum_quantity)
						{
							maximum_quantity = (!line_on_cart) ? maximum_quantity : maximum_quantity - line_on_cart.quantity;

							if(quantity > maximum_quantity)
							{
								return _.translate('Please add $(0) or less of this item', maximum_quantity);
							}
						}
					}
				}
			};
		}

		//@method submitHandler Public method that fulfill the require interface of the Main action View of the PDP
		//@param {jQuery.Event} e
		//@return {Boolean}
	,	submitHandler: function submitHandler (e)
		{
			return this.addToCart(e);
		}

		// @method addToCart Updates the Cart to include the current model
		// also takes care of updating the cart if the current model is already in the cart
		// @param {jQuery.Event} e
		// @return {Boolean}
	,	addToCart: function addToCart (e)
		{
			e.preventDefault();
			var self = this
			,	cart_promise;

			if (!this.model.areAttributesValid(['options','quantity'], self.getAddToCartValidators()))
			{
				return;
			}

			var arrSelectedValues = Utils.getArrAllSelectedOptions();
            var objSelectSelectedValues = Utils.getObjSelectSelectedValues();

            var objConflictCodeMapping = Conflict_Codes.OBJ_CONFLICT;
            var arrErrConflictCodes = Utils.getArrConflictCodesError(objConflictCodeMapping, arrSelectedValues, objSelectSelectedValues);
			var arrErrConflictCodesTotal = (!_.isNull(arrErrConflictCodes)) ? arrErrConflictCodes.length : 0;
            var hasConflictCodes = (arrErrConflictCodesTotal != 0) ? true : false;

            if (hasConflictCodes) {
                var modalTitleErrConflictCode = 'Selected Options Error';
				var modalContentErrConflictCode = Utils.getHtmlErrConflictCodes(arrErrConflictCodes);
                Utils.displayModalWindow(modalTitleErrConflictCode, modalContentErrConflictCode, true)
                return false;
            }

			if(!this.isReadyForCart() || !this.fabricChecked() || !this.IsDesignSelected() || !this.validateFitProfile() || !this.validateCMT()){
				if(!this.fabricChecked() || !this.IsDesignSelected() || !this.validateFitProfile() || !this.validateCMT()){
					return false;
				}

				if (!this.model.isNew() && this.model.get('source') === 'cart')
				{
					cart_promise = this.cart.updateProduct(this.model);
					cart_promise.done(function ()
					{
						self.options.application.getLayout().closeModal();
					});
				}
				else
				{
					//remove the line item that's being edited
					if (self.productList && self.productList.indexOf('item') > -1) {
						var lineItem = this.cart.get("lines").get(self.productList);
						if (lineItem) {
							this.cart.removeLine(lineItem)
						}
					}
					var line = LiveOrderLineModel.createFromProduct(this.model, this.expectedDate, this.clientName);
					cart_promise = this.cart.addLine(line);
					self.options.application.noFitProfile = self.noFitProfile; // 20/11/2019 Umar Zulfiqar: {RFQ:Shopping Cart Confirmation Modal - Show warning on No Fit Profile}
					CartConfirmationHelpers.showCartConfirmation(cart_promise, line, self.options.application);
				}

				cart_promise.fail(function (jqXhr)
				{
					var error_details = null;
					try
					{
						var response = JSON.parse(jqXhr.responseText);
						error_details = response.errorDetails;
					}
					finally
					{
						if (error_details && error_details.status === 'LINE_ROLLBACK')
						{
							self.model.set('internalid', error_details.newLineId);
						}
					}

				});

				this.disableElementsOnPromise(cart_promise, e.target);
				//return false;
		}
	}

		// if it has mandatory options, checks for all to be filled
		// also checks if the item is purchasable
	,	isReadyForCart: function ()
		{
			// if the item is a matrix, we check if the selection is completed
			// for non-matrix items isSelectionComplete always returns true
			if (this.model.isSelectionComplete())
			{
				var is_purchasable = this.model.get('_isPurchasable')
				,	child = this.model.getSelectedMatrixChilds();

				if (child.length)
				{
					is_purchasable = child[0].get('_isPurchasable');
				}
				return is_purchasable;
			}

			return false;
		}

	, 	fabricChecked: function () {
			var status = true
				, self = this;
			if(jQuery('#chkItem:checked').length == 0){
				self.showError(_('You must tick the box under fabric availability to confirm that this fabric is currently in stock').translate());
				status = false;
			} else {
				self.hideError();
			}
			// 13/11/2019 Umar Zulfiqar {RFQ: Make Fabric Extra Required} -Start-
			if(jQuery('#fabric_extra').val() != undefined && _.indexOf(['please select',''],jQuery('#fabric_extra').val().toLowerCase()) !== -1){
				self.showError(_('You must select a design under Fabric Quantity.').translate());
				status = false;
			}
			//-End-
			return status;
		}

	, 	IsDesignSelected: function () {
		var status = true
			, self = this;
		if(jQuery('#fabric_extra').val() == "Please Select" || jQuery('#fabric_extra').val() == ""){
			self.showError(_('You must select a design under fabric quantity').translate());
			status = false;
		} else {
			self.hideError();
		}
		return status;
	}

	,	validateFitProfile: function () {
            var status = true
                , self = this;
			this.noFitProfile = false;
            jQuery('.profiles-options-shopflow').each(function () {
                /*if (jQuery(this).val() == "" && status) {
                    self.showError(_('Please Select a Fit Profile').translate());
                    status = false;
                }*/ // 13/11/2019 Umar Zulfiqar {RFQ: Allow Add to Cart when no Fit Profile}

				// 20/11/2019 Umar Zulfiqar -Start-
				if (jQuery(this).val() == ""){
					self.noFitProfile = true;
				}//-End-
            });
            //"Jacket, Trouser, Waistcoat","Jacket","Overcoat","Shirt","Jacket, Trouser"
            if(!self.noFitProfile){
				switch (this.model.get('custitem_clothing_type')) {
					case "Jacket, Trouser, Waistcoat":
						if (parseFloat(jQuery('[name="custcol_fabric_quantity"]').val()) < 3.4) {
							self.showError(_('Quantity should be greater than 3.4 for 3 Piece Suit').translate());
							status = false;
						}
						var measureType = "";
						//Check the fitprofile if they are all block or body
						jQuery(".profiles-options-shopflow").each(function (index) {
							var $el = jQuery(this);
							if ($el.find(":selected").text() != "Select a profile") {
								var measureList = window.currentFitProfile;
								_.each(measureList, function (lineItem) {

									if (lineItem.internalid == $el.find(":selected").val()) {
										if(!measureType){
										measureType = lineItem.custrecord_fp_measure_type;
										}else if(measureType && measureType != lineItem.custrecord_fp_measure_type){
										self.showError(_('Measurement Type should be the same for all products').translate());
										status = false;
										}
									}
								});
							}
						});
						break;
					case "Jacket":
						if (parseFloat(jQuery('[name="custcol_fabric_quantity"]').val()) < 2) {
							self.showError(_('Quantity should be greater than 2 for Jacket').translate());
							status = false;
						}
						break;
					case "Trouser":
						if (parseFloat(jQuery('[name="custcol_fabric_quantity"]').val()) < 1.5) {
							self.showError(_('Quantity should be greater than 1.5 for Trouser').translate());
							status = false;
						}
						break;
					case "Waistcoat":
						if (parseFloat(jQuery('[name="custcol_fabric_quantity"]').val()) < 1) {
							self.showError(_('Quantity should be greater than 1 for Waistcoat').translate());
							status = false;
						}
						break;
					case "Overcoat":
						if (parseFloat(jQuery('[name="custcol_fabric_quantity"]').val()) < 2.21) {
							self.showError(_('Quantity should be greater than 2.4 for Overcoat').translate());
							status = false;
						}
						break;
					case "Shirt":
						if (parseFloat(jQuery('[name="custcol_fabric_quantity"]').val()) < 1.6) {
							self.showError(_('Quantity should be greater than 2 for Shirt').translate());
							status = false;
						}
						break;
					case "Jacket, Trouser":
						if (parseFloat(jQuery('[name="custcol_fabric_quantity"]').val()) < 3) {
							self.showError(_('Quantity should be greater than 3 for 2 Piece Suit').translate());
							status = false;
						}
						var measureType = "";
						//Check the fitprofile if they are all block or body
						jQuery(".profiles-options-shopflow").each(function (index) {
							var $el = jQuery(this);
							if ($el.find(":selected").text() != "Select a profile") {
								var measureList = window.currentFitProfile;

								_.each(measureList, function (lineItem) {
									if (lineItem.internalid == $el.find(":selected").val()) {
										if(!measureType){
										measureType = lineItem.custrecord_fp_measure_type;
										}else if(measureType && measureType != lineItem.custrecord_fp_measure_type){
										self.showError(_('Measurement Type should be the same for all products').translate());
										status = false;
										}
									}
								});
							}
						});
						break;
					default:
				}
			}
            if (status) {
                self.hideError();
            }
            return status
		}

	, 	validateCMT: function(){
			var self = this;
			var clothingTypes = this.model.get('custitem_clothing_type').split(', ');
			var error_message = "";
			if(self.model.get('item').get('itemid').toLowerCase() == "cmt item"){
			  if(jQuery('#fabric-cmt-code').val() == "" || jQuery('#fabric-cmt-vendor').val() == '' || jQuery('#fabric-cmt-collection').val() == ''){
				error_message += 'CMT Vendor, Code and Collection is required for CMT item.<br/>';
			  }

			  if(jQuery('#fabric-cmt-vendor').val() == '29' && !jQuery('#fabric-cmt-othervendorname').val()){
				  error_message += 'You must enter a vendor name when Other is selected.<br/>';
			  }

			  if(jQuery('#li-b-j').val()=='CMT Lining' || jQuery('#li-b-lj').val()=='CMT Lining'){
				  if((jQuery('#li-vnd').val() == ''|| jQuery('#li-vnd').val() == 'Please select')|| jQuery('#li-code').val() == '' || jQuery('#li-qty').val() == ''){
						error_message += 'You must enter a CMT Lining Code and Quantity when CMT Lining is selected.<br/>';
				  }
			  }
			}
			if(clothingTypes.indexOf('Jacket')!=-1){
			  if((jQuery('#design-option-Jacket #li-vnd').val() != 'Please select') || (jQuery('#design-option-Jacket #li-code').val() != '')){
				if(jQuery('#design-option-Jacket #li-qty').val() =="" || parseFloat(jQuery('#design-option-Jacket #li-qty').val())< 0.88){
				  error_message += 'CMT Lining for Jacket has minimim quantity of 0.88.<br/>';
				}
			  }
			}
			if(clothingTypes.indexOf('Waistcoat')!=-1){
			  if((jQuery('#design-option-Waistcoat #li-vnd').val() != 'Please select') || (jQuery('#design-option-Waistcoat #li-code').val() != '')){
				if(jQuery('#design-option-Waistcoat #li-qty').val() == "" || parseFloat(jQuery('#design-option-Waistcoat #li-qty').val()) < 0.84){
				  error_message += 'CMT Lining for Waistcoat has minimum quantity of 0.84.<br/>';
				}
			  }
			}

			if(error_message != ""){
				self.showError(error_message);
			} else {
				self.hideError();
			}
			return error_message != "" ? false : true;
		}

	, 	getDesignOptions: function (clothingType) {
			if (clothingType !== '&nbsp;') {
				var designOptionsList = [];
				jQuery("div#design-option-" + clothingType + "").find(":input").each(function () {
					var currentDesignOptions = {
						'name': jQuery(this).attr("id"),
						'value': jQuery(this).val()
					};
					designOptionsList.push(currentDesignOptions);
				});
			}
			return designOptionsList;
	}

		//@method getContext
		//@return {Cart.AddToCart.Button.View.Context}
	,	getContext: function getContext ()
		{
			//@class Cart.AddToCart.Button.View.Context
			return {
				//@property {Boolean} isCurrentItemPurchasable Indicate if the current item is valid to be purchase or not
				isCurrentItemPurchasable: this.model.getItem().get('_isPurchasable')
				//@property {Boolean} isUpdate
			,	isUpdate: !this.model.isNew() && this.model.get('source') === 'cart'
			};
			//@class Cart.AddToCart.Button.View
		}
	});
});

//@class Cart.AddToCart.Button.View.Initialize.Options
//@property {Product.Model} model This view is only capable of adding new PRODUCTs into the cart.
//If you need to add something else please convert it into a Product.Model.
//
