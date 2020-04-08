/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/* jshint -W053 */
// We HAVE to use "new String"
// So we (disable the warning)[https://groups.google.com/forum/#!msg/jshint/O-vDyhVJgq4/hgttl3ozZscJ]
// @module LiveOrder

define(
	'LiveOrder.Model'
,	[
		'SC.Model'
	,	'Application'
	,	'Profile.Model'
	,	'StoreItem.Model'
	,	'SC.Models.Init'
	,	'SiteSettings.Model'
	,	'Utils'
	,	'ExternalPayment.Model'
	,	'underscore'
	,	'CustomFields.Utils'
	,	'Configuration'
	]
,	function (
		SCModel
	,	Application
	,	Profile
	,	StoreItem
	,	ModelsInit
	,	SiteSettings
	,	Utils
	,	ExternalPayment
	,	_
	,	CustomFieldsUtils
	,	Configuration
	)
{
	'use strict';

	// @class LiveOrder.Model Defines the model used by the LiveOrder.Service.ss service
	// Available methods allow fetching and updating Shopping Cart's data. Works against the
	// Shopping session order, this is, nlapiGetWebContainer().getShoppingSession().getOrder()
	// @extends SCModel
	return SCModel.extend({

		name: 'LiveOrder'
		// @property {Boolean} isSecure
	,	isSecure: Utils.isCheckoutDomain()
		// @property {Boolean} isMultiShippingEnabled
	,	isMultiShippingEnabled: SiteSettings.isMultiShippingRoutesEnabled()
		// @property {Boolean} isPickupInStoreEnabled
	,	isPickupInStoreEnabled: SiteSettings.isPickupInStoreEnabled()
		// @property {Boolean} isSuiteTaxEnabled
	,	isSuiteTaxEnabled: SiteSettings.isSuiteTaxEnabled()

		// @method get
		// @returns {LiveOrder.Model.Data}
	,	get: function get ()
		{
			var order_fields = this.getFieldValues()
			,	result = {};

			// @class LiveOrder.Model.Data object containing high level shopping order object information. Serializeble to JSON and this is the object that the .ss service will serve and so it will poblate front end Model objects
			try
			{
				//@property {Array<LiveOrder.Model.Line>} lines
				result.lines = this.getLines(order_fields);
			}
			catch (e)
			{
				if (e.code === 'ERR_CHK_ITEM_NOT_FOUND')
				{
					return this.get();
				}
				else
				{
					throw e;
				}
			}

			order_fields = this.hidePaymentPageWhenNoBalance(order_fields);

			// @property {Array<String>} lines_sort sorted lines ids
			result.lines_sort = this.getLinesSort();

			// @property {String} latest_addition
			result.latest_addition = ModelsInit.context.getSessionObject('latest_addition');

			// @property {Array<LiveOrder.Model.PromoCode>} promocodes
			result.promocodes = this.getPromoCodes(order_fields);

			if (this.automaticallyRemovedPromocodes)
			{
				result.automaticallyremovedpromocodes = this.automaticallyRemovedPromocodes;
			}

			// @property {Boolean} ismultishipto
			result.ismultishipto = this.getIsMultiShipTo(order_fields);

			// Ship Methods
			if (result.ismultishipto)
			{
				// @property {Array<OrderShipMethod>} multishipmethods
				result.multishipmethods = this.getMultiShipMethods(result.lines);

				// These are set so it is compatible with non multiple shipping.
				result.shipmethods = [];
				result.shipmethod = null;
			}
			else
			{
				// @property {Array<OrderShipMethod>} shipmethods
				result.shipmethods = this.getShipMethods(order_fields);
				// @property {OrderShipMethod} shipmethod
				result.shipmethod = order_fields.shipmethod ? order_fields.shipmethod.shipmethod : null;
			}

			// Addresses
			result.addresses = this.getAddresses(order_fields);
			result.billaddress = order_fields.billaddress ? order_fields.billaddress.internalid : null;
			result.shipaddress = !result.ismultishipto ? order_fields.shipaddress.internalid : null;

			// @property {Array<ShoppingSession.PaymentMethod>} paymentmethods Payments
			result.paymentmethods = this.getPaymentMethods(order_fields);

			// @property {Boolean} isPaypalComplete Paypal complete
			result.isPaypalComplete = ModelsInit.context.getSessionObject('paypal_complete') === 'T';

			// @property {Array<String>} touchpoints Some actions in the live order may change the URL of the checkout so to be sure we re send all the touchpoints
			result.touchpoints = SiteSettings.getTouchPoints();

			// @property {Boolean} agreetermcondition Terms And Conditions
			result.agreetermcondition = order_fields.agreetermcondition === 'T';

			// @property {OrderSummary} Summary
			result.summary = order_fields.summary;
			if (result.summary)
			{
                result.summary.discountrate = Utils.toCurrency(result.summary.discountrate);
			}

			if(this.isSuiteTaxEnabled)
			{
				// @property {Array<suitetax>} suitetaxes
				result.suitetaxes = this.getSuiteTaxes();
			}

			// @property {Object} options Transaction Body Field
			result.options = this.getTransactionBodyField();

			result.purchasenumber = order_fields.purchasenumber;

			// @class LiveOrder.Model
			return result;
		}

		// @method update will update the commerce order object with given data.
		// @param {LiveOrder.Model.Data} data
	,	update: function update (data)
		{
			var current_order = this.get()
			// We use this because we do not want to update certain atributes of the order if they had the same value as the provided as update's input.
			// This is because, through the Extensibility API, an extension may have made some changes to the order and those may be overwritten if the update's input has a different value.
			,	pre_update_order = this.get();

			var executeConditionalSet = _.partial(this._executeConditionalSet, data, current_order, pre_update_order);
			executeConditionalSet = _.bind(executeConditionalSet, this);

			this.storePromosPrevState();

			// Only do this if it's capable of shipping multiple items.
			if (this.isMultiShippingEnabled)
			{
				if (this.isSecure && ModelsInit.session.isLoggedIn2())
				{
					ModelsInit.order.setEnableItemLineShipping(!!data.ismultishipto);
					if (!current_order.ismultishipto && data.ismultishipto)
					{
						this.automaticallyRemovedPromocodes = this.getAutomaticallyRemovedPromocodes(current_order);
					}
				}
				// Do the following only if multishipto is active (if the data received determine that MST is enabled and pass the MST Validation)
				if (data.ismultishipto)
				{
					ModelsInit.order.removeShippingAddress();

					ModelsInit.order.removeShippingMethod();

					this.splitLines(data, current_order);

					this.setShippingAddressAndMethod(data, current_order);
				}
			}

			if (!this.isMultiShippingEnabled || !data.ismultishipto)
			{
				var isDataShipAddressDifferentToCurrentShipAddress = data.shipaddress !== current_order.shipaddress;
				executeConditionalSet('setShippingAddress');

				executeConditionalSet('setShippingMethod');
			}

			executeConditionalSet('setPromoCodes');

			executeConditionalSet('setBillingAddress');

			executeConditionalSet('setPaymentMethods');

			this.setPurchaseNumber(data, current_order);

			this.setTermsAndConditions(data, current_order);

			this.setTransactionBodyField(data, current_order);

			this.manageFreeGifts();

			if(this.isSuiteTaxEnabled && !this.isMultiShippingEnabled && !data.ismultishipto &&  isDataShipAddressDifferentToCurrentShipAddress) {
				ModelsInit.order.recalculateTaxes();
		}
		}

	,	getSuiteTaxes: function getSuiteTaxes()
		{
			var result = []
			,	suite_taxes = ModelsInit.order.getSummaryTaxTotals();

			_.each(suite_taxes.taxTotals, function(suitetax){
				result.push({
					taxTypeId: suitetax.taxTypeId
				,	taxTypeName: suitetax.taxTypeName
				,	taxTotal: Utils.formatCurrency(suitetax.taxTotal)
				});
			});

			return result;
		}

	,	_executeConditionalSet: function _executeConditionalSet(data, current_order, pre_update_order, fn_name)
		{
			var validations = {
				setShippingAddress: function()
				{
					return data.shipaddress !== pre_update_order.shipaddress;
				}
			,	setBillingAddress: function()
				{
					if (data.sameAs)
					{
						data.billaddress = data.shipaddress;
					}

					return data.billaddress !== pre_update_order.billaddress;
				}
			,	setShippingMethod: function()
				{
					return data.shipmethod !== pre_update_order.shipmethod;
				}
			,	setPromoCodes: function()
				{
					var pre_promocodes = _.pluck(pre_update_order.promocodes, 'code')
					,	data_promocodes = _.pluck(data.promocodes, 'code');

					return !_.isEmpty(_.difference(pre_promocodes, data_promocodes)) || !_.isEmpty(_.difference(data_promocodes, pre_promocodes));
				}
			,	setPaymentMethods: function()
				{
					if(data.paymentmethods.length !== pre_update_order.paymentmethods.length)
					{
						return true;
					}

					var data_payments = _.map(data.paymentmethods, function (payment)
					{
						if(payment.type === 'giftcertificate')
						{
							return payment.giftcertificate;
						}
						else if(payment.type === 'creditcard')
						{
							payment.creditcard.type = payment.type;
							return payment.creditcard;
						}

						return payment;
					});

					var pre_payments = _.map(pre_update_order.paymentmethods, function (payment)
					{
						if(payment.type === 'giftcertificate')
						{
							return payment.giftcertificate;
						}
						else if(payment.type === 'creditcard')
						{
							payment.creditcard.type = payment.type;
							return payment.creditcard;
						}

						return payment;
					});

					for(var i = 0; i < data_payments.length; i++)
					{
						var data_payment = data_payments[i]
						,	filter = {type: data_payment.type};

						switch(data_payment.type)
						{
							case 'creditcard':
								filter.ccnumber = data_payment.ccnumber;
								filter.ccsecuritycode = data_payment.ccsecuritycode;
								filter.ccname = data_payment.ccname;
								filter.expmonth = data_payment.expmonth;
								filter.expyear = data_payment.expyear;
								break;
							case 'invoice':
								//Filtering by type is enough because a customer always have the same terms
								break;
							case 'paypal':
								filter.internalid = data_payment.internalid;
								break;
							case 'giftcertificate':
								filter.code = data_payment.code;
								break;
							default:
								//external payment
								filter.internalid = data_payment.internalid;
								break;
						}

						if(!_.findWhere(pre_payments, filter))
						{
							return true;
						}
					}

					return false;
				}
			}
			,	execute_set = validations[fn_name] && validations[fn_name]();

			if(execute_set)
			{
				this[fn_name].apply(this, [data, current_order]);
			}
		}


		// @method submit will call ModelsInit.order.submit() taking in account paypal payment
		// @param {Boolean} threedsecure Received only in 3D Secure second step (from threedsecure.ssp)
		// @return {Object} Result of order submit operation ({status, internalid, confirmationnumber})
		,	submit: function submit (threedsecure)
			{

			    var confirmation
			,   payment = ModelsInit.order.getPayment();

			if (!threedsecure && payment && payment.paymentterms === 'CreditCard' && Configuration.get('isThreeDSecureEnabled'))
				{
				    return this.process3DSecure();
				}
				else
				{
				var paypal_address = _.find(ModelsInit.customer.getAddressBook(), function (address)
					{
						return !address.phone && address.isvalid === 'T';
					});

				confirmation = ModelsInit.order.submit();

				if (this.isMultiShippingEnabled)
				{
				    ModelsInit.order.setEnableItemLineShipping(false); // By default non order should be MST
				}


				//As the commerce API does not remove the purchase number after submitting the order we manually remove it
				this.setPurchaseNumber();

				if (confirmation.statuscode !== 'redirect')
				{
				   confirmation = _.extend(this.getConfirmation(confirmation.internalid), confirmation);
				}
				else
				{
			    	var paypal_complete = ModelsInit.context.getSessionObject('paypal_complete') === 'T';

					if (confirmation.reasoncode === 'ERR_WS_INVALID_PAYMENT' && paypal_complete)
			   		{

						var message = '<a href="' + confirmation.redirecturl + '">Paypal</a> was unable to process the payment. <br>Please select an alternative <a href="#billing">payment method</a> and continue to checkout.';

						throw {
							status: 500
						,	code: confirmation.reasoncode
						,	message: message
						};
		    		}

		     		confirmation.redirecturl = ExternalPayment.generateUrl(confirmation.internalid, 'salesorder');
		  		}

				// We need remove the paypal's address because after order submit the address is invalid for the next time.

		    	this.removePaypalAddress(paypal_address);

		    	ModelsInit.context.setSessionObject('paypal_complete', 'F');

		    }

		    return confirmation;
		}


		// @method addAddress
		// @param {OrderAddress} address
		// @param {Array<OrderAddress>} addresses
		// @returns {String} the given address internal id
	,	addAddress: function addAddress (address, addresses)
		{
			if (!address)
			{
				return null;
			}

			addresses = addresses || {};

			if (!address.fullname)
			{
				address.fullname = address.attention ? address.attention : address.addressee;
			}

			if (!address.company)
			{
				address.company = address.attention ? address.addressee : null;
			}

			delete address.attention;
			delete address.addressee;

			if (!address.internalid)
			{
				address.internalid =	(address.country || '') + '-' +
										(address.state || '') + '-' +
										(address.city || '') + '-' +
										(address.zip || '') + '-' +
										(address.addr1 || '') + '-' +
										(address.addr2 || '') + '-' +
										(address.fullname || '') + '-' +
										address.company;

				address.internalid = address.internalid.replace(/\s/g, '-');
			}

			if (address.internalid !== '-------null')
			{
				addresses[address.internalid] = address;
			}

			return address.internalid;
		}

		// @method hidePaymentPageWhenNoBalance
		// @param {Array<String>} order_fields
	,	hidePaymentPageWhenNoBalance: function hidePaymentPageWhenNoBalance (order_fields)
		{
			if (this.isSecure && ModelsInit.session.isLoggedIn2() && order_fields.payment && ModelsInit.session.getSiteSettings(['checkout']).checkout.hidepaymentpagewhennobalance === 'T' && order_fields.summary.total === 0)
			{
				ModelsInit.order.removePayment();
				order_fields = this.getFieldValues();
			}
			return order_fields;
		}

		// @method redirectToPayPal calls ModelsInit.order.proceedToCheckout() method passing information for paypal third party checkout provider
	,	redirectToPayPal: function redirectToPayPal ()
		{
			var touchpoints = SiteSettings.getTouchPoints()
			,	continue_url = ModelsInit.session.getAbsoluteUrl2('') + (/\/$/.test(ModelsInit.session.getAbsoluteUrl2('')) ? touchpoints.checkout.replace('/', '') : touchpoints.checkout )
			,	joint = ~continue_url.indexOf('?') ? '&' : '?';

			continue_url = continue_url + joint + 'paypal=DONE&fragment=' + request.getParameter('next_step');

			ModelsInit.session.proceedToCheckout({
				cancelurl: touchpoints.viewcart
			,	continueurl: continue_url
			,	createorder: 'F'
			,	type: 'paypalexpress'
			,	shippingaddrfirst: 'T'
			,	showpurchaseorder: 'T'
			});
		}

		// @method redirectToPayPalExpress calls ModelsInit.order.proceedToCheckout() method passing information for paypal-express third party checkout provider
	,	redirectToPayPalExpress: function redirectToPayPalExpress ()
		{
			var touchpoints = SiteSettings.getTouchPoints()
			,	continue_url = ModelsInit.session.getAbsoluteUrl2('') + (/\/$/.test(ModelsInit.session.getAbsoluteUrl2('')) ? touchpoints.checkout.replace('/', '') : touchpoints.checkout )
			,	joint = ~continue_url.indexOf('?') ? '&' : '?';

			continue_url = continue_url + joint + 'paypal=DONE';

			ModelsInit.session.proceedToCheckout({
				cancelurl: touchpoints.viewcart
			,	continueurl: continue_url
			,	createorder: 'F'
			,	type: 'paypalexpress'
			});
		}

		// @method getConfirmation
	,	getConfirmation: function getConfirmation (internalid)
		{
			var confirmation = {internalid: internalid};
			try
			{
				var record = nlapiLoadRecord('salesorder', confirmation.internalid);
				confirmation = this.confirmationCreateResult(record);
			}
			catch (e)
			{
				console.warn('Cart Confirmation could not be loaded, reason: ' + JSON.stringify(e));
			}

			return confirmation;
		}

		// @method confirmationCreateResult
	,	confirmationCreateResult: function confirmationCreateResult (placed_order)
		{

			var self = this
			,	result = {
				internalid: placed_order.getId()
			,	tranid: placed_order.getFieldValue('tranid')
			,	summary: {
					subtotal: Utils.toCurrency(placed_order.getFieldValue('subtotal'))
				,	subtotal_formatted: Utils.formatCurrency(placed_order.getFieldValue('subtotal'))

				,	taxtotal: Utils.toCurrency(placed_order.getFieldValue('taxtotal'))
				,	taxtotal_formatted: Utils.formatCurrency(placed_order.getFieldValue('taxtotal'))

				,	tax2total: Utils.toCurrency(placed_order.getFieldValue('tax2total'))
				,	tax2total_formatted: Utils.formatCurrency(placed_order.getFieldValue('tax2total'))

				,	shippingcost: Utils.toCurrency(placed_order.getFieldValue('shippingcost'))
				,	shippingcost_formatted: Utils.formatCurrency(placed_order.getFieldValue('shippingcost'))

				,	handlingcost: Utils.toCurrency(placed_order.getFieldValue('althandlingcost'))
				,	handlingcost_formatted: Utils.formatCurrency(placed_order.getFieldValue('althandlingcost'))

				,	discounttotal: Utils.toCurrency(placed_order.getFieldValue('discounttotal'))
				,	discounttotal_formatted: Utils.formatCurrency(placed_order.getFieldValue('discounttotal'))

				,	giftcertapplied: Utils.toCurrency(placed_order.getFieldValue('giftcertapplied'))
				,	giftcertapplied_formatted: Utils.formatCurrency(placed_order.getFieldValue('giftcertapplied'))

				,	total: Utils.toCurrency(placed_order.getFieldValue('total'))
				,	total_formatted: Utils.formatCurrency(placed_order.getFieldValue('total'))
				}
			}
			,	i = 0;

			result.promocodes = [];

			var promocode = placed_order.getFieldValue('promocode');

			//If legacy behavior is present & a promocode is applied this IF will be true
			//In case stackable promotions are enable this.record.getFieldValue('promocode') returns null
			if (promocode)
			{
				result.promocodes.push({
					internalid: promocode
				,	code: placed_order.getFieldText('couponcode')
				,	isvalid: true
				,	discountrate_formatted: ''
				});
			}

			for (i = 1; i <= placed_order.getLineItemCount('promotions'); i++)
			{
				if(placed_order.getLineItemValue('promotions', 'applicabilitystatus', i) !== 'NOT_APPLIED')
				{
				result.promocodes.push({
					internalid: placed_order.getLineItemValue('promotions', 'couponcode', i)
				,	code: placed_order.getLineItemValue('promotions', 'couponcode_display', i)
				,	isvalid: placed_order.getLineItemValue('promotions', 'promotionisvalid', i) === 'T'
				,	discountrate_formatted: ''
				});
			}

			}

			result.paymentmethods = [];

			for (i = 1; i <= placed_order.getLineItemCount('giftcertredemption'); i++)
			{
				result.paymentmethods.push({
					type: 'giftcertificate'
				,	giftcertificate: {
							code: placed_order.getLineItemValue('giftcertredemption', 'authcode_display', i)
						,	amountapplied: placed_order.getLineItemValue('giftcertredemption', 'authcodeapplied', i)
						,	amountapplied_formatted: Utils.formatCurrency(placed_order.getLineItemValue('giftcertredemption', 'authcodeapplied', i))
						,	amountremaining: placed_order.getLineItemValue('giftcertredemption', 'authcodeamtremaining', i)
						,	amountremaining_formatted: Utils.formatCurrency(placed_order.getLineItemValue('giftcertredemption', 'authcodeamtremaining', i))
						,	originalamount: placed_order.getLineItemValue('giftcertredemption', 'giftcertavailable', i)
						,	originalamount_formatted:  Utils.formatCurrency(placed_order.getLineItemValue('giftcertredemption', 'giftcertavailable', i))
					}
				});
			}

			result.lines = [];
			for (i = 1; i <= placed_order.getLineItemCount('item'); i++)
			{

				var line_item = {
						item: {
							id: placed_order.getLineItemValue('item', 'item', i)
						,	type: placed_order.getLineItemValue('item', 'itemtype', i)
						}
					,	quantity: parseInt(placed_order.getLineItemValue('item', 'quantity', i), 10)
					,	rate: parseFloat(placed_order.getLineItemValue('item', 'rate', i))
					,	options: self.parseLineOptionsFromSuiteScript(placed_order.getLineItemValue('item', 'options', i))
				};

				if (self.isPickupInStoreEnabled)
				{
					if (placed_order.getLineItemValue('item', 'itemfulfillmentchoice', i) === '1')
					{
						line_item.fulfillmentChoice = 'ship';
					}
					else if (placed_order.getLineItemValue('item', 'itemfulfillmentchoice', i) === '2')
					{
						line_item.fulfillmentChoice = 'pickup';
					}
				}

				result.lines.push(line_item);
			}

			StoreItem.preloadItems(_(result.lines).pluck('item'));

			_.each(result.lines, function (line)
			{
				line.item = StoreItem.get(line.item.id, line.item.type);
			});

			return result;
		}

		// @method backFromPayPal
	,	backFromPayPal: function backFromPayPal ()
		{
			var customer_values = Profile.get()
			,	bill_address = ModelsInit.order.getBillingAddress()
			,	ship_address = ModelsInit.order.getShippingAddress();

			if (customer_values.isGuest === 'T' && ModelsInit.session.getSiteSettings(['registration']).registration.companyfieldmandatory === 'T')
			{
				customer_values.companyname = 'Guest Shopper';
				ModelsInit.customer.updateProfile(customer_values);
			}

			if (ship_address.internalid && ship_address.isvalid === 'T' && !bill_address.internalid)
			{
				ModelsInit.order.setBillingAddress(ship_address.internalid);
			}

			ModelsInit.context.setSessionObject('paypal_complete', 'T');
		}

		// @method removePaypalAddress remove the shipping address or billing address if phone number is null.
		// This is because addresses are not valid created by Paypal.
		// @param {Object} paypal_address
	,	removePaypalAddress: function removePaypalAddress (paypal_address)
		{
			try
			{
				if (Configuration.get('removePaypalAddress') && paypal_address && paypal_address.internalid)
				{
					ModelsInit.customer.removeAddress(paypal_address.internalid);
				}
			}
			catch (e)
			{
				// ignore this exception, it is only for the cases that we can't remove pay-pal's address.
				// This exception will not send to the front-end
				var error = Application.processError(e);
				console.warn('Error ' + error.errorStatusCode + ': ' + error.errorCode + ' - ' + error.errorMessage);
			}
		}

		// @method addLine
		// @param {LiveOrder.Model.Line} line_data
	,	addLine: function addLine (line_data)
		{
			var item = {
				internalid: line_data.item.internalid.toString()
			,	quantity: _.isNumber(line_data.quantity) ? parseInt(line_data.quantity, 10) : 1
			,	options: this.parseLineOptionsToCommerceAPI(line_data.options)
			};

			if (this.isPickupInStoreEnabled && line_data.fulfillmentChoice === 'pickup' && line_data.location)
			{
				item.fulfillmentPreferences = {
					fulfillmentChoice: 'pickup'
				,	pickupLocationId: parseInt(line_data.location, 10)
				};
			}

			// Adds the line to the order
			var line_id = ModelsInit.order.addItem(item);

			if (this.isMultiShippingEnabled && line_data.fulfillmentChoice !== 'pickup')
			{
				// Sets it ship address (if present)
				line_data.shipaddress && ModelsInit.order.setItemShippingAddress(line_id, line_data.shipaddress);

				// Sets it ship method (if present)
				line_data.shipmethod && ModelsInit.order.setItemShippingMethod(line_id, line_data.shipmethod);
			}

			// Stores the latest addition
			ModelsInit.context.setSessionObject('latest_addition', line_id);

			// Stores the current order
			var lines_sort = this.getLinesSort();

			lines_sort.unshift(line_id);

			this.setLinesSort(lines_sort);

			return line_id;
		}

		// @method addLines
		// @param {Array<LiveOrder.Model.Line>} lines_data
		,	addLines: function addLines (lines_data)
		{
			var items = []
			,	self = this;

			try {
				this.storePromosPrevState();
				customer_values = Profile.get();
				var tailorID = customer_values.parent ? customer_values.parent : nlapiGetUser();
				var parent = tailorID;
				var surcharges = this.getDesignOptionSurcharges();
				var shippingsurcharges = this.getShippingSurcharges();
				var fabricsurcharges = this.getFabricSurcharges();

				_.each(lines_data, function (line_data)
				{
					var optionsObjData = {};

					for(var i = 0; i < line_data.options.length; i++){
						var key = line_data.options[i].cartOptionId;
						var value = '';
						if(line_data.options[i].value){
							if(JSON.stringify(line_data.options[i].value) != '{}'){
								value = line_data.options[i].value.internalid || line_data.options[i].value.label
							}

						}
						optionsObjData[key] = value;
					}

					var requestfieldsStr = nlapiRequestURL(nlapiResolveURL('suitelet', 'customscript_myaccountsuitelet', 'customdeploy1', 'external'), {
						action: 'getfabriccmtdescriptions',
						user: tailorID,
						item: line_data.item.internalid,
						pricelevel: customer_values.priceLevel,
						currency: customer_values.currency.internalid
					}).getBody();
					var requestfields = JSON.parse(requestfieldsStr);

					if(requestfields.customerfields.custentity_hide_billingandcogs == "F"){ // 19/11/2019 Umar Zulfiqar {RFQ: hide cogs and billing}
						var f_cogs = self.getFabricCogs(tailorID, line_data, requestfields, fabricsurcharges, optionsObjData);
						var cmt_cogs = self.getCMTCogs(tailorID, line_data, requestfields, surcharges, optionsObjData);
						var shipping_cogs = self.getShippingCogs(tailorID, line_data, shippingsurcharges, optionsObjData);
						var totalcogs = parseFloat(f_cogs.amount ? f_cogs.amount : 0);
						totalcogs += parseFloat(cmt_cogs.amount ? cmt_cogs.amount : 0);
						totalcogs += parseFloat(shipping_cogs.amount ? shipping_cogs.amount : 0);
						var fabrictext = f_cogs.text;
						fabrictext += cmt_cogs.text;
						fabrictext += shipping_cogs.text;
						fabrictext += "<div><b>Total COGS:</b> " + totalcogs.toFixed(2) + "</div>";
					}


					var tcrec = nlapiLoadRecord('customrecord_sc_tailor_client', optionsObjData.custcol_tailor_client);
					if (tcrec.getFieldValue('custrecord_tc_tailor') == nlapiGetContext().getUser() ||
						tcrec.getFieldValue('custrecord_tc_tailor') == parent) {

						var item = {
								internalid: line_data.item.internalid.toString()
							,	quantity:  _.isNumber(line_data.quantity) ? parseInt(line_data.quantity, 10) : 1
							,	options: self.parseLineOptionsToCommerceAPI(line_data.options)
						};

						// 19/11/2019 Umar Zulfiqar {RFQ: hide cogs and billing} -Start-
						//added else and modified if condition
						if(item.options.custcol_site_cogs && requestfields.customerfields.custentity_hide_billingandcogs == "F"){
							item.options.custcol_site_cogs = fabrictext.toString();
						}else{
							item.options.custcol_site_cogs = '';
						}// -End-

						items.push(item);
					}

					// if (self.isPickupInStoreEnabled && line_data.fulfillmentChoice === 'pickup' && line_data.location)
					// {
					// 	item.fulfillmentPreferences = {
					// 		fulfillmentChoice: 'pickup'
					// 	,	pickupLocationId: parseInt(line_data.location, 10)
					// 	};
					// }

				});

				var lines_ids = ModelsInit.order.addItems(items)
				,	latest_addition = _.last(lines_ids).orderitemid
				// Stores the current order
				,	lines_sort = this.getLinesSort();

				lines_sort.unshift(latest_addition);
				this.setLinesSort(lines_sort);

				ModelsInit.context.setSessionObject('latest_addition', latest_addition);

				this.manageFreeGifts();

				return lines_ids;

			} catch(e){
				nlapiLogExecution('error', 'addLines() :: message:', e.message)
			}
		}

	, 	getShippingCogs: function(tailorID, line_data, shippingcharges, optionsObjData)
		{
			var clothingtype;
			var returnObj = {};
			var totaladditionalsurcharge = 0;
			returnObj.fabrictext = '<div><b>Shipping</b><div style="padding-left:10px;"><ul>';
			var ptype = optionsObjData.custcol_producttype;
			if(ptype){
				switch(ptype) {
					case "2-Piece-Suit": clothingtype = "3,4"; break;
					case "3-Piece-Suit": clothingtype = "3,4,6"; break;
					case "Shirt": clothingtype = "7"; break;
					case "Jacket": clothingtype = "3"; break;
					case "Trouser": clothingtype = "4"; break;
					case "Waistcoat": clothingtype = "6"; break;
					case "Overcoat": clothingtype = "8"; break;
					case "Short-Sleeves-Shirt": clothingtype = "12"; break;
					case "Trenchcoat": clothingtype = "13"; break;
					case "Ladies-Jacket": clothingtype = "14"; break;
					case "Ladies-Pants": clothingtype = "15"; break;
					case "Ladies-Skirt": clothingtype = "16"; break;
					case "L-2PC-Skirt": clothingtype = "14,16"; break;
					case "L-3PC-Suit": clothingtype = "14,15,16"; break;
					case "L-2PC-Pants": clothingtype = "14,15"; break;
				}

				var custom = _.find(shippingcharges,function(x){return x.producttype == clothingtype && x.tailor == tailorID});
				if(custom) {
					returnObj.fabrictext += "<li>Shipping Charge  " + ptype + " ";
					returnObj.fabrictext += custom.rate + "</li>";
					totaladditionalsurcharge += parseFloat(custom.rate);
				} else {
					custom = _.find(shippingcharges,function(x){return x.producttype == clothingtype && x.tailor == ''});
					if(custom){
						returnObj.fabrictext += "<li>Shipping Charge  " + ptype + " ";
						returnObj.fabrictext += custom.rate + "</li>";
						totaladditionalsurcharge += parseFloat(custom.rate);
					}
				}
			}
			returnObj.fabrictext += "</ul></div></div>";
			return { text: returnObj.fabrictext, amount: totaladditionalsurcharge};
		}

	, 	getFabricCogs: function(tailorID,line_data,requestfields, fabric_surcharges, optionsObjData)
		{
			var self = this;
			var totaladditionalsurcharge = 0;
			var customerfields = requestfields.customerfields;
			var itemfields = requestfields.itemfields;
			var returnObj = {};
			returnObj.fabrictext = '<div><b>Fabric</b><div style="padding-left:10px;"><ul>';
			var ptype = optionsObjData.custcol_producttype;

			if(itemfields.vendor == '17' || itemfields.vendor == '671') {
				var fabCollection = itemfields.custitem_fabric_collection;
				var prodType = optionsObjData.custcol_producttype;
				var currentPricelevel = customerfields.pricelevel;
				if(fabCollection && prodType && currentPricelevel != "") {
					var prodTypeId = "";
					switch(prodType) {
						case 'Jacket': prodTypeId = '3'; break;
						case 'Trouser': prodTypeId = '4'; break;
						case 'Waistcoat': prodTypeId = '6'; break;
						case 'Overcoat': prodTypeId = '8'; break;
						case 'Shirt': prodTypeId = '7'; break;
						case '3-Piece-Suit': prodTypeId = '9'; break;
						case '2-Piece-Suit': prodTypeId = '10'; break;
						case "Short-Sleeves-Shirt": prodTypeId = "12"; break;
						case "Trenchcoat": prodTypeId = "13"; break;
						case "Ladies-Jacket": prodTypeId = "14"; break;
						case "Ladies-Pants": prodTypeId = "15"; break;
						case "Ladies-Skirt": prodTypeId = "16"; break;
						case "L-2PC-Skirt": prodTypeId = "17"; break;
						case "L-3PC-Suit": prodTypeId = "18"; break;
						case "L-2PC-Pants": prodTypeId = "19"; break;
					}

					if(prodTypeId != "") {

						var filters = [];
						filters.push(new nlobjSearchFilter('custrecord_dtp_fab_collection',null,'is',fabCollection));
						filters.push(new nlobjSearchFilter('custrecord_dtp_pricelevel',null,'anyof',currentPricelevel));
						filters.push(new nlobjSearchFilter('custrecord_dtp_producttype',null,'anyof',prodTypeId));
						var dpl_results = nlapiSearchRecord('customrecord_dayang_pricing',null,filters,new nlobjSearchColumn('custrecord_dtp_price'));

							if(dpl_results && dpl_results.length >0) {
								returnObj.fabrictext += "<li>"+itemfields.item + " ";
								returnObj.fabrictext += dpl_results[0].getValue('custrecord_dtp_price')?dpl_results[0].getValue('custrecord_dtp_price'):0;
								returnObj.fabrictext += "</li>";
								totaladditionalsurcharge += parseFloat(dpl_results[0].getValue('custrecord_dtp_price')?dpl_results[0].getValue('custrecord_dtp_price'):0);
							} else {
								returnObj.fabrictext += "<li>"+itemfields.item + " ";
								returnObj.fabrictext += parseFloat(itemfields.price) + "</li>";
								totaladditionalsurcharge += parseFloat(itemfields.price);
							}
						} else {
							returnObj.fabrictext += "<li>"+itemfields.item + " ";
							returnObj.fabrictext += parseFloat(itemfields.price) + "</li>";
							totaladditionalsurcharge += parseFloat(itemfields.price);
						}
					} else {
							returnObj.fabrictext += "<li>"+itemfields.item + " ";
							returnObj.fabrictext += parseFloat(itemfields.price).toFixed(2) + "</li>";
							totaladditionalsurcharge += parseFloat(itemfields.price);
						}
			}   else{
					//The vendor is not Jerome... get the prices and the quantity computation
					var quantity = {
						'2-Piece-Suit' : '3.3',
						'3-Piece-Suit': '3.7',
						'Jacket': '2',
						'Trouser': '2',
						'Waistcoat': '1',
						'Overcoat': '2.5',
						'Shirt': '2',
						'Trenchcoat': '2.5',
						'ShortSleevesShirt': '2',
						'Ladies-Jacket': '1.8',
						'Ladies-Pants': '1.8',
						'Ladies-Skirt': '1',
						'L-2PC-Skirt': '2.5',
						'L-3PC-Suit': '3.9',
						'L-2PC-Pants': '3.1'
					};
					currency = customerfields.currency;
					var currentPricelevel = customerfields.pricelevel;
					var fabric_quantity = optionsObjData.custcol_fabric_quantity;
					var currentRate = itemfields.price;
					var currentAmount = itemfields.price;
					var itemID = line_data.item.internalid;

					if(itemfields.price != "") {
						var price = parseFloat(itemfields.price);
						var itemtype = optionsObjData.custcol_producttype;
						switch(itemtype) {
							case '2-Piece-Suit' : currentAmount = price * 3.3; break;
							case '3-Piece-Suit': currentAmount = price * 3.7; break;
							case 'Jacket': currentAmount = price * 2; break;
							case 'Trouser': currentAmount = price * 2; break;
							case 'Waistcoat': currentAmount = price * 1; break;
							case 'Overcoat': currentAmount = price * 2.5; break;
							case 'Shirt': currentAmount = price * 2; break;
							case 'Trenchcoat': currentAmount = price * 2.5; break;
							case 'ShortSleevesShirt': currentAmount = price * 2; break;
							case 'Ladies-Jacket': currentAmount = price * 1.8; break;
							case 'Ladies-Pants': currentAmount = price * 1.8; break;
							case 'Ladies-Skirt': currentAmount = price * 1; break;
							case 'L-2PC-Skirt': currentAmount = price * 2.5; break;
							case 'L-3PC-Suit': currentAmount = price * 3.9; break;
							case 'L-2PC-Pants': currentAmount = price * 3.1; break;
							default:
						}
						currentRate = currentAmount/parseFloat(fabric_quantity);
						returnObj.fabrictext += "<li>"+itemfields.item + " ";
						returnObj.fabrictext += parseFloat(currentAmount).toFixed(2) + "</li>";
						totaladditionalsurcharge += parseFloat(currentAmount);
					}
					if(optionsObjData.custcol_producttype) {
						//Check Fabric Prices based on block types 2/8/2019 Saad
						var fpsummary = optionsObjData.custcol_fitprofile_summary;
						var fabricextra = optionsObjData.custcol_fabric_extra;
						var ptype = optionsObjData.custcol_producttype;

						var fpsJSON = JSON.parse(fpsummary);
						if(fpsJSON && fpsJSON.length>0) {
							//Check for Block,
							var maxblockvalue = 0;
							for(var h =0;h<fpsJSON.length;h++){
								//get the max block value;
								if(fpsJSON[h].blockvalue && parseFloat(fpsJSON[h].blockvalue.substr(0,2)) > maxblockvalue){
									maxblockvalue = parseFloat(fpsJSON[h].blockvalue.substr(0,2));
								}
							}
							if(maxblockvalue > 0) {
									var blockSurcharges = _.filter(fabric_surcharges,function(z){
									//surchargerate,code,name,min,max,producttype
									return z.name == 'Block' && z.producttype == ptype &&
									( parseFloat(z.min) <= maxblockvalue && parseFloat(z.max) >= maxblockvalue);
								});
								if(blockSurcharges.length>0){
									returnObj.fabrictext += "<li>Large Size Surcharge ";
									returnObj.fabrictext += parseFloat(currentAmount * parseFloat(blockSurcharges[0].surchargerate)).toFixed(2) + "</li>";
									totaladditionalsurcharge += parseFloat(currentAmount * blockSurcharges[0].surchargerate);
								}
							}
							var itemtypes = [];
							//Design Options //Unlined Turnup, Backwith Fabric
							if(fpsJSON.length == 3){
								var j_surcharge = self.getSurcharge(3,'Jacket',optionsObjData.custcol_designoptions_jacket,fabric_surcharges);
								var t_surcharge = self.getSurcharge(3,'Trouser',optionsObjData.custcol_designoptions_trouser,fabric_surcharges);
								var w_surcharge = self.getSurcharge(3,'Waistcoat',optionsObjData.custcol_designoptions_waistcoat,fabric_surcharges);
								if(j_surcharge.rate != 0) {
									returnObj.fabrictext += "<li>"+j_surcharge.description + " ";
									returnObj.fabrictext += (currentAmount * j_surcharge.rate).toFixed(2) + "</li>";
									totaladditionalsurcharge += parseFloat(currentAmount * j_surcharge.rate);
								}

								if(t_surcharge.rate != 0) {
									returnObj.fabrictext += "<li>"+t_surcharge.description + " ";
									returnObj.fabrictext += (currentAmount * t_surcharge.rate).toFixed(2) + "</li>";
									totaladditionalsurcharge += parseFloat(currentAmount *  t_surcharge.rate);
								}

								if(w_surcharge.rate != 0) {
									returnObj.fabrictext += "<li>"+w_surcharge.description + " ";
									returnObj.fabrictext += (currentAmount * w_surcharge.rate).toFixed(2) + "</li>";
									totaladditionalsurcharge += (currentAmount *  w_surcharge.rate);
								}
							} else if(fpsJSON.length == 2) {
								var j_surcharge = self.getSurcharge(2,'Jacket',optionsObjData.custcol_designoptions_jacket,fabric_surcharges);
								var t_surcharge = self.getSurcharge(2,'Trouser',optionsObjData.custcol_designoptions_trouser,fabric_surcharges);
								if(j_surcharge.rate != 0){
									returnObj.fabrictext += "<li>"+j_surcharge.description + " ";
									returnObj.fabrictext += (currentAmount * j_surcharge.rate).toFixed(2) + "</li>";
									totaladditionalsurcharge += parseFloat(currentAmount * j_surcharge.rate);
								}
								if(t_surcharge.rate != 0) {
									returnObj.fabrictext += "<li>"+t_surcharge.description + " ";
									returnObj.fabrictext += (currentAmount * t_surcharge.rate).toFixed(2) + "</li>";
									totaladditionalsurcharge += parseFloat(currentAmount * t_surcharge.rate);
								}
							} else {
								var singlesurcharge = {rate:0};
								if(fpsJSON[0].name == 'Jacket'){
									singlesurcharge = self.getSurcharge(1,'Jacket',optionsObjData.custcol_designoptions_jacket,fabric_surcharges);
								} else if(fpsJSON[0].name == 'Trouser'){
									singlesurcharge = self.getSurcharge(1,'Trouser',optionsObjData.custcol_designoptions_trouser,fabric_surcharges);
								} else if(fpsJSON[0].name == 'Waistcoat'){
									singlesurcharge = self.getSurcharge(1,'Waistcoat',optionsObjData.custcol_designoptions_waistcoat,fabric_surcharges);
								} else if(fpsJSON[0].name == 'Overcoat'){
									singlesurcharge = self.getSurcharge(1,'Overcoat',optionsObjData.custcol_designoptions_overcoat,fabric_surcharges);
								}
								if(singlesurcharge.rate != 0){
									returnObj.fabrictext += "<li>"+singlesurcharge.description + " ";
									returnObj.fabrictext += (currentAmount * singlesurcharge.rate).toFixed(2) + "</li>";
									totaladditionalsurcharge += parseFloat(currentAmount * singlesurcharge.rate);
								}

							}
						}
						//Check for fabric extra
						var fextra = optionsObjData.custcol_fabric_extra;
						if(fextra){
							var fextraSurcharges = _.filter(fabric_surcharges,function(z){
								//surchargerate,code,name,min,max,producttype
								return z.code == 'Fabric Design' && z.producttype == ptype &&
								z.name == fextra;
							});
							if(fextraSurcharges.length>0){
								returnObj.fabrictext += "<li>"+fextraSurcharges[0].name + " ";
								returnObj.fabrictext += (currentAmount * parseFloat(fextraSurcharges[0].surchargerate)).toFixed(2) + "</li>";
								totaladditionalsurcharge += parseFloat(currentAmount * fextraSurcharges[0].surchargerate);
							}
						}
					}
				}
			returnObj.fabrictext += '</ul></div></div>';
			return {text: returnObj.fabrictext, amount: totaladditionalsurcharge};
		}
	, 	getCMTCogs: function(tailorID,line_data,requestfields, surcharges, optionsObjData)
		{
			var currentUser = nlapiGetContext().getUser();
			var customerfields = requestfields.customerfields;
			var itemfields = requestfields.itemfields;
			var tailorCMTPrefMasterID = customerfields.custentity_jerome_cmt_service_preference;
			var tailorCMTPrefMaster = tailorCMTPrefMasterID && tailorCMTPrefMasterID == 2 ? "Premium CMT":"Basic CMT";
			var totaladditionalsurcharge = 0;
			var tailorSurchargeDisc = customerfields.custentity_surcharge_discount;

			if(!tailorSurchargeDisc) tailorSurchargeDisc = 0;

			var fabrictext = '<div><b>CMT</b><div style="padding-left:10px;"><ul>';
			var arItemType = optionsObjData.custcol_producttype;

			if(arItemType) {
				if(arItemType == '2-Piece-Suit') {
					tailorCMTDisc = customerfields.custentity_cmt_discount_2pc;
				} else if (arItemType == '3-Piece-Suit'){//if(itemTypeArray.length == 3){
					tailorCMTDisc = customerfields.custentity_cmt_discount_3pc;
				} else if (arItemType == 'Shirt') {
						tailorCMTDisc = customerfields.custentity_cmt_discount_shirt;
				} else if (arItemType == 'Jacket') {
						tailorCMTDisc = customerfields.custentity_cmt_discount_jacket;
				} else if (arItemType == 'Trouser'){
						tailorCMTDisc = customerfields.custentity_cmt_discount_trouser;
				} else if (arItemType == 'Waistcoat'){
						tailorCMTDisc = customerfields.custentity_cmt_discount_waistcoat;
				} else if (arItemType == 'Overcoat'){
						tailorCMTDisc = customerfields.custentity_cmt_discount_overcoat;
				} else if (arItemType == 'Short-Sleeves-Shirt'){
					tailorCMTDisc = customerfields.custentity_cmt_discount_ss_shirt;
				} else if (arItemType == 'Trenchcoat'){
					tailorCMTDisc = customerfields.custentity_cmt_discount_trenchcoat;
				} else if (arItemType == 'L-3PC-Suit'){
					tailorCMTDisc = customerfields.custentity_cmt_discount_l3pc_suit;
				} else if (arItemType == 'L-2PC-Pants'){
					tailorCMTDisc = customerfields.custentity_cmt_discount_l2pc_pants;
				} else if (arItemType == 'L-2PC-Skirt'){
					tailorCMTDisc = customerfields.custentity_cmt_discount_l2pc_skirt;
				} else if (arItemType == 'Ladies-Jacket'){
					tailorCMTDisc = customerfields.custentity_cmt_discount_ladies_jacket;
				} else if (arItemType == 'Ladies-Skirt'){
					tailorCMTDisc = customerfields.custentity_cmt_discount_ladies_skirt;
				} else if (arItemType == 'Ladies-Pants'){
					tailorCMTDisc = customerfields.custentity_cmt_discount_ladies_pants;
				}
			}
			if (!tailorCMTDisc) {
				tailorCMTDisc = 0;
			}

			var surchargeamount = 0;
			var surchargedescription = "";
			if(optionsObjData.custcol_designoptions_jacket) {
				var itemsurcharges = surcharges.filter(function(i){return i.type == "Jacket";});
				var dop = JSON.parse(optionsObjData.custcol_designoptions_jacket);

				//Lets get the lining surcharge and find out what type of surcharge it is
				var dop_liningsurcharge = _.find(dop,function(x){return x.name == 'li-b-j'});
				var LiningSurcharge;

				var itemsurcharge_Liningsurcharge = _.find(itemsurcharges,function(x){return x.name == 'li-b-j'});
				if(itemsurcharge_Liningsurcharge && dop_liningsurcharge) {
					LiningSurcharge = _.find(itemsurcharge_Liningsurcharge.values,function(x){ return x.code == dop_liningsurcharge.value;});
				}

				for(var kk=0;kk<itemsurcharges.length;kk++) {
					var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name});
					if(dop_value) {
						var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value});
						//We have a match on design options and the value in the table.
						if(dop_surcharge) {
							//Check for Sleeve Linings
							var isExempt = dop_surcharge.exemptfromsurcharge.indexOf(currentUser.toString())!=-1?true:false;
							if(dop_surcharge.code == 'T01022502' && itemsurcharges[kk].name == 'T010225'){
								//Find the Sleeve Dependent
								if(LiningSurcharge){
									var surcharge = (parseFloat(LiningSurcharge.sleeveliningsurcharge)+ parseFloat(LiningSurcharge.sleeveliningsurcharge*tailorSurchargeDisc/100)).toFixed(2);
									if(isExempt)
										surcharge = 0;
									surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
									surchargedescription += "<li>Jacket Sleeve " + LiningSurcharge.description + " " + parseFloat(surcharge).toFixed(2)+"</li>";
								}
							} else {
								var surcharge = (parseFloat(dop_surcharge.surcharge)+ parseFloat(dop_surcharge.surcharge*tailorSurchargeDisc/100)).toFixed(2);
								if(isExempt)
									surcharge = 0;
								surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
								surchargedescription += "<li>Jacket " + dop_surcharge.description + " " + parseFloat(surcharge).toFixed(2)+"</li>";
							}
						}
					}
				}
			}

			if(optionsObjData.custcol_designoptions_waistcoat) {
				var itemsurcharges = surcharges.filter(function(i){return i.type == "Waistcoat";});
				var dop = JSON.parse(optionsObjData.custcol_designoptions_waistcoat);
				for(var kk=0;kk<itemsurcharges.length;kk++) {
					var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
					if(dop_value){
						var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
						if(dop_surcharge) {
							var isExempt = dop_surcharge.exemptfromsurcharge.indexOf(currentUser.toString())!=-1?true:false;
							var surcharge = (parseFloat(dop_surcharge.surcharge)+ parseFloat(dop_surcharge.surcharge*tailorSurchargeDisc/100)).toFixed(2);
							if(isExempt)
								surcharge = 0;
							surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
							surchargedescription += "<li>Waistcoat " + dop_surcharge.description + " " + parseFloat(surcharge).toFixed(2)+"</li>";
						}
					}
				}
			}

			if(optionsObjData.custcol_designoptions_trouser) {
				var itemsurcharges = surcharges.filter(function(i){return i.type == "Trouser";});
				var dop = JSON.parse(optionsObjData.custcol_designoptions_trouser);

				for(var kk=0;kk<itemsurcharges.length;kk++) {
					var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
					if(dop_value) {
						var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
						if(dop_surcharge){
							var isExempt = dop_surcharge.exemptfromsurcharge.indexOf(currentUser.toString())!=-1?true:false;
							var surcharge = (parseFloat(dop_surcharge.surcharge)+ parseFloat(dop_surcharge.surcharge*tailorSurchargeDisc/100)).toFixed(2);
							if(isExempt)
								surcharge = 0;
							surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
							surchargedescription += "<li>Trouser " + dop_surcharge.description + " " + parseFloat(surcharge).toFixed(2) +"</li>";
						}
					}
				}
			}

			if(optionsObjData.custcol_designoptions_overcoat) {
				var itemsurcharges = surcharges.filter(function(i){return i.type == "Overcoat";});
				var dop = JSON.parse(optionsObjData.custcol_designoptions_overcoat);
				//Lets get the lining surcharge and find out what type of surcharge it is
				var dop_liningsurcharge = _.find(dop,function(x){return x.name == 'li-bl-o'});
				var LiningSurcharge;

				var itemsurcharge_Liningsurcharge = _.find(itemsurcharges,function(x){return x.name == 'li-bl-o'});
				if(itemsurcharge_Liningsurcharge && dop_liningsurcharge){
					LiningSurcharge = _.find(itemsurcharge_Liningsurcharge.values,function(x){ return x.code == dop_liningsurcharge.value;});
				}

				for(var kk=0;kk<itemsurcharges.length;kk++) {
					var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
					if(dop_value) {
						var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
						if(dop_surcharge) {
							var isExempt = dop_surcharge.exemptfromsurcharge.indexOf(currentUser.toString())!=-1?true:false;
							//Check for Sleeve Linings
							if(dop_surcharge.code == 'T01041202' && itemsurcharges[kk].name == 'T010412') {
								//Find the Sleeve Dependent
								if(LiningSurcharge) {
									var surcharge = (parseFloat(LiningSurcharge.sleeveliningsurcharge)+ parseFloat(LiningSurcharge.sleeveliningsurcharge*tailorSurchargeDisc/100)).toFixed(2);
									if(isExempt)
										surcharge = 0;
									surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
									surchargedescription += "<li>Overcoat Sleeve " + LiningSurcharge.description + " " + parseFloat(surcharge).toFixed(2)+"</li>";
								}
							} else {
								var surcharge = (parseFloat(dop_surcharge.surcharge)+ parseFloat(dop_surcharge.surcharge*tailorSurchargeDisc/100)).toFixed(2);
								if(isExempt)
										surcharge = 0;
								surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
								surchargedescription += "<li>Overcoat " + dop_surcharge.description + " " + parseFloat(surcharge).toFixed(2)+"</li>";
							}
						}
					}
				}
			}

			if(optionsObjData.custcol_designoptions_shirt) {
				var itemsurcharges = surcharges.filter(function(i){return i.type == "Shirt";});
				var dop = JSON.parse(optionsObjData.custcol_designoptions_shirt);

				for(var kk=0;kk<itemsurcharges.length;kk++) {
					var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
					if(dop_value) {
						var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
						if(dop_surcharge){
						var isExempt = dop_surcharge.exemptfromsurcharge.indexOf(currentUser.toString())!=-1?true:false;
						var surcharge = (parseFloat(dop_surcharge.surcharge)+ parseFloat(dop_surcharge.surcharge*tailorSurchargeDisc/100)).toFixed(2);
						if(isExempt)
							surcharge = 0;
						surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
						surchargedescription += "<li>Shirt " + dop_surcharge.description + " " + parseFloat(surcharge).toFixed(2) +"</li>";}
					}
				}
			}

			var tailorCMTPref;
			if (typeof arItemType === 'string' && arItemType == 'Shirt'){
				tailorCMTPref = 'Basic CMT';
			} else {
				tailorCMTPref = tailorCMTPrefMaster;
			}
				var cmtServiceItem;
				var cmtServicePrice;
				switch (tailorCMTPref) {
					case 'Premium CMT':
						if(arItemType) {
							if(arItemType == '2-Piece-Suit') {
								cmtServiceItem = '9910';
							} else if(arItemType == '3-Piece-Suit') {
								cmtServiceItem = '9911';
							} else if(arItemType == 'Shirt') {
								cmtServiceItem = '9909';
							} else if(arItemType == 'Jacket') {
								cmtServiceItem = '9905';
							} else if(arItemType == 'Trouser') {
								cmtServiceItem = '9906';
							} else if(arItemType == 'Waistcoat') {
								cmtServiceItem = '9907';
							} else if(arItemType == 'Overcoat') {
								cmtServiceItem = '9908';
							} else if(arItemType == 'Short-Sleeves-Shirt') {
								cmtServiceItem = '292339';
							} else if(arItemType == 'Trenchcoat') {
								cmtServiceItem = '292322';
							} else if(arItemType == 'L-3PC-Suit') {
								cmtServiceItem = '292333';
							} else if(arItemType == 'L-2PC-Skirt') {
								cmtServiceItem = '292337';
							} else if(arItemType == 'L-2PC-Pants') {
								cmtServiceItem = '292338';
							} else if(arItemType == 'Ladies-Jacket') {
								cmtServiceItem = '292336';
							} else if(arItemType == 'Ladies-Skirt') {
								cmtServiceItem = '292334';
							} else if(arItemType == 'Ladies-Pants') {
								cmtServiceItem = '292335';
							}
						}
						//TODO: Lookup the item price for the cmt item
						var serviceitemfieldsStr = nlapiRequestURL(nlapiResolveURL('suitelet','customscript_myaccountsuitelet','customdeploy1','external'),
						{
							action:'getserviceitemfields',item:cmtServiceItem
						}).getBody();
						var serviceitemfields = JSON.parse(serviceitemfieldsStr);
						cmtServicePrice = serviceitemfields.custitem_jerome_cmt_basic_price;
						break;
					case 'Basic CMT':

					default:
						if(arItemType) {
							if(arItemType == '2-Piece-Suit') {
								cmtServiceItem = '9903';
							} else if(arItemType == '3-Piece-Suit') {
								cmtServiceItem = '9904';
							} else if(arItemType == 'Shirt') {
								cmtServiceItem = '9902';
							} else if(arItemType == 'Jacket') {
								cmtServiceItem = '9898';
							} else if(arItemType == 'Trouser') {
								cmtServiceItem = '9899';
							} else if(arItemType == 'Waistcoat') {
								cmtServiceItem = '9900';
							} else if(arItemType == 'Overcoat') {
								cmtServiceItem = '9901';
							} else if(arItemType == 'Short-Sleeves-Shirt') {
								cmtServiceItem = '292329';
							} else if(arItemType == 'Trenchcoat') {
								cmtServiceItem = '292321';
							} else if(arItemType == 'L-3PC-Suit') {
								cmtServiceItem = '292332';
							} else if(arItemType == 'L-2PC-Skirt') {
								cmtServiceItem = '292330';
							} else if(arItemType == 'L-2PC-Pants') {
								cmtServiceItem = '292331';
							} else if(arItemType == 'Ladies-Jacket') {
								cmtServiceItem = '292328';
							} else if(arItemType == 'Ladies-Skirt') {
								cmtServiceItem = '292326';
							} else if(arItemType == 'Ladies-Pants') {
								cmtServiceItem = '292327';
							}
						}

					var serviceitemfieldsStr = nlapiRequestURL(nlapiResolveURL('suitelet','customscript_myaccountsuitelet','customdeploy1','external'),
					{
						action:'getserviceitemfields',item:cmtServiceItem
					}).getBody();
					var serviceitemfields = JSON.parse(serviceitemfieldsStr);
							cmtServicePrice = serviceitemfields.custitem_jerome_cmt_basic_price;
							break;
					}
					// go in to the service item, and look up the price based on premium or basic preference.
					if (cmtServiceItem && cmtServicePrice) {
						var price = (parseFloat(cmtServicePrice) + (parseFloat(cmtServicePrice*tailorCMTDisc/100))).toFixed(2);
						var description = "<li>"+tailorCMTPref + " " + price + "</li>";
						//Update the price here to include the surcharges
						//calculate the service item price
						// var serviceItemPrice = (parseFloat(surchargeamount) +parseFloat(cmtServicePrice) + (parseFloat(cmtServicePrice*tailorCMTDisc/100))).toFixed(2);
						description+= surchargedescription;
						fabrictext += description;
						totaladditionalsurcharge = parseFloat(price) + parseFloat(surchargeamount);
					}
					fabrictext += '</ul></div></div>';
					return {
						text: fabrictext, amount: totaladditionalsurcharge
					};
		}

	,   getDesignOptionSurcharges: function()
		{
			var filters = [];
			filters.push(new nlobjSearchFilter('isinactive',null,'is','F'));
			var cols = [];
			cols.push(new nlobjSearchColumn('custrecord_do_description'));
			cols.push(new nlobjSearchColumn('custrecord_do_code'));
			cols.push(new nlobjSearchColumn('custrecord_do_surcharge'));
			cols.push(new nlobjSearchColumn('custrecord_do_location'));
			cols.push(new nlobjSearchColumn('custrecord_do_itemtype'));
			cols.push(new nlobjSearchColumn('custrecord_sleeveliningsurcharge'));
			//cols.push(new nlobjSearchColumn('custrecord_exempt_from_surcharge'));
			var search = nlapiCreateSearch('customrecord_design_options_surcharge',filters,cols);
		  var resultSet = search.runSearch();
		  var searchid = 0;
		  var do_surcharges, surcharges = [];
		  do{
		    do_surcharges = resultSet.getResults(searchid,searchid+1000);
		    if(do_surcharges && do_surcharges.length > 0){
		      for(var k=0; k<do_surcharges.length; k++){
		        var custom = _.find(surcharges,function(x){return x.name == do_surcharges[k].getValue('custrecord_do_location')});
		    		if(custom){
		    			custom.codes.push(do_surcharges[k].getValue('custrecord_do_code'));
		    			custom.values.push({
		    			code:do_surcharges[k].getValue('custrecord_do_code'),
		    			description:do_surcharges[k].getValue('custrecord_do_description'),
		    			surcharge:do_surcharges[k].getValue('custrecord_do_surcharge'),
		    			sleeveliningsurcharge:do_surcharges[k].getValue('custrecord_sleeveliningsurcharge'),
		          exemptfromsurcharge: do_surcharges[k].getValue('custrecord_exempt_from_surcharge').split(',')
		          });
		    		}
		    		else{
		    		surcharges.push({
		    			name:do_surcharges[k].getValue('custrecord_do_location'),
		    			type:do_surcharges[k].getText('custrecord_do_itemtype'),
		    			codes:[do_surcharges[k].getValue('custrecord_do_code')],
		    			values:[{code:do_surcharges[k].getValue('custrecord_do_code'),
		    			description:do_surcharges[k].getValue('custrecord_do_description'),
		    			surcharge:do_surcharges[k].getValue('custrecord_do_surcharge'),
		    			sleeveliningsurcharge:do_surcharges[k].getValue('custrecord_sleeveliningsurcharge'),
		          exemptfromsurcharge: do_surcharges[k].getValue('custrecord_exempt_from_surcharge').split(',')
		          }]
		    		});
		    		}
		      }
		      searchid+=1000;
		    }
		  }while(do_surcharges && do_surcharges.length == 1000);


			// var do_surcharges = nlapiSearchRecord('customrecord_design_options_surcharge',null,filters,cols);
			// var surcharges = [];
			// for(var k=0; k<do_surcharges.length;k++) {
			// 	//name:location,
			// 	//values:{[]}
			// 	var custom = _.find(surcharges,function(x){return x.name == do_surcharges[k].getValue('custrecord_do_location')});
			// 	if(custom){
			// 		custom.codes.push(do_surcharges[k].getValue('custrecord_do_code'));
			// 		custom.values.push({
			// 			code:do_surcharges[k].getValue('custrecord_do_code'),
			// 			description:do_surcharges[k].getValue('custrecord_do_description'),
			// 			surcharge:do_surcharges[k].getValue('custrecord_do_surcharge'),
			// 			sleeveliningsurcharge:do_surcharges[k].getValue('custrecord_sleeveliningsurcharge'),
			// 			exemptfromsurcharge: '' //do_surcharges[k].getValue('custrecord_exempt_from_surcharge').split(',')
			// 		});
			// 	} else {
			// 		surcharges.push({
			// 			name:do_surcharges[k].getValue('custrecord_do_location'),
			// 			type:do_surcharges[k].getText('custrecord_do_itemtype'),
			// 			codes:[do_surcharges[k].getValue('custrecord_do_code')],
			// 			values:[{
			// 				code:do_surcharges[k].getValue('custrecord_do_code'),
			// 				description:do_surcharges[k].getValue('custrecord_do_description'),
			// 				surcharge:do_surcharges[k].getValue('custrecord_do_surcharge'),
			// 				sleeveliningsurcharge:do_surcharges[k].getValue('custrecord_sleeveliningsurcharge'),
			// 				exemptfromsurcharge: '' //do_surcharges[k].getValue('custrecord_exempt_from_surcharge').split(',')
			// 			}]
			// 		});
			// 	}
			// }
			return surcharges;
		}

	,	getShippingSurcharges: function()
		{
			var filters = [], columns = [], shippingcharges = [];
			filters.push(new nlobjSearchFilter('isinactive',null,'is','F'));
			columns.push(new nlobjSearchColumn('custrecord_iscf_product_type'));
			columns.push(new nlobjSearchColumn('custrecord_iscf_tailor'));
			columns.push(new nlobjSearchColumn('custrecord_iscf_rate'));

			//Get the surcharges for calculation of shipping
			var do_surcharges = nlapiSearchRecord('customrecord_item_shipping_charges',null,filters,columns);

			for(var k=0; k<do_surcharges.length;k++) {
			  shippingcharges.push({
				tailor:do_surcharges[k].getValue('custrecord_iscf_tailor')
				, rate:do_surcharges[k].getValue('custrecord_iscf_rate')
				, producttype:do_surcharges[k].getValue('custrecord_iscf_product_type')
			  });
			}
			return shippingcharges;
		}

	,	getFabricSurcharges: function()
		{
			var fabric_surcharges = [], filters = [], columns = [];
			columns.push(new nlobjSearchColumn('custrecord_fis_producttype'));
			columns.push(new nlobjSearchColumn('custrecord_fis_code'));
			columns.push(new nlobjSearchColumn('custrecord_fis_name'));
			columns.push(new nlobjSearchColumn('custrecord_fis_minimum'));
			columns.push(new nlobjSearchColumn('custrecord_fis_maximum'));
			columns.push(new nlobjSearchColumn('custrecord_fis_surchargerate'));
			var fab_surcharges = nlapiSearchRecord('customrecord_fabric_invoice_surcharge',null,filters,columns);

			for(var k=0; k<fab_surcharges.length;k++) {
				fabric_surcharges.push({
					surchargerate:fab_surcharges[k].getValue("custrecord_fis_surchargerate")
					,code:fab_surcharges[k].getValue("custrecord_fis_code")
					,name:fab_surcharges[k].getValue("custrecord_fis_name")
					,min:fab_surcharges[k].getValue('custrecord_fis_minimum')
					,max:fab_surcharges[k].getValue("custrecord_fis_maximum")
					,producttype:fab_surcharges[k].getValue('custrecord_fis_producttype')
				});
			}
			return fabric_surcharges;
		}

	,	getSurcharge:function (number, type,dop,fabric_surcharges)
        {

			if(type == 'Jacket') {
				if(number == 3 && dop.indexOf('T01022303') != -1){
					return {description: "Unlined Surcharge", rate:.15};
				}else if(number == 2 && dop.indexOf('T01022303') != -1){
					return {description: "Unlined Surcharge", rate:.15};
				}else if(number == 1 && dop.indexOf('T01022303') != -1){
					return {description: "Unlined Surcharge", rate:.25};
				}
			} else if(type == 'Trouser') {
				if(dop.indexOf('T01051703') != -1 || dop.indexOf('T01051704') != -1 || dop.indexOf('T01051705') != -1 || dop.indexOf('T01051707') != -1){
					if(number == 3)
						return {description: "Bottom Finishing Surcharge", rate:.05};
					else if(number == 2)
						return {description: "Bottom Finishing Surcharge", rate:.05};
					else if(number = 1)
						return {description: "Bottom Finishing Surcharge", rate:.10};
				}
			} else if(type == 'Waistcoat'){
				if(dop.indexOf('T01170501') != -1 || dop.indexOf('T01170504') != -1 || dop.indexOf('T01170505') != -1){
					if(number == 3)
						return {description: "Backstyle Surcharge", rate:.15};
					else if(number = 1)
						return {description: "Backstyle Surcharge", rate:.40};
				}
			} else if(type == 'Overcoat'){
				if(number == 1 && dop.indexOf('T01041102') != -1){
					return {description: "Unlined Surcharge", rate:.20};
				}
			}
			return {description: "No Surcharge", rate:0};
		}

		// @method manageFreeGifts
	,	manageFreeGifts: function manageFreeGifts ()
		{
			var promotions = ModelsInit.order.getAppliedPromotionCodes();

			promotions = _.filter(promotions, function(promo){ return promo.promotion_type === 'FREEGIFT';});

			return this.manageFreeGiftsWithPromotions(promotions);
		}

		// @method removeAllFreeGiftByPromotion
	,	removeAllFreeGiftsByPromotion: function (promotion_id)
		{
			var	lines = this.getLines(this.getFieldValues())
			,	found = false
			,	free_gift_line;

			lines = _.filter(lines, function(line){
				return line.free_gift;
			});

			_.each(lines, function(line)
			{
				if(!found && line.free_gift_info && line.free_gift_info.promotion_id === promotion_id)
				{
					free_gift_line = line;
					found = true;

					ModelsInit.order.removeItem(free_gift_line.internalid.toString());
				}
			});
		}

		// @method manageFreeGiftsWithPromotions
	,	manageFreeGiftsWithPromotions: function manageFreeGiftsWithPromotions (promotions)
		{
			if(promotions && promotions.length)
			{
				var elegible_free_gifts = this.getEligibleFreeGifts()
				,	free_gift;

				_.each(elegible_free_gifts, function(free_gift_obj)
				{
					if(free_gift_obj.promotion_id === promotions[0].promocodeid)
					{
						free_gift = free_gift_obj;
					}
				});

				var quantity_to_add = parseInt(free_gift.eligible_quantity - free_gift.rejected_quantity);

				this.removeAllFreeGiftsByPromotion(promotions[0].promocodeid);

				if (free_gift.eligible_items && free_gift.eligible_items.length)
				{
					var	item_stock = free_gift.eligible_items[0].available_quantity
				,	item_isbackorderable = free_gift.eligible_items[0].is_backorderable;

					if (quantity_to_add > 0)
					{
						if(item_stock < quantity_to_add && !item_isbackorderable)
						{
							quantity_to_add = item_stock;
						}

						this.addFreeGift(free_gift.eligible_items[0].item_id, free_gift.promotion_id, quantity_to_add, {});
					}
				}

				promotions = _.reject(promotions, function(promo){
					return promo.promocodeid === free_gift.promotion_id;
				});

				this.manageFreeGiftsWithPromotions(promotions);
			}
		}

		// @method addFreeGift
	,	addFreeGift: function addFreeGift (item_id, promotion_id, quantity, options)
		{
			try {
				return ModelsInit.order.addFreeGiftItem({'item_id': item_id.toString(), 'promotion_id': promotion_id, 'quantity': quantity.toString(), 'options': options});
			}
			catch(e)
			{
				if(e.errorcode === 'YOU_CANNOT_ADD_THIS_ITEM_TO_THE_CART_AS_IT_IS_CURRENTLY_OUT_OF_STOCK'){
					//console.log(JSON.stringify(e));
					ModelsInit.order.removePromotionCode(promotion_id);
				}
				throw e;
			}
		}

		// @method removeLine
		// @param {String} line_id
	,	removeLine: function removeLine (line_id)
		{
			this.storePromosPrevState();
			// Removes the line
			ModelsInit.order.removeItem(line_id);

			// Stores the current order
			var lines_sort = this.getLinesSort();
			lines_sort = _.without(lines_sort, line_id);
			this.setLinesSort(lines_sort);

			this.manageFreeGifts();
		}

		// @method updateLine
		// @param {String} line_id
		// @param {LiveOrder.Model.Line} line_data
	,	updateLine: function updateLine (line_id, line_data)
		{
			var lines_sort = this.getLinesSort()
			,	current_position = _.indexOf(lines_sort, line_id)
			,	original_line_object = ModelsInit.order.getItem(line_id, [
					'quantity'
				,	'internalid'
				,	'options'
				,	'fulfillmentPreferences'
			]);

			if (original_line_object && original_line_object.internalid)
			{
			this.storePromosPrevState();

			if(line_data.freeGift === true)
			{
				if (_.isNumber(line_data.quantity) && line_data.quantity > 0 && line_data.quantity !== original_line_object.quantity)
				{
					line_data.orderitemid = line_data.internalid;
					ModelsInit.order.updateItemQuantity(line_data);
				}

				if (this.isPickupInStoreEnabled && line_data.fulfillmentChoice !== original_line_object.fulfillmentPreferences.fulfillmentChoice)
				{
					var fulfillmentPreferences;

					if(line_data.fulfillmentChoice === 'pickup'){
						fulfillmentPreferences = {
							fulfillmentChoice: 'pickup'
						,	location: line_data.location
						};
					}
					else if(line_data.fulfillmentChoice === 'ship'){
						fulfillmentPreferences = {
							fulfillmentChoice: 'ship'
						};
					}

					if (fulfillmentPreferences) {
						ModelsInit.order.updateItemFulfillmentPreferences({orderitemid: line_data.internalid, fulfillmentPreferences: fulfillmentPreferences});
					}
				}
			}
			else
			{
				this.removeLine(line_id);

				var new_line_id;

				try
				{
					new_line_id = this.addLine(line_data);
				}
				catch (e)
				{
					// we try to roll back the item to the original state
					var roll_back_item = {
						item: {
							internalid: parseInt(original_line_object.internalid, 10)
						}
					,	quantity: parseInt(original_line_object.quantity, 10)
					};

					if (original_line_object.options && original_line_object.options.length)
					{
						roll_back_item.options = {};
						_.each(original_line_object.options, function (option)
						{
							roll_back_item.options[option.id.toLowerCase()] = option.value;
						});
					}

					new_line_id = this.addLine(roll_back_item);

					e.errorDetails = {
						status: 'LINE_ROLLBACK'
					,	oldLineId: line_id
					,	newLineId: new_line_id
					};

					throw e;
				}

				lines_sort = _.without(lines_sort, line_id, new_line_id);
				lines_sort.splice(current_position, 0, new_line_id);
				this.setLinesSort(lines_sort);

				this.manageFreeGifts();
			}
		}
		}

		// @method splitLines
		// @param {LiveOrder.Model.Line} data
		// @param current_order
	,	splitLines: function splitLines (data, current_order)
		{
			_.each(data.lines, function (line)
			{
				if (line.splitquantity)
				{
					var splitquantity = typeof line.splitquantity === 'string' ? parseInt(line.splitquantity,10) : line.splitquantity
					,	original_line = _.find(current_order.lines, function (order_line)
						{
							return order_line.internalid === line.internalid;
						})
					,	remaining = original_line ? (original_line.quantity - splitquantity) : -1;

					if (remaining > 0 && splitquantity > 0)
					{
						ModelsInit.order.splitItem({
							'orderitemid' : original_line.internalid
						,	'quantities': [
								splitquantity
							,	remaining
							]
						});
					}
				}
			});
		}

		// @method getFieldValues
		// @param {Array<String>} requested_field_keys To override field_keys got from configuration
		// @returns {Array<String>}
	,	getFieldValues: function (requested_field_keys)
		{
			var order_field_keys = {}
			,	isCheckout = Utils.isInCheckout(request) && ModelsInit.session.isLoggedIn2()
			,	field_keys = isCheckout ? Configuration.get('orderCheckoutFieldKeys') : Configuration.get('orderShoppingFieldKeys');

			if (requested_field_keys)
			{
				field_keys = {
					keys: requested_field_keys.keys || field_keys.keys
				,	items: requested_field_keys.items || field_keys.items
				};
			}

			order_field_keys.items = field_keys.items;

			_.each(field_keys.keys, function (key)
			{
				order_field_keys[key] = null;
			});

			if (this.isMultiShippingEnabled)
			{
				if (!_.contains(order_field_keys.items, 'shipaddress'))
				{
					order_field_keys.items.push('shipaddress');
				}
				if (!_.contains(order_field_keys.items, 'shipmethod'))
				{
					order_field_keys.items.push('shipmethod');
				}
				order_field_keys.ismultishipto = null;
			}

			if (this.isPickupInStoreEnabled)
			{
				if (!_.contains(order_field_keys.items, 'fulfillmentPreferences'))
				{
					order_field_keys.items.push('fulfillmentPreferences');
				}
			}

			return ModelsInit.order.getFieldValues(order_field_keys, false);
		}
		//@method removeAllPromocodes Removes all the promocodes or the ones passed by parameter
		//@param {Array<LiveOrder.Model.PromoCode>} promocodes_to_remove List of promocodes that will removed
		//@return {Void}
	,	removeAllPromocodes: function removeAllPromocodes (promocodes_to_remove)
		{
			if (promocodes_to_remove)
			{
				_.each(promocodes_to_remove, function (promo)
				{
					ModelsInit.order.removePromotionCode(promo.code);
				});
			}
			else
			{
				ModelsInit.order.removeAllPromotionCodes();
			}
		}


		//@method getPromoCodesOnly returns only the promocodes of the order without requesting unnecessary data
		//@return {Array<LiveOrder.Model.PromoCode>}
	,	getPromoCodesOnly: function getPromoCodesOnly()
		{
			var field_values = this.getFieldValues({
				keys: ['promocodes']
			,	items: []
			});
			return this.getPromoCodes(field_values);
		}

		// @method getPromoCodes
		// @param {Object} order_fields
		// @return {Array<LiveOrder.Model.PromoCode>}
	,	getPromoCodes: function getPromoCodes (order_fields)
		{
			var result = []
			,	elegible_free_gifts = this.getEligibleFreeGifts()
			,	self = this;

			if (order_fields.promocodes && order_fields.promocodes.length)
			{
				_.each(order_fields.promocodes, function (promo_code)
				{
					// @class LiveOrder.Model.PromoCode
					var promocode = {
						// @property {String} internalid
						internalid: promo_code.internalid
						// @property {String} internalid
					,	promocodeid: promo_code.promocodeid
						// @property {String} code
					,	code: promo_code.promocode
						// @property {Boolean} isvalid
					,	isvalid: promo_code.isvalid === 'T'
						// @property {String} discountrate_formatted
					,	discountrate_formatted: ''
					,	errormsg : promo_code.errormsg
					,	name: promo_code.discount_name
					,	rate: promo_code.discount_rate
					,	type: promo_code.promotion_type
					};

						// @property {Boolean} isautoapplied
						promocode.isautoapplied = promo_code.is_auto_applied;
						// @property {String} applicabilitystatus
						promocode.applicabilitystatus = (promo_code.applicability_status) ? promo_code.applicability_status : '';
						// @property {String} applicabilityreason
						promocode.applicabilityreason = (promo_code.applicability_reason) ? promo_code.applicability_reason : '';

					if (self.isNotificationFreeGift(promocode))
						{
						var old_gift_info = _.find(self.old_free_gifts, function (old_free_gift){ return old_free_gift.promotion_id === promo_code.promocodeid; })
						,	current_gift_info = _.find(elegible_free_gifts, function (free_gift){ return free_gift.promotion_id === promo_code.promocodeid; })
						,	free_gift_id;

						if ((!!old_gift_info || !!current_gift_info) && !(!!old_gift_info && !!current_gift_info && old_gift_info.added_quantity === current_gift_info.added_quantity))
						{
							free_gift_id = (!!old_gift_info) ? old_gift_info.eligible_items[0] : current_gift_info.eligible_items[0];

							promocode.notification = true;
							promocode.freegiftinfo = [old_gift_info, current_gift_info];

							promocode.freegiftname = ModelsInit.session.getItemFieldValues('typeahead', [free_gift_id.item_id]).items[0].storedisplayname2;
						}
					}
					else if (promo_code.applicability_status !== 'NOT_AVAILABLE' && !!self.old_promocodes)
						{
							var old_promocode = (self.old_promocodes) ? _.find(self.old_promocodes, function (old_promo_code){ return old_promo_code.internalid === promo_code.internalid; }) : '';

							if (!old_promocode || old_promocode.applicability_status !== promo_code.applicability_status || (!promo_code.is_auto_applied && promo_code.applicability_reason !== old_promocode.applicability_reason))
							{
								promocode.notification = true;
							}
						}

					result.push(promocode);
				});

					delete this.old_promocodes;
				delete this.old_free_gifts;
				}

			return result;
			}

	,	isNotificationFreeGift: function isNotificationFreeGift(promocode)
		{
			if(promocode.type === 'FREEGIFT' && !!this.old_free_gifts)
			{
				if(promocode.applicabilitystatus === 'APPLIED')
				{
					return true;
				}
				else if (promocode.applicabilitystatus === 'NOT_APPLIED' && promocode.applicabilityreason === 'NO_FREE_GIFTS_ADDED')
				{
					var old_gift_info = _.find(this.old_free_gifts, function (old_free_gift){ return old_free_gift.promotion_id === promocode.promocodeid; });

					if(!!old_gift_info && old_gift_info.applicability_status === 'APPLIED')
					{
						return true;
					}
				}
			}
			return false;
		}

		// @method getAutomaticallyRemovedPromocodes
		// @param {Object} order_fields
		// @return {Array<LiveOrder.Model.PromoCode>}
	,	getAutomaticallyRemovedPromocodes: function getAutomaticallyRemovedPromocodes(current_order)
		{
			var latest_promocodes = _.pluck(_.where(ModelsInit.order.getFieldValues(['promocodes']).promocodes, {isvalid:'T'}) ,'promocode')
			,	current_promocodes = _.pluck(_.where(current_order.promocodes,{isvalid:true}), 'code')
			,	removed_promocodes = _.difference(current_promocodes, latest_promocodes);

			return _.filter(current_order.promocodes, function (promocode)
			{
				return _.indexOf(removed_promocodes, promocode.code) >= 0;
			});
		}

		// @method setPromoCodes
		// @param {LiveOrder.Model.Data} data Received data from the service
		// @param {LiveOrder.Model.Data} current_order Returned data
		// @param current_order
	,	setPromoCodes: function setPromoCodes (data, current_order)
		{
			var self = this
			,	only_in_current_order = _.filter(current_order.promocodes, function (promocode){
				return !_.findWhere(data.promocodes, {'code': promocode.code});
			})
			,	only_in_data = _.filter(data.promocodes, function (promocode){
				return !_.findWhere(current_order.promocodes, {'code': promocode.code});
			});

			if(!_.isEmpty(only_in_current_order))
			{
				this.removeAllPromocodes(only_in_current_order);
			}

			data.promocodes = data.promocodes || [];

			var valid_promocodes = _.filter(only_in_data, function (promocode)
			{
				return promocode.isvalid !== false;
			});

			if (!Configuration.get('promocodes.allowMultiples', true) && valid_promocodes.length > 1)
			{
				valid_promocodes = [valid_promocodes[0]];
			}
			else
			{
				valid_promocodes = only_in_data;
			}

			_.each(valid_promocodes, function (promo)
			{

				if (!!promo.code)
				{
					promo.code = promo.code.trim();
				}

				try
				{
					self.addPromotion(promo.code);
				}
				catch (e)
				{
					var order_fields = self.getFieldValues()
					,	promos = self.getPromoCodes(order_fields)
					,	is_in_current_order = !!_.find(promos, function (p)
						{
							return promo.code === p.code;
						});

					//The error for this promocode will be in the information of the promocodes on the order with isvalid = F
					//Otherwise, it will be thrown as an exception so that the user knows what is going on
					if (!is_in_current_order)
					{
						throw e;
					}
				}
			});
		}

	,	addPromotion: function addPromotion(promo_code)
		{
			ModelsInit.order.applyPromotionCode(promo_code);
		}

		// @method getMultiShipMethods
		// @param {Array<LiveOrder.Model.Line>} lines
	,	getMultiShipMethods: function getMultiShipMethods (lines)
		{
			// Get multi ship methods
			var multishipmethods = {};

			_.each(lines, function (line)
			{
				if (line.shipaddress)
				{
					multishipmethods[line.shipaddress] = multishipmethods[line.shipaddress] || [];

					multishipmethods[line.shipaddress].push(line.internalid);
				}
			});

			_.each(_.keys(multishipmethods), function (address)
			{
				var methods = ModelsInit.order.getAvailableShippingMethods(multishipmethods[address], address);

				_.each(methods, function (method)
				{
					method.internalid = method.shipmethod;
					method.rate_formatted = Utils.formatCurrency(method.rate);
					delete method.shipmethod;
				});

				multishipmethods[address] = methods;
			});

			return multishipmethods;
		}

		//@method getShipMethodsOnly returns only the ship methods of the order without requesting unnecessary data
		//@return {Array<OrderShipMethod>}
	,	getShipMethodsOnly: function getShipMethodsOnly()
		{
			var field_values = this.getFieldValues({
				keys: ['shipmethods']
			,	items: []
			});
			return this.getShipMethods(field_values);
		}

		// @method getShipMethods
		// @param {Array<String>} order_fields
		// @returns {Array<OrderShipMethod>}
	,	getShipMethods: function getShipMethods (order_fields)
		{
			var shipmethods = _.map(order_fields.shipmethods, function (shipmethod)
			{
				var rate = Utils.toCurrency(shipmethod.rate.replace( /^\D+/g, '')) || 0;

				return {
					internalid: shipmethod.shipmethod
				,	name: shipmethod.name
				,	shipcarrier: shipmethod.shipcarrier
				,	rate: rate
				,	rate_formatted: shipmethod.rate
				};
			});

			return shipmethods;
		}

		// @method getLinesSort
		// @returns {Array<String>}
	,	getLinesSort: function getLinesSort ()
		{
			return ModelsInit.context.getSessionObject('lines_sort') ? ModelsInit.context.getSessionObject('lines_sort').split(',') : [];
		}

		//@method getPaymentMethodsOnly returns only the payment methods of the order without requesting unnecessary data
		//@return {Array<ShoppingSession.PaymentMethod>}
	,	getPaymentMethodsOnly: function getPaymentMethodsOnly()
		{
			var field_values = this.getFieldValues({
				keys: ['payment']
			,	items: []
			});
			return this.getPaymentMethods(field_values);
		}

		// @method getPaymentMethods
		// @param {Array<String>} order_fields
		// @returns {Array<ShoppingSession.PaymentMethod>}
	,	getPaymentMethods: function getPaymentMethods (order_fields)
		{
			var paymentmethods = []
			,	giftcertificates = ModelsInit.order.getAppliedGiftCertificates()
			,	payment = order_fields && order_fields.payment
			,	paypal = payment && _.findWhere(ModelsInit.session.getPaymentMethods(), {ispaypal: 'T'})
			,	credit_card = payment && payment.creditcard;

			if (credit_card && credit_card.paymentmethod && credit_card.paymentmethod.creditcard === 'T')
			{
				// Main
				paymentmethods.push({
					type: 'creditcard'
				,	primary: true
				,	creditcard: {
						internalid: credit_card.internalid || '-temporal-'
					,	ccnumber: credit_card.ccnumber
					,	ccname: credit_card.ccname
					,	ccexpiredate: credit_card.expmonth + '/' + credit_card.expyear
					,	ccsecuritycode: credit_card.ccsecuritycode
					,	expmonth: credit_card.expmonth
					,	expyear: credit_card.expyear
					,	paymentmethod: {
							internalid: credit_card.paymentmethod.internalid
						,	name: credit_card.paymentmethod.name
						,	creditcard: credit_card.paymentmethod.creditcard === 'T'
						,	ispaypal: credit_card.paymentmethod.ispaypal === 'T'
						,	isexternal: credit_card.paymentmethod.isexternal === 'T'
						,	key: credit_card.paymentmethod.key
						}
					}
				});
			}
			else if (paypal && payment.paymentmethod === paypal.internalid)
			{
				paymentmethods.push({
					type: 'paypal'
				,	primary: true
				,	complete: ModelsInit.context.getSessionObject('paypal_complete') === 'T'
				,	internalid: paypal.internalid
				,	name: paypal.name
				,	creditcard: paypal.creditcard === 'T'
				,	ispaypal: paypal.ispaypal === 'T'
				,	isexternal: paypal.isexternal === 'T'
				,	key: paypal.key
				});
			}
			else if (credit_card && credit_card.paymentmethod && credit_card.paymentmethod.isexternal === 'T')
			{
				paymentmethods.push({
					type: 'external_checkout_' + credit_card.paymentmethod.key
				,	primary: true
				,	internalid: credit_card.paymentmethod.internalid
				,	name: credit_card.paymentmethod.name
				,	creditcard: credit_card.paymentmethod.creditcard === 'T'
				,	ispaypal: credit_card.paymentmethod.ispaypal === 'T'
				,	isexternal: credit_card.paymentmethod.isexternal === 'T'
				,	key: credit_card.paymentmethod.key
				,	errorurl: payment.errorurl
				,	thankyouurl: payment.thankyouurl
				});
			}
			else if (order_fields.payment && order_fields.payment.paymentterms === 'Invoice')
			{
				var customer_invoice = ModelsInit.customer.getFieldValues([
					'paymentterms'
				,	'creditlimit'
				,	'balance'
				,	'creditholdoverride'
				]);

				paymentmethods.push({
					type: 'invoice'
				,	primary: true
				,	paymentterms: customer_invoice.paymentterms
				,	creditlimit: parseFloat(customer_invoice.creditlimit || 0)
				,	creditlimit_formatted: Utils.formatCurrency(customer_invoice.creditlimit)
				,	balance: parseFloat(customer_invoice.balance || 0)
				,	balance_formatted: Utils.formatCurrency(customer_invoice.balance)
				,	creditholdoverride: customer_invoice.creditholdoverride
				});
			}

			if (giftcertificates && giftcertificates.length)
			{
				_.forEach(giftcertificates, function (giftcertificate)
				{
					paymentmethods.push({
						type: 'giftcertificate'
					,	giftcertificate: {
							code: giftcertificate.giftcertcode

						,	amountapplied: Utils.toCurrency(giftcertificate.amountapplied || 0)
						,	amountapplied_formatted: Utils.formatCurrency(giftcertificate.amountapplied || 0)

						,	amountremaining: Utils.toCurrency(giftcertificate.amountremaining || 0)
						,	amountremaining_formatted: Utils.formatCurrency(giftcertificate.amountremaining || 0)

						,	originalamount: Utils.toCurrency(giftcertificate.originalamount || 0)
						,	originalamount_formatted: Utils.formatCurrency(giftcertificate.originalamount || 0)
						}
					});
				});
			}

			return paymentmethods;
		}

		// @method getTransactionBodyField
		// @returns {Object}
	,	getTransactionBodyField: function getTransactionBodyField ()
		{
			var options = {};

			if (this.isSecure)
			{
				var fieldsIdToBeExposed = CustomFieldsUtils.getCustomFieldsIdToBeExposed('salesorder');
				_.each(ModelsInit.order.getCustomFieldValues(), function (option)
				{
					//expose the custom field value if was configured in the backend configuration
					if(_.find(fieldsIdToBeExposed, function (fieldIdToBeExposed){ return option.name === fieldIdToBeExposed;}))
					{
						options[option.name] = (option.value.indexOf(String.fromCharCode(5)) !== -1) ?  option.value.split(String.fromCharCode(5)) : option.value;
					}
				});
			}
			return options;
		}

		// @method getAddresses
		// @param {Array<String>} order_fields
		// @returns {Array<OrderAddress>}
	,	getAddresses: function getAddresses (order_fields)
		{
			var self = this
			,	addresses = {}
			,	address_book = ModelsInit.session.isLoggedIn2() && this.isSecure ? ModelsInit.customer.getAddressBook() : [];

			address_book = _.object(_.pluck(address_book, 'internalid'), address_book);
			// General Addresses
			if (order_fields.ismultishipto === 'T')
			{
				_.each(order_fields.items || [], function (line)
				{
					if (line.shipaddress && !addresses[line.shipaddress])
					{
						self.addAddress(address_book[line.shipaddress], addresses);
					}
				});
			}
			else
			{
				this.addAddress(order_fields.shipaddress, addresses);
			}

			this.addAddress(order_fields.billaddress, addresses);

			return _.values(addresses);
		}

		// @method getLines Set Order Lines into the result. Standardizes the result of the lines
		// @param {Object} order_fields
		// @returns {Array<LiveOrder.Model.Line>}
	,	getLines: function getLines (order_fields)
		{
			var lines = [];
			if (order_fields.items && order_fields.items.length)
			{
				var self = this
				,	items_to_preload = []
				,	address_book = ModelsInit.session.isLoggedIn2() && this.isSecure ? ModelsInit.customer.getAddressBook() : []
				,	item_ids_to_clean = []
				,	free_gifts = this.getEligibleFreeGifts();

				address_book = _.object(_.pluck(address_book, 'internalid'), address_book);

				_.each(order_fields.items, function (original_line)
				{
					// Total may be 0
					var	total = (original_line.promotionamount) ? Utils.toCurrency(original_line.promotionamount) : Utils.toCurrency(original_line.amount)
					,	discount = Utils.toCurrency(original_line.promotiondiscount) || 0
					,	line_to_add;

					// @class LiveOrder.Model.Line represents a line in the LiveOrder
					line_to_add = {
						// @property {String} internalid
						internalid: original_line.orderitemid
						// @property {Number} quantity
					,	quantity: original_line.quantity
						// @property {Number} rate
					,	rate: parseFloat(original_line.rate)
						// @property {String} rate_formatted
					,	rate_formatted: original_line.rate_formatted
						// @property {Number} amount
					,	amount: Utils.toCurrency(original_line.amount)
						// @property {String} tax_rate1
					,	tax_rate1: original_line.taxrate1
						// @property {String} tax_type1
					,	tax_type1: original_line.taxtype1
						// @property {String} tax_rate2
					,	tax_rate2: original_line.taxrate2
						// @property {String} tax_type2
					,	tax_type2: original_line.taxtype2
						// @property {Number} tax1_amount
					,	tax1_amount: original_line.tax1amt
						// @property {String} tax1_amount_formatted
					,	tax1_amount_formatted: Utils.formatCurrency(original_line.tax1amt)
						// @property {Number} discount
					,	discount: discount
					,	promotion_discount: original_line.promotionamount
						// @property {Number} total
					,	total: total
						// @property {String} item internal id of the line's item
					,	item: original_line.internalid
						// @property {String} itemtype
					,	itemtype: original_line.itemtype
						// @property {Array<LiveOrder.Model.Line.Option>} options
					,	options: self.parseLineOptionsFromCommerceAPI(original_line.options)
						// @property {OrderAddress} shipaddress
					,	shipaddress: original_line.shipaddress
						// @property {OrderShipMethod} shipmethod
					,	shipmethod: original_line.shipmethod
						// @property {Boolean} free_gift
					,	free_gift: !!original_line.freegiftpromotionid
						// @property {Array<DiscountsImpact>} discounts_impact
					,	discounts_impact: original_line.discounts_impact
					};

					if (self.isPickupInStoreEnabled && original_line.fulfillmentPreferences)
					{
						// @property {Number} location
						line_to_add.location = original_line.fulfillmentPreferences.pickupLocationId;
						// @property {String} fulfillmentChoice
						line_to_add.fulfillmentChoice = original_line.fulfillmentPreferences.fulfillmentChoice;
					}



					if (line_to_add.free_gift === true)
					{
						var gift_info = _.find(free_gifts, function(free_gift) { return free_gift.promotion_id.toString() === line_to_add.discounts_impact.discounts[0].promotion_id.toString(); });
						line_to_add.free_gift_info = gift_info;
					}

					if (line_to_add.shipaddress && !address_book[line_to_add.shipaddress])
					{
						line_to_add.shipaddress = null;
						line_to_add.shipmethod = null;
						item_ids_to_clean.push(line_to_add.internalid);
					}
					else
					{
						items_to_preload.push({
							id: original_line.internalid
						,	type: original_line.itemtype
						});
					}

					lines.push(line_to_add);

				});

				if (item_ids_to_clean.length)
				{
					ModelsInit.order.setItemShippingAddress(item_ids_to_clean, null);
					ModelsInit.order.setItemShippingMethod(item_ids_to_clean, null);
				}

				var	restart = false;

				StoreItem.preloadItems(items_to_preload);

				lines.forEach(function (line)
				{
					line.item = StoreItem.get(line.item, line.itemtype);

					if (!line.item)
					{
						self.removeLine(line.internalid);
						restart = true;
					}
					else
					{
						line.rate_formatted = Utils.formatCurrency(line.rate);
						line.amount_formatted = Utils.formatCurrency(line.amount);
						line.tax_amount_formatted = Utils.formatCurrency(line.tax_amount);
						line.discount_formatted = Utils.formatCurrency(line.discount);
						line.total_formatted = Utils.formatCurrency(line.total);
					}
				});

				if (restart)
				{
					throw {code: 'ERR_CHK_ITEM_NOT_FOUND'};
				}

				// Sort the items in the order they were added, this is because the update operation alters the order
				var lines_sort = this.getLinesSort();

				if (lines_sort.length)
				{
					lines = _.sortBy(lines, function (line)
					{
						return _.indexOf(lines_sort, line.internalid);
					});
				}
				else
				{
					this.setLinesSort(_.pluck(lines, 'internalid'));
				}
			}

			return lines;
		}
		//@method getLinesOnly returns only the lines of the order without requesting unnecessary data
		//@return {Array<LiveOrder.Model.Line>}
	,	getLinesOnly: function getLinesOnly()
		{
			var field_values = this.getFieldValues({
				keys: []
			,	items: null
			});
			return this.getLines(field_values);
		}
		//@method getSummary gives the summary of the order requesting only the needed data
		//@return {Object} An object containing the summary
	,	getSummary: function getSummary()
		{
			var summary = this.getFieldValues({
				keys: ['summary']
			,	items: []
			}).summary;
			return _.clone(summary);
		}
		//@method parseLineOptionsToCommerceAPI Given the list of options from he Front-end it parsed to the particular CommerceAPI format
		//@param {Array<LiveOrder.Model.Line.Option>} options
		//@return {Object} An object used as a dictionary where each key is the cart option id and the values are the option's value internalid
	,	parseLineOptionsToCommerceAPI: function parseLineOptionsToCommerceAPI (options)
		{
			var result = {};
			_.each(options || [], function (option)
			{
				if (option && option.value && option.cartOptionId)
				{
					result[option.cartOptionId] = option.value.internalid;
				}
			});
			return result;
		}
		//@method parseLineOptionsFromCommerceAPI
		//@param {Array<CommerceAPI.LineOption>} options
		//@return {Array<LiveOrder.Model.Line.Option>}
	,	parseLineOptionsFromCommerceAPI: function parseLineOptionsFromCommerceAPI (options)
		{
			//@class CommerceAPI.LineOption
			//@property {String} displayvalue
			//@property {String} id
			//@property {String} name
			//@property {String} value

			return _.map(options, function (option)
			{
				var option_label =  Utils.trim(option.name);

				option_label = Utils.stringEndsWith(option_label, ':') ? option_label.substr(0, option_label.length - 1) : option_label;

				//@class LiveOrder.Model.Line.Option
				return {
					//@property {LiveOrder.Model.Line.Option.Value} value
					//@class LiveOrder.Model.Line.Option.Value
					value:
					{
						//@property {String} label Name of the value selected in case of select or the entered string
						label: option.displayvalue
						//@property {String} internalid
					,	internalid: option.value
					}
					//@class LiveOrder.Model.Line.Option
					//@property {String} cartOptionId
				,	cartOptionId: option.id.toLowerCase()
					//@property {String} label
				,	label: option_label
				};
			});

			//@class LiveOrder.Model
		}

		// @method parseLineOptionsFromSuiteScript
		// @param {String} options
	,	parseLineOptionsFromSuiteScript: function parseLineOptionsFromSuiteScript (options_string)
		{
			var options_object = [];

			if (options_string && options_string !== '- None -')
			{
				var split_char_3 = String.fromCharCode(3)
				,	split_char_4 = String.fromCharCode(4);

				_.each(options_string.split(split_char_4), function (option_line)
				{
					option_line = option_line.split(split_char_3);

					//@class Transaction.Model.Get.Line.Option
					options_object.push({
						//@property {String} cartOptionId
						cartOptionId: option_line[0].toLowerCase()
						//@property {String} label
					,	label: option_line[2]
						//@property {Transaction.Model.Get.Line.Option.Value} value
					,	value: {
							//@class Transaction.Model.Get.Line.Option.Value
							//@property {String} label
							label: option_line[4]
							//@property {String} internalid
						,	internalid: option_line[3]
						}
						//@class Transaction.Model.Get.Line.Option
						//@property {Boolean} mandatory
					,	ismandatory: option_line[1]	=== 'T'
					});
				});
			}
			//@class LiveOrder.Model

			return options_object;
		}

		// @method getIsMultiShipTo @param {Array<String>} order_fields @returns {Boolean}
	,	getIsMultiShipTo: function getIsMultiShipTo (order_fields)
		{
			return this.isMultiShippingEnabled && order_fields.ismultishipto === 'T';
		}

		// @method setLinesSort
		// @param {String} lines_sort
		// @returns {String}
	,	setLinesSort: function setLinesSort (lines_sort)
		{
			return ModelsInit.context.setSessionObject('lines_sort', lines_sort || []);
		}

		//@method setBillingAddressOnly gets only the shipaddress of the order without requesting unnecessary data
	,	setBillingAddressOnly: function setBillingAddressOnly(data)
		{
			var field_values = this.getFieldValues({
				keys: ['billaddress']
			,	items: []
			});
			return this.setBillingAddress(data, field_values);
		}

		// @method setBillingAddress
		// @param data
		// @param {LiveOrder.Model.Data} current_order
	,	setBillingAddress: function setBillingAddress (data, current_order)
		{
			if (data.sameAs)
			{
				data.billaddress = data.shipaddress;
			}

			if (data.billaddress !== current_order.billaddress)
			{
				if (data.billaddress)
				{
					if (data.billaddress && !~data.billaddress.indexOf('null'))
					{
						// Heads Up!: This "new String" is to fix a nasty bug
						ModelsInit.order.setBillingAddress(new String(data.billaddress).toString());
					}
				}
				else if (this.isSecure)
				{
					ModelsInit.order.removeBillingAddress();
				}
			}
		}

		// @method setShippingAddressAndMethod
		// @param {LiveOrder.Model.Data} data
		// @param current_order
	,	setShippingAddressAndMethod: function setShippingAddressAndMethod (data, current_order)
		{
			var current_package
			,	packages = {}
			,	item_ids_to_clean = []
			,	original_line;

			_.each(data.lines, function (line)
			{
				original_line = _.find(current_order.lines, function (order_line)
				{
					return order_line.internalid === line.internalid;
				});

				if (original_line && original_line.item && original_line.item.isfulfillable !== false)
				{
					if (line.shipaddress)
					{
						packages[line.shipaddress] = packages[line.shipaddress] || {
							shipMethodId: null
						,	itemIds: []
						};

						packages[line.shipaddress].itemIds.push(line.internalid);
						if (!packages[line.shipaddress].shipMethodId && line.shipmethod)
						{
							packages[line.shipaddress].shipMethodId = line.shipmethod;
						}
					}
					else
					{
						item_ids_to_clean.push(line.internalid);
					}
				}
			});

			//CLEAR Shipping address and shipping methods
			if (item_ids_to_clean.length)
			{
				ModelsInit.order.setItemShippingAddress(item_ids_to_clean, null);
				ModelsInit.order.setItemShippingMethod(item_ids_to_clean, null);
			}

			//SET Shipping address and shipping methods
			_.each(_.keys(packages), function (address_id)
			{
				current_package = packages[address_id];
				ModelsInit.order.setItemShippingAddress(current_package.itemIds, parseInt(address_id, 10));

				if (current_package.shipMethodId)
				{
					ModelsInit.order.setItemShippingMethod(current_package.itemIds, parseInt(current_package.shipMethodId, 10));
				}
			});
		}

		//@method setShippingAddressOnly gets only the shipaddress of the order without requesting unnecessary data
	,	setShippingAddressOnly: function setShippingAddressOnly(data)
		{
			var field_values = this.getFieldValues({
				keys: ['shipaddress']
			,	items: []
			});
			return this.setShippingAddress(data, field_values);
		}

		// @method setShippingAddress
		// @param {LiveOrder.Model.Data} data
		// @param current_order
	,	setShippingAddress: function setShippingAddress (data, current_order)
		{
			if (data.shipaddress !== current_order.shipaddress)
			{
				if (data.shipaddress)
				{
					if (this.isSecure && !~data.shipaddress.indexOf('null'))
					{
						// Heads Up!: This "new String" is to fix a nasty bug
						ModelsInit.order.setShippingAddress(new String(data.shipaddress).toString());
					}
					else
					{
						this.estimateShippingCost(data);
					}
				}
				else if (this.isSecure)
				{
					ModelsInit.order.removeShippingAddress();
				}
				else
				{
					this.removeEstimateShippingCost();
				}
			}
		}

	,	estimateShippingCost: function estimateShippingCost(data)
		{
			var address = _.find(data.addresses, function (address)
			{
				return address.internalid === data.shipaddress;
			});

			address && ModelsInit.order.estimateShippingCost(address);
		}

	,	removeEstimateShippingCost: function removeEstimateShippingCost()
		{
			ModelsInit.order.estimateShippingCost({
				zip: null
			,	country: null
			});
			ModelsInit.order.removeShippingMethod();
		}

		// @method setPurchaseNumber
		// @param {LiveOrder.Model.Data} data
	,	setPurchaseNumber: function setPurchaseNumber (data)
		{
			if(ModelsInit.session.isLoggedIn2())
			{
				if (data && data.purchasenumber)
				{
					ModelsInit.order.setPurchaseNumber(data.purchasenumber);
				}
				else
				{
					ModelsInit.order.removePurchaseNumber();
				}
			}
		}

		// @method setPaymentMethods
		// @param {LiveOrder.Model.Data} data
	,	setPaymentMethods: function setPaymentMethods (data)
		{
			// Because of an api issue regarding Gift Certificates, we are going to handle them separately
			var gift_certificate_methods = _.where(data.paymentmethods, {type: 'giftcertificate'})
			,	non_certificate_methods = _.difference(data.paymentmethods, gift_certificate_methods);

			// Payment Methods non gift certificate
			if (this.isSecure && non_certificate_methods && non_certificate_methods.length && ModelsInit.session.isLoggedIn2())
			{
				_.each(non_certificate_methods, function (paymentmethod)
				{
					if (paymentmethod.type === 'creditcard' && paymentmethod.creditcard)
					{

						var credit_card = paymentmethod.creditcard
						,	require_cc_security_code = ModelsInit.session.getSiteSettings(['checkout']).checkout.requireccsecuritycode === 'T'
						,	cc_obj = credit_card && {
										ccnumber: credit_card.ccnumber
									,	ccname: credit_card.ccname
									,	ccexpiredate: credit_card.ccexpiredate
									,	expmonth: credit_card.expmonth
									,	expyear:  credit_card.expyear
									,	paymentmethod: {
											internalid: credit_card.paymentmethod.internalid || credit_card.paymentmethod
										,	name: credit_card.paymentmethod.name
										,	creditcard: credit_card.paymentmethod.creditcard ? 'T' : 'F'
										,	ispaypal:  credit_card.paymentmethod.ispaypal ? 'T' : 'F'
										,	key: credit_card.paymentmethod.key
										}
									};
						if (credit_card.internalid !== '-temporal-')
						{
							cc_obj.internalid = credit_card.internalid;
						}
						else
						{
							cc_obj.internalid = null;
							cc_obj.savecard = 'F';
						}

						if (credit_card.ccsecuritycode)
						{
							cc_obj.ccsecuritycode = credit_card.ccsecuritycode;
						}

						if (!require_cc_security_code || require_cc_security_code && credit_card.ccsecuritycode)
						{
							// the user's default credit card may be expired so we detect this using try & catch and if it is we remove the payment methods.
							try
							{
								// if the credit card is not temporal or it is temporal and the number is complete then set payment method.
								if (cc_obj.internalid || (!cc_obj.internalid && !~cc_obj.ccnumber.indexOf('*') ) )
								{
									ModelsInit.order.removePayment();

									var cc_parameter = {
										creditcard: {
											internalid: cc_obj.internalid
										,	ccsecuritycode: cc_obj.ccsecuritycode
										,	paymentmethod: {
												internalid: cc_obj.paymentmethod.internalid
											}
										}
									}
									ModelsInit.order.setPayment(cc_parameter);

									ModelsInit.context.setSessionObject('paypal_complete', 'F');
								}
							}
							catch (e)
							{
								if (e && e.code && e.code === 'ERR_WS_INVALID_PAYMENT')
								{
									ModelsInit.order.removePayment();
								}
								throw e;
							}

						}
						// if the the given credit card don't have a security code and it is required we just remove it from the order
						else if (require_cc_security_code && !credit_card.ccsecuritycode)
						{
							ModelsInit.order.removePayment();
						}
					}
					else if (paymentmethod.type === 'invoice')
					{
						ModelsInit.order.removePayment();

						try
						{
							ModelsInit.order.setPayment({ paymentterms: 'Invoice' });
						}
						catch (e)
						{
							if (e && e.code && e.code === 'ERR_WS_INVALID_PAYMENT')
							{
								ModelsInit.order.removePayment();
							}
							throw e;
						}

						ModelsInit.context.setSessionObject('paypal_complete', 'F');
					}
					else if (paymentmethod.type === 'paypal')
					{
						if (ModelsInit.context.getSessionObject('paypal_complete') !== 'T')
						{
							ModelsInit.order.removePayment();
							var paypal = _.findWhere(ModelsInit.session.getPaymentMethods(), {ispaypal: 'T'});
							paypal && ModelsInit.order.setPayment({paymentterms: '', paymentmethod: paypal.key});
						}

					}
					else if (paymentmethod.type && ~paymentmethod.type.indexOf('external_checkout'))
					{
						ModelsInit.order.removePayment();

						ModelsInit.order.setPayment({
								paymentmethod: paymentmethod.key
							,	thankyouurl: paymentmethod.thankyouurl
							,	errorurl: paymentmethod.errorurl
						});
					}
					else
					{
						ModelsInit.order.removePayment();
					}
				});
			}
			else if (this.isSecure && ModelsInit.session.isLoggedIn2())
			{
				ModelsInit.order.removePayment();
			}

			gift_certificate_methods = _.map(gift_certificate_methods, function (gift_certificate)
			{
				return gift_certificate.giftcertificate;
			});

			this.setGiftCertificates(gift_certificate_methods);
		}

		// @method setGiftCertificates
		// @param {Array<Object>} gift_certificates
	,	setGiftCertificates: function setGiftCertificates (gift_certificates)
		{
			// Remove all gift certificates so we can re-enter them in the appropriate order
			ModelsInit.order.removeAllGiftCertificates();

			_.forEach(gift_certificates, function (gift_certificate)
			{
				ModelsInit.order.applyGiftCertificate(gift_certificate.code);
			});
		}

		//@method setShippingMethodOnly gets only the shipmethod of the order without requesting unnecessary data
	,	setShippingMethodOnly: function setShippingMethodOnly(data)
		{
			var field_values = this.getFieldValues({
				keys: ['shipmethod', 'shipmethods']
			,	items: []
			})
			,	shipping_methods = this.getShipMethods(field_values)
			,	order_fields = {
					shipmethods: shipping_methods
				,	shipmethod: field_values.shipmethod
				};

			return this.setShippingMethod(data, order_fields);
		}

		// @method setShippingMethod
		// @param {LiveOrder.Model.Data} data
		// @param current_order
	,	setShippingMethod: function setShippingMethod (data, current_order)
		{
			if ((!this.isMultiShippingEnabled || !data.ismultishipto) && this.isSecure && data.shipmethod !== current_order.shipmethod)
			{
				var shipmethod = _.findWhere(current_order.shipmethods, {internalid: data.shipmethod});

				if (shipmethod)
				{
					ModelsInit.order.setShippingMethod({
						shipmethod: shipmethod.internalid
					,	shipcarrier: shipmethod.shipcarrier
					});
				}
				else
				{
					ModelsInit.order.removeShippingMethod();
				}
			}
		}

		// @method setTermsAndConditions
		// @param {LiveOrder.Model.Data} data
	,	setTermsAndConditions: function setTermsAndConditions (data)
		{
			var require_terms_and_conditions = ModelsInit.session.getSiteSettings(['checkout']).checkout.requiretermsandconditions;

			if (require_terms_and_conditions.toString() === 'T' && this.isSecure && !_.isUndefined(data.agreetermcondition) && ModelsInit.session.isLoggedIn2())
			{
				ModelsInit.order.setTermsAndConditions(data.agreetermcondition);
			}
		}

		// @method setTransactionBodyField
		// @param {LiveOrder.Model.Data} data
	,	setTransactionBodyField: function setTransactionBodyField (data)
		{
			// Transaction Body Field
			if (this.isSecure && !_.isEmpty(data.options) && ModelsInit.session.isLoggedIn2())
			{
				_.each(data.options, function(value, key)
				{
					if (Array.isArray(value))
					{
						data.options[key] = value.join(String.fromCharCode(5));
					}
				});
				ModelsInit.order.setCustomFieldValues(data.options);
			}
		}

	,	getOptionByCartOptionId: function getOptionByCartOptionId (options, cart_option_id)
		{
			return _.findWhere(options, {cartOptionId: cart_option_id});
		}

		// @method process3DSecure. 3D Secure is a second factor authentication.
		// Can apply to Visa, MasterCard, JCB International and American Express.
		// @return {Object} Result of order submit operation ({status, internalid, confirmationnumber})
	,	process3DSecure: function process3DSecure ()
		{
			var orderHandlerUrl = ModelsInit.session.getAbsoluteUrl2('checkout', '../threedsecure.ssp')
			,	confirmation = ModelsInit.order.submit({
					paymentauthorization: {
						type: 'threedsecure',
						noredirect: 'T',
						termurl: orderHandlerUrl
					}
				});

			if (confirmation.statuscode === 'error')
			{
				// With 3D Secure, we expect the order.submit() operation returning
				// 'ERR_WS_REQ_PAYMENT_AUTHORIZATION' to continue the flow.
				if (confirmation.reasoncode === 'ERR_WS_REQ_PAYMENT_AUTHORIZATION')
				{
					return confirmation;
				}

				throw confirmation;
			}
			else
			{
				confirmation = _.extend(this.getConfirmation(confirmation.internalid), confirmation);
			}
			return confirmation;
		}

	,	getEligibleFreeGifts: function getEligibleFreeGifts()
		{
			return ModelsInit.order.getEligibleFreeGiftItems();
		}

	,	storePromosPrevState: function storePromosPrevState ()
		{
			this.old_promocodes = ModelsInit.order.getAppliedPromotionCodes() || {};

			this.old_free_gifts = this.getEligibleFreeGifts();

		}
	});
});
