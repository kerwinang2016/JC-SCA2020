/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Profile
define(
	'Profile.Model', [
		'Address.Collection', 'SC.Configuration', 'PaymentMethod.Collection', 'Singleton', 'underscore', 'jQuery', 'Backbone', 'bignumber', 'Utils', 'Client.Collection', 'Profile.Collection'
	],
	function (
		AddressCollection, Configuration, PaymentMethodCollection, Singleton, _, jQuery, Backbone, BigNumber, Utils, ClientCollection, ProfileCollection
	) {
		'use strict';

		var classProperties = _.extend({
				// @method getPromise
				// @static
				// @return {jQuery.Deferred}
				getPromise: function () {
					var self = this;

					if (!SC.PROFILE_PROMISE) {
						SC.PROFILE_PROMISE = jQuery.Deferred().done(function (profile) {
							delete SC.ENVIRONMENT.PROFILE;
							self.getInstance().set(profile);
						});
					}

					// if the user.env has already loaded, resolve the profile promise if not already resolved
					if (SC.ENVIRONMENT.PROFILE && SC.PROFILE_PROMISE.state() !== 'resolved') {
						SC.PROFILE_PROMISE.resolve(SC.ENVIRONMENT.PROFILE);
					}

					return SC.PROFILE_PROMISE;
				}
			}, Singleton)

			//@class Profile.Model @extend Backbone.Model
			,
			ProfileModel = Backbone.Model.extend({
				client_collection: new ClientCollection(),
				profile_collection: null,
				validation: {
					firstname: {
						required: true,
						msg: _('First Name is required').translate()
					}

					// This code is commented temporally, because of the inconsistence between Checkout and My Account regarding the require data from profile information (Checkout can miss last name)
					,
					lastname: {
						required: true,
						msg: _('Last Name is required').translate()
					}

					,
					email: {
						required: true,
						pattern: 'email',
						msg: _('Valid Email is required').translate()
					},
					phone: {
						required: true,
						fn: Utils.validatePhone
					}

					,
					companyname: {
						required: function isCompanyRequired() {
							return Configuration.get('siteSettings.registration.companyfieldmandatory', 'F') === 'T';
						},
						msg: _('Company Name is required').translate()
					}

					// if the user wants to change its email we need ask for confirmation and current password.
					// We leave this validation in this model, instead of creating a new one like UpdatePassword, because
					// the email is updated in the same window than the rest of the attributes
					,
					confirm_email: function (confirm_email, attr, form) {
							if (Utils.trim(form.email) !== this.attributes.email && Utils.trim(confirm_email) !== Utils.trim(form.email)) {
								return _('Emails do not match').translate();
							}
						}

						,
					current_password: function (current_password, attr, form) {
						if (Utils.trim(form.email) !== this.attributes.email && (_.isNull(current_password) || _.isUndefined(current_password) || (_.isString(current_password) && Utils.trim(current_password) === ''))) {
							return _('Current password is required').translate();
						}
					}
				}

				,
				urlRoot: 'services/Profile.Service.ss'

					// ,	setclient: function(field,model,model2)
					// {
					// 	if(field != "custrecord_tc_tailor"){
					//         if(field == "state"){
					//             model.set("custrecord_tc_state", jQuery("[name=" + field + "]").val());
					//         } else if(field == "country"){
					//             model.set("custrecord_tc_country", jQuery("[name=" + field + "]").val());
					//         } else {
					//             model.set(field, jQuery("[name=" + field + "]").val());
					//             if(model2){
					//                model2.set(field, jQuery("[name=" + field + "]").val());
					//             }
					//         }

					//     }
					// }

					,
				initialize: function initialize(attributes) {

						var self = this;
						this.set('swx_order_client_name', '');
						this.set('swx_order_client_email', '');
						this.set('swx_order_client_phone', '');
						this.set('swx_selected_client_id', '');
						this.set('swx_is_display_client_details', '');
						this.set('swx_client_profile_order_history', '');
						this.set('options_config', '');

						this.set('swx_client_profile_order_history', '');

						this.set("current_client", null);

						if (typeof this.attributes.selectedClientIdValue != "undefined") {

							var selectedClientIdValue = this.attributes.selectedClientIdValue;

							this.set('swx_selected_client_id', selectedClientIdValue);

						}

						if (typeof this.attributes.fit != "undefined") {

							var fitarray = this.attributes.fit;
							this.set('swx_order_client_name', fitarray[0]);
							this.set('swx_order_client_email', fitarray[1]);
							this.set('swx_order_client_phone', fitarray[2]);
							this.set('swx_is_display_client_details', '');

						}

						var dateRef = new Date();
						var urlDesignOptions = Utils.getAbsoluteUrl('javascript/DesignOptions_Config.json') + '?t=' + dateRef.getTime();

						jQuery.get(urlDesignOptions).done(function (data) {
							var options_config = data;
							self.set('options_config', options_config);
						});

						if (typeof this.attributes.tailor != "undefined") {
							var tailor = this.attributes.tailor;

							this.set('custrecord_tc_tailor', tailor);
						}

						if (typeof this.attributes.field != "undefined") {

							var field = this.attributes.field;
							var model = this.attributes.model;
							var model2 = this.attributes.model2;

							if (field != "custrecord_tc_tailor") {
								if (field == "state") {
									this.set("custrecord_tc_state", jQuery("[name=" + field + "]").val());
								} else if (field == "country") {
									this.set("custrecord_tc_country", jQuery("[name=" + field + "]").val());
								} else {
									this.set(field, jQuery("[name=" + field + "]").val());
									if (model2) {
										this.model2.set(field, jQuery("[name=" + field + "]").val());
									}
								}

							}

						}

						this.on('change:addresses', function () {
							this.get('addresses').on('change:defaultshipping change:defaultbilling add destroy reset', this.checkDefaultsAddresses, this);
						});

						this.on('change:balance', function (model) {
							if (_.isNumber(model.get('creditlimit')) && _.isNumber(model.get('balance'))) {
								var balance_available;

								if (typeof BigNumber !== 'undefined') {
									balance_available = new BigNumber(model.get('creditlimit')).minus(model.get('balance'));
								} else {
									balance_available = model.get('creditlimit') - model.get('balance');
								}

								model.set('balance_available', balance_available);
								model.set('balance_available_formatted', Utils.formatCurrency(balance_available));
							}
						});

						this.set('addresses', attributes && attributes.addresses || new AddressCollection());
						this.set('paymentmethods', attributes && attributes.paymentmethods || new PaymentMethodCollection());

						this.on('change:paymentmethods', function (model, paymentmethods) {
							model.set('paymentmethods', new PaymentMethodCollection(paymentmethods), {
								silent: true
							});
							this.get('paymentmethods').on('change:ccdefault add destroy reset', this.checkDefaultsCreditCard, this);
						});
					}

					// @method checkDefaultsAddresses
					// @param {Profile.Model} model
					// @return {Void}
					,
				checkDefaultsAddresses: function checkDefaultsAddresses(model) {
						var addresses = this.get('addresses'),
							Model = addresses.model;

						if (model instanceof Model) {
							// if the created/modified address is set as default for shipping we set every other one as not default
							if (model.get('defaultshipping') === 'T') {
								_.each(addresses.where({
									defaultshipping: 'T'
								}), function (address) {
									if (model !== address) {
										address.set({
											defaultshipping: 'F'
										}, {
											silent: true
										});
									}
								});
							}

							// if the created/modified address is set as default for billing we set every other one as not default
							if (model.get('defaultbilling') === 'T') {
								_.each(addresses.where({
									defaultbilling: 'T'
								}), function (address) {
									if (model !== address) {
										address.set({
											defaultbilling: 'F'
										}, {
											silent: true
										});
									}
								});
							}
						}
					}

					,
				removeRec: function (type, id) {

						var self = this;
						if (type && id) {
							var param = new Object();
							param.type = "remove_" + type;
							param.id = id;
							var currentModel = self[type + "_collection"].find(function (data) {
								return data.get("internalid") == id;
							})

							this.set("current_" + type, "");

							Utils.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "GET", param).always(function (data) {
								var responseData = JSON.parse(data)
								if (responseData.status) {
									self[type + "_collection"].remove(currentModel);
									self.trigger("afterRemoveRec");
								}else{
									jQuery( ".show-remove-error-fitprofile" ).empty();
									jQuery( ".show-remove-error-fitprofile" ).html( "<div class='alert alert-danger alert-dismissible fade in'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>"+responseData.message+"</div>" );
								}
							})
						}
					}

					// @method checkDefaultsCreditCard
					// @param {Profile.Model} model
					// @return {Void}
					,
				checkDefaultsCreditCard: function (model) {
						var creditcards = this.get('paymentmethods'),
							Model = creditcards.model;

						// if the created/modified card is set as default we set every other card as not default
						if (model.get('ccdefault') === 'T') {
							_.each(creditcards.where({
								ccdefault: 'T'
							}), function (creditCard) {
								if (creditCard && model !== creditCard) {
									creditCard.set({
										ccdefault: 'F'
									}, {
										silent: true
									});
								}
							});
						}

						var default_creditcard = creditcards.find(function (model) {
							return model.get('ccdefault') === 'T';
						});

						// set the default card in the collection as the profile's default card
						this.set('defaultCreditCard', default_creditcard || new Model({
							ccdefault: 'T'
						}));
					}

					// @method getSearchApiUrl
					// @return {String}
					,
					getSearchApiUrl: function () {
						//We've got to disable passwordProtectedSite and loginToSeePrices features if customer registration is disabled.

						if (Configuration.getRegistrationType() !== 'disabled' &&
							(Configuration.get('siteSettings.requireloginforpricing', 'F') === 'T' || Configuration.get('siteSettings.siteloginrequired', 'F') === 'T') &&
							this.get('isLoggedIn') === 'T') {
							return Utils.getAbsoluteUrl('searchApi.ssp');
						}

						return '/api/items';
					}

					// @method isAvoidingDoubleRedirect
					// @return {Boolean}
					,
					isAvoidingDoubleRedirect: function () {
						//We've got to disable passwordProtectedSite and loginToSeePrices features if customer registration is disabled.
						return Configuration.getRegistrationType() !== 'disabled' &&
							(Configuration.get('siteSettings.requireloginforpricing', 'F') === 'T' || Configuration.get('siteSettings.siteloginrequired', 'F') === 'T') &&
							this.get('isLoggedIn') === 'T';
					}

					// @method hidePrices Determines -when LoginToSeePrices feature is enabled- if the prices should be hidden.
					// @return {Boolean}
					,
				hidePrices: function () {
					//We've got to disable loginToSeePrices feature if customer registration is disabled.
					return Configuration.getRegistrationType() !== 'disabled' &&
						Configuration.get('siteSettings.requireloginforpricing', 'F') === 'T' &&
						this.get('isLoggedIn') !== 'T';
				},
				set: function (key, val, options) {
					//If the addresses attribute is not an instance of AddressCollection, will be converted into one.
					// attributes both `"key", value` and `{key: value}` -style arguments.
					var attributes = {};
					if (typeof key === 'object') {
						attributes = key;
						options = val;
					} else {
						attributes[key] = val;
					}
					if (attributes.addresses && !(attributes.addresses instanceof AddressCollection)) {
						attributes.addresses = new AddressCollection(attributes.addresses);
					}

					return Backbone.Model.prototype.set.call(this, attributes, options);
				}
			}, classProperties);
		return ProfileModel;
	});
