/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Cart
define(
	'Cart.Summary.View'
,	[
		'SC.Configuration'
	,	'Cart.PromocodeForm.View'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'GlobalViews.FormatPaymentMethod.View'
	,	'Profile.Model'
	,	'Cart.Promocode.List.View'
	,	'Session'
	,	'Tracker'

	,	'cart_summary_updated.tpl'

	,	'underscore'
	,	'Backbone'
	]
,	function (
		Configuration
	,	CartPromocodeFormView
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	GlobalViewsFormatPaymentMethodView
	,	ProfileModel
	,	CartPromocodeListView
	,	Session
	,	Tracker

	,	cart_summary_updated

	,	_
	,	Backbone
	)
{
	'use strict';

	// @class Cart.Summary.View @extends Backbone.View
	return Backbone.View.extend({

		// @property {Function} template
		template: cart_summary_updated

		// @method initialize
	,	initialize: function initialize (options)
		{
			this.model = options.model;
			BackboneCompositeView.add(this);
			this.idsTrack = [];

			// this.promocodeFormComponent = new CartPromocodeFormView({
			// 	model: this.model
			// ,	application: this.options.application
			// });
		}

	,	events: {
			'click [id="btn-proceed-checkout"]': 'validateItems'
		}
		// @property {Object} childViews
	,	childViews: {
			'Cart.PromocodeFrom': function ()
			{
				return this.promocodeFormComponent;
			}

		,	'CartPromocodeListView': function ()
			{
				return new CartPromocodeListView({
					model: this.model
				,	isReadOnly: false
				});
			}

		,	'GiftCertificates': function ()
			{
				var	gift_certificates = this.model.get('paymentmethods').where({type: 'giftcertificate'}) || [];

				return new BackboneCollectionView({
						collection: gift_certificates
					,	cellTemplate: cart_summary_gift_certificate_cell_tpl
					,	viewsPerRow: 1
					,	childView: GlobalViewsFormatPaymentMethodView
					,	rowTemplate: null
				});
			}
		}

	,	validateItems: function(e)
		{
			e.preventDefault();

			var self = this;
			var hasError = false;
			var cart = this.model;

			var clientName = '';
			var previousLineInternalId = '';
			var previousClientId = '';
			var differentClientIdError = false;
			//Checking for Vendor Picked is Jerome Clothiers
			// if(self.application.getUser().get('isoverdue') == 'T'){
			// 	jQuery("#cart-alert-placeholder").append('You cannot process orders until you have paid your outstanding invoices.');
			// 	return;
			// }
			jQuery('[data-type="alert-placeholder-module"]').text('');
			cart.get('lines').each(function (line){
				if (self.idsTrack.indexOf(line.get('internalid')) == -1) {
					//jQuery(jQuery(".alert-placeholder-class-" + line.get('internalid')[0])).removeAttr('id');
					jQuery("#alert-placeholder-" + line.get('internalid')).removeClass(".alert-placeholder-class-" + line.get('internalid'));
					self.idsTrack.push(line.get('internalid'));
				}
				var r = new RegExp(/^[TR]{2}\d{3}($|-+\w*)|^[TRR]{3}\d{3}($|-+\w*)|^[TRD]{3}\d{2}($|-+\w*)/);
				jQuery(".alert-placeholder-class-" + line.get('internalid')).text('');
				/*check for lining status */
				var options = line.get('options');
				var itemoptions = line.get('options');
				var designoption = _.find(itemoptions.models,function(op){return op.attributes.cartOptionId == 'custcol_designoptions_jacket'});
				if(designoption){
					var doJSON = designoption.attributes.value.label || designoption.attributes.value.internalid
					doJSON = JSON.parse(doJSON);
					//Jacket
					var lfab = _.find(doJSON,function(b){return b.name == 'li-b-j';});
					if(lfab && r.test(jQuery(lfab.value))){
						var found = _.find(self.liningfabrics,function(d){
							return d.custrecord_flf_ftcode == lfab.value;
							});
						if(!found || found.custrecord_flf_ftstatustext == "Out of Stock" || found.custrecord_flf_ftstatustext == "Temp Soldout" || found.custrecord_flf_ftstatustext == "Soldout"){
							jQuery(".alert-placeholder-class-" + line.get('internalid')).append("<div class='alert alert-danger alert-dismissible fade in'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>Lining fabric is out of stock.</div>");  //01/08/2019 Saad
							hasError = true;
						}else{

						}
					}
					var lfab = _.find(doJSON,function(b){return b.name == 'T010227';});
					if(lfab && r.test(jQuery(lfab.value))){
						var found = _.find(self.liningfabrics,function(d){
							return d.custrecord_flf_ftcode == lfab.value;
							});
						if(!found || found.custrecord_flf_ftstatustext == "Out of Stock" || found.custrecord_flf_ftstatustext == "Temp Soldout" || found.custrecord_flf_ftstatustext == "Soldout"){
							jQuery(".alert-placeholder-class-" + line.get('internalid')).append("<div class='alert alert-danger alert-dismissible fade in'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>Interior pocket lining is out of stock.</div>");  //01/08/2019 Saad
							hasError = true;
						}else{

						}
					}
				}
				//Waistcoat
				var designoption = _.find(itemoptions.models,function(op){return op.attributes.cartOptionId == 'custcol_designoptions_waistcoat'});

				if(designoption){
					var doJSON = designoption.attributes.value.label || designoption.attributes.value.internalid
					doJSON = JSON.parse(doJSON);
					var lfab = _.find(doJSON,function(b){return b.name == 'li-bl-w';});
					if(lfab && r.test(jQuery(lfab.value))){
						var found = _.find(self.liningfabrics,function(d){
							return d.custrecord_flf_ftcode == lfab.value;
							});
						if(!found || found.custrecord_flf_ftstatustext == "Out of Stock" || found.custrecord_flf_ftstatustext == "Temp Soldout" || found.custrecord_flf_ftstatustext == "Soldout"){
							jQuery(".alert-placeholder-class-" + line.get('internalid')).append("<div class='alert alert-danger alert-dismissible fade in'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>Lining fabric is out of stock.</div>");  //01/08/2019 Saad
							hasError = true;
						}else{

						}
					}
				}
				// //Overcoat
				var designoption = _.find(itemoptions.models,function(op){return op.attributes.cartOptionId == 'custcol_designoptions_overcoat'});

				if(designoption){
					var doJSON = designoption.attributes.value.label || designoption.attributes.value.internalid
					doJSON = JSON.parse(doJSON);
					var lfab = _.find(doJSON,function(b){return b.name == 'li-bl-o';});
					if(lfab && r.test(jQuery(lfab.value))){
						var found = _.find(self.liningfabrics,function(d){
							return d.custrecord_flf_ftcode == lfab.value;
							});
						if(!found || found.custrecord_flf_ftstatustext == "Out of Stock" || found.custrecord_flf_ftstatustext == "Temp Soldout" || found.custrecord_flf_ftstatustext == "Soldout"){
							jQuery(".alert-placeholder-class-" + line.get('internalid')).append("<div class='alert alert-danger alert-dismissible fade in'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>Lining fabric is out of stock.</div>");  //01/08/2019 Saad
							hasError = true;
						}else{

						}
					}
					var lfab = _.find(doJSON,function(b){return b.name == 'T010415';});
					if(lfab && r.test(jQuery(lfab.value))){
						var found = _.find(self.liningfabrics,function(d){
							return d.custrecord_flf_ftcode == lfab.value;
							});
						if(!found || found.custrecord_flf_ftstatustext == "Out of Stock" || found.custrecord_flf_ftstatustext == "Temp Soldout" || found.custrecord_flf_ftstatustext == "Soldout"){
							jQuery(".alert-placeholder-class-" + line.get('internalid')).append("<div class='alert alert-danger alert-dismissible fade in'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>Interior pocket piping is out of stock.</div>");  //01/08/2019 Saad
							hasError = true;
						}else{

						}
					}
				}

				//Ladies Jacket
				var designoption = _.find(itemoptions.models,function(op){return op.attributes.cartOptionId == 'custcol_designoptions_ladiesjacket'});
				if(designoption){
					var doJSON = designoption.attributes.value.label || designoption.attributes.value.internalid
					doJSON = JSON.parse(doJSON);
					//Jacket
					var lfab = _.find(doJSON,function(b){return b.name == 'li-b-lj';});
					if(lfab && r.test(jQuery(lfab.value))){
						var found = _.find(self.liningfabrics,function(d){
							return d.custrecord_flf_ftcode == lfab.value;
							});
						if(!found || found.custrecord_flf_ftstatustext == "Out of Stock" || found.custrecord_flf_ftstatustext == "Temp Soldout" || found.custrecord_flf_ftstatustext == "Soldout"){
							jQuery(".alert-placeholder-class-" + line.get('internalid')).append("<div class='alert alert-danger alert-dismissible fade in'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>Lining fabric is out of stock.</div>");  //01/08/2019 Saad
							hasError = true;
						}else{

						}
					}
					var lfab = _.find(doJSON,function(b){return b.name == 'T027230';});
					if(lfab && r.test(jQuery(lfab.value))){
						var found = _.find(self.liningfabrics,function(d){
							return d.custrecord_flf_ftcode == lfab.value;
							});
						if(!found || found.custrecord_flf_ftstatustext == "Out of Stock" || found.custrecord_flf_ftstatustext == "Temp Soldout" || found.custrecord_flf_ftstatustext == "Soldout"){
							jQuery(".alert-placeholder-class-" + line.get('internalid')).append("<div class='alert alert-danger alert-dismissible fade in'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>Interior pocket lining is out of stock.</div>");  //01/08/2019 Saad
							hasError = true;
						}else{

						}
					}
				}
				//Trenchcoat
				var designoption = _.find(itemoptions.models,function(op){return op.attributes.cartOptionId == 'custcol_designoptions_trenchcoat'});

				if(designoption){
					var doJSON = designoption.attributes.value.label || designoption.attributes.value.internalid
					doJSON = JSON.parse(doJSON);
					var lfab = _.find(doJSON,function(b){return b.name == 'li-bl-tc';});
					if(lfab && r.test(jQuery(lfab.value))){
						var found = _.find(self.liningfabrics,function(d){
							return d.custrecord_flf_ftcode == lfab.value;
							});
						if(!found || found.custrecord_flf_ftstatustext == "Out of Stock" || found.custrecord_flf_ftstatustext == "Temp Soldout" || found.custrecord_flf_ftstatustext == "Soldout"){
							jQuery(".alert-placeholder-class-" + line.get('internalid')).append("<div class='alert alert-danger alert-dismissible fade in'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>Lining fabric is out of stock.</div>");  //01/08/2019 Saad
							hasError = true;
						}else{

						}
					}
				}

				// //Checking for Vendor Picked is Jerome Clothiers
				if(line.get('item').get('internalid')== '253776'){
					var options = line.get('item').get('options');
					if(options){
						var b = _.find(options.models,function(op){return op.attributes.cartOptionId == 'custcol_vendorpicked'});
						if(b.attributes.value){
							var vendorPicked = b.attributes.value.label || designoption.attributes.value.internalid
							if(vendorPicked == '11'){
								hasError = true;
								jQuery(".alert-placeholder-class-" + line.get('internalid')).append("<div class='alert alert-danger alert-dismissible fade in'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>You cannot process a CMT item for the fabric vendor Jerome Clothiers. Please search for the specific item code that you require, or contact your account manager.</div>");  //01/08/2019 Saad
							}

						}
					}
				}

				//End Checking for Vendor Picked Jerome Clothiers
				//Checking for Out of Stock items
				if(line.get('item').get('_outOfStockMessage') && (line.get('item').get('_outOfStockMessage') == "Out of Stock" || line.get('item').get('_outOfStockMessage') == "Soldout" || line.get('item').get('_outOfStockMessage') == "Temp Soldout")){
					jQuery(".alert-placeholder-class-" + line.get('internalid')).append("<div class='alert alert-danger alert-dismissible fade in'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>You cannot process an item that is out of stock.</div>");  //01/08/2019 Saad
					hasError = true;
				}
				//End Checking Out of stock items
				var itemid = line.get('item').id;
				var item = line.get('item');

				//JHD-8 Start
				var tempDateExpected = jQuery('#expected-date-' + line.get('internalid')).text();
				var tempDateNeeded = jQuery('#custcol_avt_date_needed_' + line.get('internalid')).val();
				var dateExpected = new Date(tempDateExpected);
				var dateNeeded = new Date(tempDateNeeded);
				if (dateNeeded < dateExpected) {
					hasError = true;
					jQuery(".alert-placeholder-class-" + line.get('internalid')).append("<div class='alert alert-danger alert-dismissible fade in'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>You cannot process an item where the date needed is earlier than the expected delivery date.</div>");  //01/08/2019 Saad
				}
				//JHD-8 End

			    // //NOTE: Attributes to compare are _sku and _name, Display error message if different code inside the ()
				var orderItemCode = item.get('_name');
				var itemCode = item.get('_sku');

				var index1 = orderItemCode.indexOf('(');
				var index2 = orderItemCode.indexOf(')');
				orderItemCode = orderItemCode.substring(index1-1,index2);

				var index3 = itemCode.indexOf('(');
				var index4 = itemCode.indexOf(')');
				itemCode = itemCode.substring(index3-1,index4);

				var errorMessages = [];

				if(orderItemCode!==itemCode && line.get('item').get('internalid') != '253776'){
				// 	hasError = true;
				// errorMessages.push('Order Item Code is not the same with the SKU Item Code');

					jQuery(".alert-placeholder-class-" + line.get('internalid')).append("<div class='alert alert-danger alert-dismissible fade in'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>Item name is different to SKU.</div>");  //01/08/2019 Saad
				}

				var tempCheckForClientId = _.find(itemoptions.models,function(op){return op.attributes.cartOptionId == 'custcol_tailor_client'});
				var forCheckClientId = '';
				if(tempCheckForClientId && tempCheckForClientId.attributes.value){
					forCheckClientId = tempCheckForClientId ? tempCheckForClientId.attributes.value.label|| tempCheckForClientId.attributes.value.internalid : '';
				}

				if(forCheckClientId != previousClientId && previousClientId != ''){
					hasError = true;
					if(!differentClientIdError){
						differentClientIdError = true;
						jQuery(".alert-placeholder-class-" + line.get('internalid')).append("<div class='alert alert-danger alert-dismissible fade in'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>Items with different client names is not allowed.</div>");  //01/08/2019 Saad
					}
				}else{
					previousClientId = forCheckClientId;
				}
				var tempFpSummary = _.find(itemoptions.models,function(op){return op.attributes.cartOptionId == 'custcol_fitprofile_summary'});
				if(tempFpSummary.attributes.value){
					var fpSummary = tempFpSummary ? tempFpSummary.attributes.value.label|| tempFpSummary.attributes.value.internalid : '';
				}
				var fpSummaryJSON = fpSummary ? JSON.parse(fpSummary) : [];

				if(fpSummaryJSON.length > 0){
					if(fpSummaryJSON[0].name == 'Shirt' && fpSummaryJSON[0].type == 'Body'){
						var shirtProfile = '';
						for(var i = 0; i < line.get('options').models.length; i++){
							if(line.get('options').models[i].attributes.cartOptionId == "custcol_fitprofile_shirt"){
								shirtProfile = line.get('options').models[i].attributes.value.label || line.get('options').models[i].attributes.value.internalid
								break;
							}
						}

						if(shirtProfile){
							var shirtProfileJSON = JSON.parse(shirtProfile);
							var flength = _.where(shirtProfileJSON,{name: 'Front-Length'});
							if(!flength || flength.length==0 || flength[0].value == '0'){
								hasError = true;
								jQuery(".alert-placeholder-class-" + line.get('internalid')).append("<div class='alert alert-danger alert-dismissible fade in'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>Please update shirt fit profile to include front length measurement.</div>");  //01/08/2019 Saad
							}
						}
					}

				}
				if(itemoptions.length > 0){
					for(var i=0;i<line.get('options').models.length;i++){

						if(line.get('options').models[i].attributes.cartOptionId == "custcol_avt_date_needed"){
							if(line.get('options').models[i].attributes.value.label == '1/1/1900' || line.get('options').models[i].attributes.value.internalid == '1/1/1900'){
									hasError = true;
									jQuery(".alert-placeholder-class-" + line.get('internalid')).append("<div class='alert alert-danger alert-dismissible fade in'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>Date Needed is Required.</div>");  //01/08/2019 Saad
									break;
							}
						}
					}
				}
				//13/11/2019 Umar Zulfiqar {RFQ: Add Alert for Items that have no fit profile} -Start-
				if(_.isEmpty(fpSummaryJSON)){
					hasError = true;
					jQuery(".alert-placeholder-class-" + line.get('internalid')).append("<div class='alert alert-danger alert-dismissible fade in'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>Items cannot be processed without fit profiles.</div>");
				}//-End-

				previousLineInternalId = line.get('internalid');
			});
			if(hasError){
				return false;
			} else{
				window.location.href = Session.get('touchpoints.checkout');
			}
		}
		//@method getUrlLogin
		//@return {String}
	,	getUrlLogin: function getUrlLogin ()
		{
			var login = Session.get('touchpoints.login'),
				currentTouchpoint = this.model.application && this.model.application.Configuration.currentTouchpoint ? this.model.application.Configuration.currentTouchpoint : 'home';

			login += '&origin=' + currentTouchpoint;

			if (this.$el.closest('.modal-product-detail').length > 0) //we are in the quick view
			{
				var hashtag = this.$el.closest('.modal-product-detail').find('[data-name="view-full-details"]').data('hashtag');
				login += '&origin_hash=' + encodeURIComponent(hashtag.replace('#/', ''));
			}
			else
			{
				login += '&origin_hash=' + encodeURIComponent(Backbone.history.fragment);
			}

			return login;
		}

	,	getCustomPriceTotal: function()
		{
			var lineTotal = 0;
			var linesModels = this.model.get('lines').models;
			if(linesModels.length > 0) {
				for(var i = 0; i < linesModels.length; i++){
					var lineOptions = linesModels[i].attributes.options;
					lineOptions = lineOptions.models
					for(var j = 0; j < lineOptions.length; j++){
						if(lineOptions[j].attributes.cartOptionId == "custcol_order_list_line_item_total"){
							var tempValue = lineOptions[j].attributes.value.label || lineOptions[j].attributes.value.internalid
							if(tempValue){
								lineTotal += parseFloat(tempValue);
							}
						}
					}
				}
			}

			return lineTotal;
		}

		// @method getContext
		// @return {Cart.Summary.View.Context}
	,	getContext: function getContext ()
		{
			var	continueURL = Configuration.get('siteSettings.sitetype') === 'ADVANCED' ? Configuration.defaultSearchUrl : ''
			,	is_wsdk = false
			,	summary = this.model.get('summary')
			,	items_count = _.reduce(this.model.get('lines').pluck('quantity'), function (memo, quantity)
				{
					return memo + (parseFloat(quantity) || 1);
				}, 0)
			,	shipping_address = this.model.get('addresses').get(this.model.get('shipaddress')) || new Backbone.Model()
			,	default_country = shipping_address.get('country') || Configuration.get('siteSettings.defaultshipcountry')
			,	shipping_zip_code = shipping_address.get('zip')
			,	promocodes = this.model.get('promocodes') || []
			,	promocodes_applied = _.filter(promocodes, function(promo)
			{
				return ((promo.isautoapplied == true) && (promo.isvalid == true)) || (promo.isautoapplied == false);
			})
			,	gift_certificates = this.model.get('paymentmethods').where({type: 'giftcertificate'}) || []
			,	is_single_country = _.size(Configuration.get('siteSettings.countries', [])) === 1
			,	is_zipcode_require
			,	selected_country
			,	countries_list
			,	is_estimated_shipping_valid
			,	show_estimation_form = true
			,	countries = _.clone(Configuration.get('siteSettings.countries'));

			//Determine if the Zip Code is required and just leave selected the current address
			if (countries && default_country && countries[default_country])
			{
				selected_country = _.findWhere(countries, {selected:true});
				if (selected_country)
				{
					selected_country.selected = false;
				}

				countries[default_country].selected = true;
				is_zipcode_require = countries[default_country].isziprequired !== 'F';
				selected_country = countries[default_country];
				countries_list = _.toArray(countries);
			}
			else
			{
				selected_country = _.findWhere(countries, {selected:true});
				countries_list = _.toArray(countries);

				if (!selected_country)
				{
					selected_country = _.first(countries_list);
				}
				is_zipcode_require = selected_country.isziprequired !== 'F';
			}

			//Determine if the current address is valid (complete)
			if (_.isString(shipping_address.id) && shipping_address.id !== '-------null')
			{
				is_estimated_shipping_valid = is_zipcode_require ? !!shipping_zip_code : !!shipping_address.get('country');
			}
			else
			{
				is_estimated_shipping_valid = false;
			}

			//Check if WSDK is configured
			if (Configuration.get('siteSettings.iswsdk', false) && Configuration.get('siteSettings.wsdkcancelcarturl'))
			{
				continueURL = Configuration.get('siteSettings.wsdkcancelcarturl');
				is_wsdk = true;
			}

			//Calculate if the estimation form should be rendered or not
			if (is_estimated_shipping_valid && is_zipcode_require)
			{
				show_estimation_form = false;
			}
			else if (is_estimated_shipping_valid)
			{
				show_estimation_form = !this.options.showEstimated;
			}
			else
			{
				show_estimation_form = true;
			}

			var linesTotal = this.getCustomPriceTotal();
			// @class Cart.Summary.View.Context
			return {
					// @property {LiveOrder.Model} model
					model: this.model
					// @property {Boolean} isWSDK
				,	isWSDK: is_wsdk
					// @property {String} continueURL
				,	continueURL: continueURL
					// @property {Boolean} showActions
				,	showActions: true
					// @property {Boolean} showLabelsAsEstimated
				,	showLabelsAsEstimated: true
					// @property {Object} summary
				,	summary: summary
					// @property {Number} itemCount
				,	itemCount: items_count
					// @property {Boolean} isSingleItem
				,	isSingleItem: items_count === 1
					// @property {Boolean} isZipCodeRequire
				,	isZipCodeRequire: is_zipcode_require
					// @property {Boolean} showEstimate Shows or not the estimation form
				,	showEstimate: show_estimation_form
					// @property {Boolean} showHandlingCost
				,	showHandlingCost: !!summary.handlingcost
					// @property {Boolean} showGiftCertificates
				,	showGiftCertificates: !!summary.giftcertapplied
					// @property {Boolean} showPromocodeForm
				,	showPromocodeForm: Configuration.get('promocodes.allowMultiples', true) || !promocodes_applied.length
					// @property {Array} giftCertificates
				,	giftCertificates: gift_certificates
					// @property {Boolean} showDiscountTotal
				,	showDiscountTotal: !!summary.discounttotal
					// @property {String} defaultCountry
				,	defaultCountry: default_country
					// @property {Boolean} isDefaultCountryUS
				,	isDefaultCountryUS: default_country === 'US'
					// @property {Array} countries
				,	countries: countries_list
					// @property {Boolean} singleCountry
				,	singleCountry: is_single_country
					// @property {String} singleCountryCode
				,	singleCountryCode: is_single_country ? countries_list[0].code : ''
					// @property {String} shipToText
				,	shipToText: shipping_zip_code || selected_country.name
					// @property {String} singleCountryName
				,	singleCountryName: is_single_country ? countries_list[0].name : ''
					// @property {String} shippingZipCode
				,	shippingZipCode: shipping_zip_code || ''
					// @property {Boolean} showPaypalButton
				,	showPaypalButton: Configuration.get('siteSettings.checkout.paypalexpress.available', 'F') === 'T'
					// @property {String} paypalButtonImageUrl
				,	paypalButtonImageUrl: Configuration.get('paypalButtonImageUrl', 'https://www.paypalobjects.com/webstatic/en_US/i/buttons/checkout-logo-large.png')
					// @property {Boolean} showProceedButton
                ,   showProceedButton: Configuration.get('siteSettings.sitetype') === 'STANDARD'
					// @property {String} urlLogin
				,	urlLogin: this.getUrlLogin()
                	// @property {Boolean} isPriceEnabled
				,	isPriceEnabled: !ProfileModel.getInstance().hidePrices()
					// @property {Boolean} showPickupInStoreLabel
				,	showPickupInStoreLabel: this.model.getPickupInStoreLines().length > 0
					// @property {Boolean} areAllItemsPickupable
				,	areAllItemsPickupable: this.model.getPickupInStoreLines().length === this.model.get('lines').length
					// @property {String} summaryLabel
				,	taxLabel: !!Configuration.get('summaryTaxLabel') ? Configuration.get('summaryTaxLabel') : 'Tax'
				,	linesTotal : (linesTotal != 0) ? linesTotal : false
				,	currencSymbol: SC.ENVIRONMENT.currentCurrency.symbol ? SC.ENVIRONMENT.currentCurrency.symbol : '$'
			};
			// @class Cart.Summary.View
		}
	});

});
