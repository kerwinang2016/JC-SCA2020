/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module ProductDetails
define(
	'ProductDetails.Base.View'
,	[
		'Backbone.FormView'

	,	'GlobalViews.Message.View'

	,	'Cart.AddToCart.Button.View'

	,	'ProductLine.Stock.View'
	,	'ProductViews.Price.View'
	,	'ProductLine.Sku.View'

	,	'ProductDetails.Options.Selector.View'
	,	'ProductDetails.Information.View'
	,	'ProductDetails.Quantity.View'
	,	'ProductDetails.ImageGallery.View'
	,	'ProductDetails.AddToProductList.View'
	,	'ProductLine.StockDescription.View'

	,	'Profile.Model'
	,	'Tracker'
	,	'AjaxRequestsKiller'

	,	'SC.Configuration'
	,	'Backbone.CompositeView'
	,	'Backbone.Validation.callbacks'
	,	'RecentlyViewedItems.Collection'

	,	'Utils'

	,	'Backbone'
	,	'jQuery'
	,	'underscore'
	,	'FitProfile.View'
	,	'Profile.View'
	,	'UrlHelper'
	,	'jQuery.scPush'
	]
,	function (
		BackboneFormView

	,	GlobalViewsMessageView

	,	CartAddToCartButtonView

	,	ProductLineStockView
	,	ProductViewsPriceView
	,	ProductLineSkuView

	,	ProductDetailsOptionsSelectorView
	,	ProductDetailsInformationView
	,	ProductDetailsQuantityView
	,	ProductDetailsImageGalleryView
	,	ProductDetailsAddToProductListView
	,	ProductLineStockDescriptionView

	,	ProfileModel
	,	Tracker
	,	AjaxRequestsKiller

	,	Configuration
	,	BackboneCompositeView
	,	BackboneValidationCallbacks
	,	RecentlyViewedItemsCollection

	,	Utils

	,	Backbone
	,	jQuery
	,	_
	,	FitProfileView
	,ProfileView
	)
{
	'use strict';

	//@class ProductDetails.Base.View Handles the PDP and quick view @extend Backbone.View
	var ProductDetailsBaseView = Backbone.View.extend(
		{
			//@property {String} title
			title: ''

			//@property {String} page_header
		,	page_header: ''

			//@property {String} modalClass
		,	modalClass: 'global-views-modal-large'

			//@property {Boolean} showModalPageHeader
		,	showModalPageHeader: false

		,	enhancedEcommercePage: true

			//@property {Object} baseEvents
		,	baseEvents: {
					'submit [data-action="submit-form"]': 'mainActionHandler'
				, 	'change #fabric-cmt-vendor': 'fabricVendorChange'
				,	'change .display-option-dropdown': 'propertyValueChange'  //15/07/2019 Saad
				//, 	'focus .display-option-dropdown': 'propertyValueChange'   // 27/08/2019 Saad
				,	'click .design-options-dropdown-on-click-set': 'showHideGroupedOptions'
			}

		,	bindings: {
				//set quantity
				'[name="quantity"]': {
					observe: 'quantity'
				,	setOptions: {
						validate: true
					,	silent: false
					}
				,	onSet: function (quantity_str)
					{
						return parseInt(quantity_str, 10);
					}
				,	events: ['blur', 'change']
				}
				//enable/disable minus mobile quantity button
			,	'[data-type="product-details-quantity-remove"]': {
					observe: 'quantity'
				,	update: function ($el, value)
					{
						return $el.attr('disabled', value <= 1);
					}
				}
			}

			//@method initialize
			//@param {ProductDetails.Base.View.Initialize.Options} options
			//@return {Void}
		,	initialize: function initialize (options)
			{
				this.cart = this.model.cart;
				this.profile_model = ProfileModel.getInstance();
				this.events = _.extend(this.events || {}, this.baseEvents);
				Backbone.View.prototype.initialize.apply(this, arguments);

				this.application = options.application;

				this.generateViewBindings();

				BackboneCompositeView.add(this);

				BackboneFormView.add(this, {
					noCloneModel: true
				});

				this.selectedLineObj = this.getSelectedLine(options);
				this.selectedLineData = '';
				this.optionsHolder = {};
				var self = this;
				if(this.selectedLineObj.productList){
					if(this.getSelectedLineData() == ''){
						var tempRecheck = setInterval(function(){
							var selectedLineAttributes = self.getSelectedLineData();
							if(selectedLineAttributes!=''){
								self.selectedLineData = selectedLineAttributes;
								self.setOptionsHolder();
								self.setExtraQuantity();
								self._render();
								clearInterval(tempRecheck);
							}
						}, 1000);
					}else{
						this.selectedLineData = this.getSelectedLineData();
						this.setOptionsHolder();
					}
				}
				// 27/08/2019 Saad
				jQuery.get(Utils.getAbsoluteUrl('services/liningfabrics.ss')).done(function (data) {
					self.liningfabrics = data;
				});
				//Here we wrap the areAttributesValid method of the transaction line so when child views or injected views validate the model using this method
				//this view is notified and can show the error messages.
				//This is thanks to the poor "API" Backbone.validation offer.
				this.model.areAttributesValid = _.wrap(this.model.areAttributesValid, function (fn, attributes, validators)
				{
					var are_attr_valid = fn.apply(self.model, [attributes, validators])
					,	current_validation = _.extend({}, self.model.validation)
					,	attribute_validation_result;

					_.extend(self.model.validation, validators);

					//In order to properly show the validation on message in the UI we need to validate against the temporal properties on the model
					//that are those binded to the template! (See method generateViewBindings)
					if (~_.indexOf(attributes, 'options'))
					{
						self.model.get('options').map(function (option)
						{
							attributes.push(option.get('cartOptionId'));
						});
					}

					_.each(attributes, function (attribute)
					{
						attribute_validation_result = self.model.preValidate(attribute, self.model.get(attribute));

						if (attribute_validation_result)
						{
							//Here we assume that the default selector 'name' is being used
							BackboneValidationCallbacks.invalid(self, attribute, attribute_validation_result, 'name');
						}
						else
						{
							BackboneValidationCallbacks.valid(self, attribute, 'name');
						}
					});

					self.model.validation = current_validation;

					return are_attr_valid;
				});

				if (ProductDetailsBaseView.mainActionView)
				{
					this.mainActionViewInstance = new ProductDetailsBaseView.mainActionView({
						application: this.options.application
					,	model: this.model
					});
				}
				this.setVendorDetails();
				this.setExtraQuantity();
				SC.sessioncheck();
			}

		,	setOptionsHolder: function()
			{
				var optionsArr = this.selectedLineData?this.selectedLineData.options.models:{};
				for(var i = 0; i < optionsArr.length; i++){
					this.optionsHolder[optionsArr[i].attributes.cartOptionId] = optionsArr[i].attributes.value.label || optionsArr[i].attributes.value.internalid;
				}
			}
		, 	getDesignOptions: function (clothingType)   //15/07/2019 Saad
			{
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

		, 	propertyValueChange: function (e) {   //15/07/2019 Saad    //27/08/2019 Saad
				e.preventDefault();
				var key = jQuery(e.target).val() + "|" + jQuery(e.target).attr("fieldname")
					, keyParent = jQuery(e.target).attr('id')
					, application = this.application
					, self = this;

				jQuery('#more-info_' + keyParent).html(Utils.displayMoreInfo(key));

				window.tempOptions = new Object();
				var values = new Object();
				var clothingTypes = this.model.get('custitem_clothing_type').split(', ');
				_.each(clothingTypes, function (clothingType, index) {
					var designOptions = self.getDesignOptions(clothingType);
					//var designOptions = self.getAvtDesignOptions(clothingType);
					_.each(designOptions, function (option) {
						values[option.name] = option.value
					})
				});
				window.tempOptions = values;
				var r = new RegExp(/^[TR]{2}\d{3}($|-+\w*)|^[TRR]{3}\d{3}($|-+\w*)|^[TRD]{3}\d{2}($|-+\w*)/);

				if(jQuery(e.target).attr("id") == 'li-b-j' || jQuery(e.target).attr("id") == 'T010227' || jQuery(e.target).attr("id") == 'T027230' || jQuery(e.target).attr("id") == 'li-bl-tc' ||jQuery(e.target).attr("id") == 'li-b-lj'||
				jQuery(e.target).attr("id") == 'li-bl-w' || jQuery(e.target).attr("id") == 'li-bl-o' || jQuery(e.target).attr("id") == 'T010415' ){
					if(r.test(jQuery(e.target).val())){
					var found = _.find(this.liningfabrics,function(d){
					  return d.custrecord_flf_ftcode == jQuery(e.target).val();
					  });
					if(!found || found.custrecord_flf_ftstatustext == "Out of Stock")
					{
					  jQuery(e.target).nextAll('#liningstatusimage').html('<img title="Out of Stock" src="http://store.jeromeclothiers.com/c.3857857/shopflow/img/red.png"/>')
					}else{
					  jQuery(e.target).nextAll('#liningstatusimage').html('<img title="Available" src="http://store.jeromeclothiers.com/c.3857857/shopflow/img/green.png"/>')
					}
				  }else{
					jQuery(e.target).nextAll('#liningstatusimage').html('');
				  }
				}

				this.showHideGroupedOptions();
				$('.profiles-options-shopflow').trigger("change");

				this.application.trigger('profileRefresh');
			}

		,	getSelectedLine: function(options)
			{
				var historyFragment = decodeURIComponent(Backbone.history.fragment);
				var client, productList, itemList, product;
				if (options.pList) {
					options.pList = decodeURIComponent(options.pList);
					 	client = options.pList.split("client=")[1].split("|")[0];
					if(options.pList.split('|').length >2)
						productList = options.pList.split("|")[1].split('|')[0];
					else {
						productList = options.pList.split("|")[1].split('&')[0];
					}
					itemList = options.pList.split("|")[2];
				} else {
					if(this.getClientId(historyFragment)){
						client = this.getClientId(historyFragment).split('|')[0]// || historyFragment.split("?")[1].split("client=")[1].split("&")[0] || null;
					 	productList = this.getClientId(historyFragment).split('|')[1];
						itemList = this.getClientId(historyFragment).split('|')[2];
					}
				}
				product = historyFragment.split("product=")[1];

				var selectedLineObj = {clientId: client, productList: productList, product: product};
				return selectedLineObj;
			}

		,	getSelectedLineData: function(productList)
			{
				var productList = this.selectedLineObj.productList;
				var selectedItem = _.find(this.cart.get('lines').models, function(model){
					return model.get('internalid') == productList;
				})
				return (selectedItem)?selectedItem.attributes:'';
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
			//@method mainActionHandler Handle the submit action
			//@param {jQuery.Event} e
			//@return {Boolean}
		,	mainActionHandler: function mainActionHandler (e)
			{
				if (ProductDetailsBaseView.mainActionView)
				{
					return this.mainActionViewInstance.submitHandler(e);
				}
				else
				{
					e.preventDefault();
					e.stopPropagation();
					return false;
				}
			}

		, fabricVendorChange: function(e)
			{
				if(jQuery(e.target).val() == '29')
				{
					jQuery('#fabric-cmt-othervendorname').parent().show();
				}else
				{
					jQuery('#fabric-cmt-othervendorname').parent().hide();
				}
			}

			//@method showContent Override default method to track current product, add product to viewed ones and start the pusher
			//@return {jQuery.Deferred}
		,	showContent: function showContent ()
			{
				var self = this;

				return Backbone.View.prototype.showContent.apply(this, arguments).done(function ()
				{
					Tracker.getInstance().trackProductView(self.model);

					RecentlyViewedItemsCollection.getInstance().addHistoryItem(self.model.get('item'));
					self.$('[data-action="pushable"]').scPush();
				});
			}

			//@method generateViewBindings Extend the bindings properties by adding all the bindings to all the temporal option properties
			//@return {Void}
		,	generateViewBindings: function generateViewBindings ()
			{
				var self = this
				,	option_bindings = self.model.get('options').reduce(function (bindings, option)
					{
						var cart_option_id = option.get('cartOptionId');

						//Bind to set options
						bindings['[name="' + cart_option_id + '"]'] = {
								observe: option.get('cartOptionId')		// << TEMP PROPERTY TO MAKE EASY VALIDATION (READ HERE)
							,	setOptions: {
									validate: true
								,	silent: true
								}
							,	onSet: function (value, options)
								{
									var view =  options.view
									,	product_model = view.model
									,	option = product_model.get('options').findWhere({cartOptionId: options.observe})
									,	current_value = option.get('value') && option.get('value').internalid;

									if (!option.get('isMandatory') && current_value === value && view.$(options.selector).attr('type') === 'radio')
									{
										// unset value.
										value = null;
									}

									product_model.setOption(options.observe, value);

									return value;
								}
							,	events: [self.getBindingEventForOption(option)]
						};

						//Binding for the label (selected value)
						bindings['[data-value="'+ cart_option_id +'"]'] = {
								observe: option.get('cartOptionId')
							,	onGet: function ()
								{
									return option.get('value') ? option.get('value').label : '';
								}
						};

						_.each(option.get('values'), function(value)
						{
							if (value.internalid) // Exclude the " - Select -" option
							{
								//Bind for mute and active options
								bindings['[data-label="label-' + cart_option_id + '"][value="' + value.internalid + '"]'] = {
									attributes: [{
										name: 'class'
									,	observe: option.get('cartOptionId')
									,	onGet: function ()
										{
											if (!_.findWhere(option.get('values'), {internalid: value.internalid}).isAvailable)
											{
												return 'muted';
											}
											else if (value.internalid === (option.get('value') && option.get('value').internalid))
											{
												return 'active';
											}
											else
											{
												return '';
											}
										}
									}]
								};
							}

						});

						return bindings;
					}, {});

				_.extend(this.bindings, option_bindings);
			}

		,   showHideGroupedOptions: function ()
			{
				if (jQuery('#T010622').val() == "Other") {
					jQuery('#T010622_other').parent().parent().show();
				} else {
					jQuery('#T010622_other').parent().parent().hide();
				}
				if (jQuery('#T010623').val() == "Other") {
					jQuery('#T010623_other').parent().parent().show();
				} else {
					jQuery('#T010623_other').parent().parent().hide();
				}
				if (jQuery('#T010624').val() == "Other") {
					jQuery('#T010624_other').parent().parent().show();
				} else {
					jQuery('#T010624_other').parent().parent().hide();
				}
				if (jQuery('#T010625').val() == "Other") {
					jQuery('#T010625_other').parent().parent().show();
				} else {
					jQuery('#T010625_other').parent().parent().hide();
				}
				if (jQuery('#T010626').val() == "Other") {
					jQuery('#T010626_other').parent().parent().show();
				} else {
					jQuery('#T010626_other').parent().parent().hide();
				}
				if (jQuery('#T010627').val() == "Other") {
					jQuery('#T010627_other').parent().parent().show();
				} else {
					jQuery('#T010627_other').parent().parent().hide();
				}
				if (jQuery('#T010628').val() == "Other") {
					jQuery('#T010628_other').parent().parent().show();
				} else {
					jQuery('#T010628_other').parent().parent().hide();
				}
				if (jQuery('#T010629').val() == "Other") {
					jQuery('#T010629_other').parent().parent().show();
				} else {
					jQuery('#T010629_other').parent().parent().hide();
				}
				if (jQuery('#T010630').val() == "Other") {
					jQuery('#T010630_other').parent().parent().show();
				} else {
					jQuery('#T010630_other').parent().parent().hide();
				}
				if (jQuery('#T010631').val() == "Other") {
					jQuery('#T010631_other').parent().parent().show();
				} else {
					jQuery('#T010631_other').parent().parent().hide();
				}
				if (jQuery('#T010632').val() == "Other") {
					jQuery('#T010632_other').parent().parent().show();
				} else {
					jQuery('#T010632_other').parent().parent().hide();
				}

				if (jQuery('#T010257').val() == "T01025702") {

					jQuery('#T010258').val('');
					jQuery('#T010259').val('NA');

					jQuery('#T010258').parent().parent().hide();
					jQuery('#T010259').parent().parent().hide();
				} else {
					jQuery('#T010258').parent().parent().show();
					jQuery('#T010259').parent().parent().show();
				}
				if (jQuery('#T010643').val() == "T01064302") {
					jQuery('#T010644').val('');
					jQuery('#T010644').parent().parent().hide();
					jQuery('#T010645').val('');
					jQuery('#T010645').parent().parent().hide();
				} else {
					jQuery('#T010644').parent().parent().show();
					jQuery('#T010645').parent().parent().show();
				}
				// if(jQuery(e.target).attr("id") == 'T010243'){
				if (jQuery('#T010243').val() == 'T01024302') {
					//hide stuff
					jQuery('#T010235').parent().parent().hide();
					jQuery('#T010235').val('NA');
					jQuery('#T010236').parent().parent().hide();
					jQuery('#T010236').val('NA');
					jQuery('#T010238').parent().parent().hide();
					jQuery('#T010238').val('');
				} else {
					//show
					jQuery('#T010235').parent().parent().show();
					jQuery('#T010236').parent().parent().show();
					jQuery('#T010238').parent().parent().show();
				}
				// }
				// else if(jQuery(e.target).attr("id") == 'T010244'){
				if (jQuery('#T010244').val() == 'T01024402') {
					//hide stuff
					jQuery('#T010245').parent().parent().hide();
					jQuery('#T010245').val('NA');
					jQuery('#T010237').parent().parent().hide();
					jQuery('#T010237').val('NA');
					jQuery('#T010239').parent().parent().hide();
					jQuery('#T010239').val('');
					jQuery('#T010240').parent().parent().hide();
					jQuery('#T010240').val('');
					jQuery('#T010250').parent().parent().hide();
					jQuery('#T010250').val('');
				} else {
					//show
					jQuery('#T010245').parent().parent().show();
					jQuery('#T010237').parent().parent().show();
					jQuery('#T010239').parent().parent().show();
					jQuery('#T010240').parent().parent().show();
					jQuery('#T010250').parent().parent().show();
				}
				// }
				// else if(jQuery(e.target).attr("id") == 'T010522'){
				if (jQuery('#T010522').val() == 'T01052202') {
					//hide stuff
					jQuery('#T010523').parent().parent().hide();
					jQuery('#T010523').val('NA');
					jQuery('#T010524').parent().parent().hide();
					jQuery('#T010524').val('NA');
					jQuery('#T010525').parent().parent().hide();
					jQuery('#T010525').val('');
				} else {
					//show
					jQuery('#T010523').parent().parent().show();
					jQuery('#T010524').parent().parent().show();
					jQuery('#T010525').parent().parent().show();
				}
				// }
				// else if(jQuery(e.target).attr("id") == 'T010419'){
				if (jQuery('#T010419').val() == 'T01041902') {
					//hide stuff
					jQuery('#T010420').parent().parent().hide();
					jQuery('#T010420').val('NA');
					jQuery('#T010421').parent().parent().hide();
					jQuery('#T010421').val('NA');
					jQuery('#T010422').parent().parent().hide();
					jQuery('#T010422').val('');
				} else {
					//show
					jQuery('#T010420').parent().parent().show();
					jQuery('#T010421').parent().parent().show();
					jQuery('#T010422').parent().parent().show();
				}
				// }
				// else if(jQuery(e.target).attr("id") == 'T010423'){
				if (jQuery('#T010423').val() == 'T01042302') {
					//hide stuff
					jQuery('#T010424').parent().parent().hide();
					jQuery('#T010424').val('NA');
					jQuery('#T010425').parent().parent().hide();
					jQuery('#T010425').val('NA');
					jQuery('#T010426').parent().parent().hide();
					jQuery('#T010426').val('NA');
					jQuery('#T010427').parent().parent().hide();
					jQuery('#T010427').val('');
					jQuery('#T010428').parent().parent().hide();
					jQuery('#T010428').val('');
				} else {
					//show
					jQuery('#T010424').parent().parent().show();
					jQuery('#T010425').parent().parent().show();
					jQuery('#T010426').parent().parent().show();
					jQuery('#T010427').parent().parent().show();
					jQuery('#T010428').parent().parent().show();
				}
				// }
				// else if(jQuery(e.target).attr("id") == 'T010633'){
				if (jQuery('#T010633').val() == 'T01063302') {
					//hide stuff
					jQuery('#T010634').parent().parent().hide();
					jQuery('#T010634').val('');
					jQuery('#T010635').parent().parent().hide();
					jQuery('#T010635').val('NA');
					jQuery('#T010636').parent().parent().hide();
					jQuery('#T010636').val('NA');
					jQuery('#T010637').parent().parent().hide();
					jQuery('#T010637').val('NA');
					jQuery('#T010638').parent().parent().hide();
					jQuery('#T010638').val('NA');
				} else {
					//show
					jQuery('#T010634').parent().parent().show();
					jQuery('#T010635').parent().parent().show();
					jQuery('#T010636').parent().parent().show();
					jQuery('#T010637').parent().parent().show();
					jQuery('#T010638').parent().parent().show();
				}
				// }
			}

			//@method getBindingEventForOption Auxiliary method used to allows different bindings depending on the option type
			//@param {Transaction.Line.Option.Model} option
			//@return {String} Event name used to make the binding with stickIt
		,	getBindingEventForOption: function getBindingEventForOption (option)
			{
				return ProductDetailsBaseView.optionBindEventByType[option.get('type').toLowerCase()] || 'blur';
			}

			//@method updateURL Updates the current URL based on the selected attributes of the current line
			//@return {Void} This method does not return nothing as it only update the URL without navigating
		,	updateURL: function updateURL ()
			{
				Backbone.history.navigate(this.model.generateURL(), {replace: true});
			}

			// @method getBreadcrumbPages Returns the breadcrumb for the current page based on the current item
			// @return {Array<BreadcrumbPage>} breadcrumb pages
		,	getBreadcrumbPages: function getBreadcrumbPages ()  //15/01/2020		//16/01/2020
			{
				var productNames = {
					"Short-Sleeves-Shirt": "Short Sleeve Shirt"
				,	"L-3PC-Suit": "Ladies Jacket + Skirt + Pant"
				,	"L-2PC-Skirt": "Ladies Jacket + Skirt"
				,	"L-2PC-Pants": "Ladies Jacket + Pant"
				,	"Ladies-Jacket": "Ladies Jacket"
				,	"Ladies-Skirt": "Ladies Skirt"
				,	"Ladies-Pants": "Ladies Pants"
				,	"Trenchcoat": "Trenchcoat"
				}; //added to handle breadcrumb label for newly added items
				var breadcrumb = this.model.get('item').get('_breadcrumb');
				_.map(breadcrumb, function(breadcrumb){
					breadcrumb.text = productNames[breadcrumb.text] || breadcrumb.text;
				});
				return breadcrumb;
			}

			//@method render Override default render method to initialize plugins and set page title and page_header
			//@return {Void}
		,	render: function render ()
			{
				this.title = this.model.get('item').get('_pageTitle');
				this.page_header = this.model.get('item').get('_pageHeader');

				this._render();
			}

			// @method getMetaKeywords
			// @return {String}
		,	getMetaKeywords: function getMetaKeywords ()
			{
				// searchkeywords is for alternative search keywords that customers might use to find this item using your Web store's internal search
				// they are not for the meta keywords
				// return this.model.get('_keywords');
				return this.getMetaTags().filter('[name="keywords"]').attr('content') || '';
			}

			// @method getMetaTags
			// @return {Array<HTMLElement>}
		,	getMetaTags: function getMetaTags ()
			{
				return jQuery('<head/>').html(
					jQuery.trim(
						this.model.get('item').get('_metaTags')
					)
				).children('meta');
			}

			// @method getMetaDescription
			// @return {String}
		,	getMetaDescription: function getMetaDescription ()
			{
				return this.getMetaTags().filter('[name="description"]').attr('content') || '';
			}

		,	showOptionsPusher: function showOptionsPusher ()
			{
				return false;
			}

		,	contextData: {
				'product': function ()
				{
					return Utils.deepCopy(this.model);
				}
			,	'item': function ()
				{
					return Utils.deepCopy(this.model.get('item'));
				}
			}

			//@property {ChildViews} childViews
		,	childViews: {
				'Product.Options': function ()
				{


					return new ProductDetailsOptionsSelectorView({
						model: this.model
					,	application: this.application
					,	show_pusher: this.showOptionsPusher()
					,	show_required_label: this.model.get('item').get('itemtype') === 'GiftCert'
					,	selected_line_obj: this.selectedLineObj
					,	selected_line_data: this.selectedLineData
					,	options_holder: this.optionsHolder
					});

				}
				,	'FitProfile':function()
				{
					var selectedFitProfile = '';
					if (Backbone.history.fragment.split("?").length > 1) { //Added salman June-2019
						var fragmentArray = Backbone.history.fragment.split("?")
						,	clientId = "";

						for(var i = fragmentArray.length -1; i >= 0; i--){
							if(fragmentArray[i].match('client')){
								clientId = fragmentArray[i].split("=")[1].split("&")[0];
								clientId = clientId.split('|')[0];
								break;
							}
						}
					}
					if(this.optionsHolder){
						selectedFitProfile = this.optionsHolder['custcol_fitprofile_summary'];
					}
					return new FitProfileView({
						model:this.model
					,	clientID: clientId
					,	selectedFitProfilesObj: selectedFitProfile
					});



				}
			,	'Product.Price': function ()
				{
					return new ProductViewsPriceView({
						model: this.model
					,	origin: this.inModal ? 'PDPQUICK' : 'PDPFULL'
					});
				}
			,	'MainActionView': function ()
				{
					return this.mainActionViewInstance && this.mainActionViewInstance;
				}

			,	'Product.Stock.Info': function ()
				{
					return new ProductLineStockView({
						model: this.model
					});
				}

			,	'Product.Sku': function ()
				{
					return new ProductLineSkuView({
						model: this.model
					});
				}
			,	'Quantity': function ()
				{
					return new ProductDetailsQuantityView({
						model:this.model
					});
				}
			,	'Product.ImageGallery': function ()
				{
					return new ProductDetailsImageGalleryView({
						model:this.model
					});
				}
			,	'GlobalViewsMessageView.WronglyConfigureItem': function ()
				{
					return new GlobalViewsMessageView({
						message: _.translate('<b>Warning</b>: This item is not properly configured, please contact your administrator.')
					,	type: 'warning'
					});
				}
			,	'AddToProductList': function ()
				{
					return new ProductDetailsAddToProductListView({
						model: this.model
					,	application: this.options.application
					});
				}
			,	'StockDescription': function ()
				{
					return new ProductLineStockDescriptionView({
						model: this.model
					});
				}
			}

		,	getVendorPickListContent: function()
			{
				var vendorPickListContent = '';
				var vendorPickListData = this.getVendorPickList();
				var selectedVendor = '';
				if(this.optionsHolder["custcol_custom_fabric_details"]){
					var customFabricDetail = JSON.parse(this.optionsHolder["custcol_custom_fabric_details"]);
					selectedVendor = customFabricDetail.vendor;
				}

				vendorPickListContent += '<select name="fabric-cmt-vendor" id="fabric-cmt-vendor" class="input-large" style="width:40%;">';
				vendorPickListContent += '<option value=""></option>';
				for(var i = 0; i < vendorPickListData.length; i++){
					if(selectedVendor){
						if(selectedVendor.trim() == vendorPickListData[i].internalid.trim()){
							vendorPickListContent += '<option selected value="' +  vendorPickListData[i].internalid + '" >' +  vendorPickListData[i].label + ' </option>';
						}
					} else {
							vendorPickListContent += '<option value="' +  vendorPickListData[i].internalid + '" >' +  vendorPickListData[i].label + ' </option>';
					}
				}
				vendorPickListContent += '</select>';

				return vendorPickListContent;

			}

		,	setVendorDetails: function()
			{
				var self = this;
				var vendorName = this.model.get('item').get('custitem_vendor_name');
				Utils.suiteRestGetData('getVendorLink', this.model.get('item').id).always(function (data) {
					if (data) {
						self.model.get('item').set('vendorDetails', data);
						var vendorHtmlContent = self.getVendorHtmlContent(data);
						jQuery("#vendor-detail-content").html('');
						jQuery("#vendor-detail-content").html(vendorHtmlContent);
					}

				})


			}

		,	getVendorHtmlContent: function(vendorDetails){
				var setFabricCheckBox = "";
				var isFabrickChecked, selectedFabricCollection = '', selectedFabricCode = '', selectedOtherVendor = '';

				var vendorPickList = this.getVendorPickListContent();

				if(this.optionsHolder){
					isFabrickChecked = this.optionsHolder["custcolcustcol_item_check"] ? this.optionsHolder["custcolcustcol_item_check"] : false;
					if(this.optionsHolder["custcol_custom_fabric_details"]){
						var customFabricDetail = JSON.parse(this.optionsHolder["custcol_custom_fabric_details"]);
						selectedFabricCollection = customFabricDetail.collection ? customFabricDetail.collection : '';
						selectedFabricCode = customFabricDetail.code ? customFabricDetail.code : '';
						selectedOtherVendor =  customFabricDetail.othervendor ? customFabricDetail.othervendor : '';
					}

				}

				var vendorName = this.model.get('item').get('_vendorName');
				// 13/11/2019 Umar Zulfiqar {RFQ: Item Details Template - Removed Filarte for default checked}
				//removed vendorName == 'Filarte'
				if (vendorName == "AC Shirt" || vendorName == "Jerome Clothiers" || vendorName == "Jerome Clothiers Cut Length" || isFabrickChecked == true || isFabrickChecked == 'T') {
					setFabricCheckBox = "checked";
				}

				var template = '';
				template += '<h2 class="section-header">Fabric</h2>';
				template += '<hr/>';
				template += '<div class="accordion" id="fabric-availability">';
				template += '<div class="accordion-group">';
				template += '<div class="accordion-heading">';
				template += '<a class="accordion-toggle" data-toggle="collapse" data-target="#fabric-availability-options" data-parent="#fabric-availability">';
				template += 'Fabric Availability';
				template += '<span class="accord-arrow-down">‣</span>'
				template += '</a>';
				template += '</div>';
				template += '<div id="fabric-availability-options" class="accordion-body collapse">';
				var path=window.location.pathname; //07/02/2020
				if (vendorDetails.vendorLink) {
					template += '<div class="control-group" style="padding-left:15px;">';
					template += '<label class="control-label" style="font-size: 13px;font-weight: normal;line-height: 18px;padding-left:0;">Vendor Link:</label>';
					if(vendorDetails.vendorLink=='N/A')
					{
						template += '<label href="' + vendorDetails.vendorLink + '" style="text-decoration:underline;" target="_blank">"' + vendorDetails.vendorLink + '"</label>';
					}
					else
					{
						template += '<a href="' + vendorDetails.vendorLink + '" style="text-decoration:underline;" target="_blank">"' + vendorDetails.vendorLink + '"</a>';
					}
					template += '</div>';
				} else {
					template += '<div class="control-group" style="padding-left:15px;">';
					template += '<label class="control-label" style="font-size: 13px;font-weight: normal;line-height: 18px;padding-left:0;">Vendor File:</label>';
					if (vendorDetails.vendorFileName) {
						template += '<a href="' + vendorDetails.vendorFile + '" style="text-decoration:underline;" target="_blank">' + vendorDetails.vendorFileName + '</a>';
					} else {
						if(path.indexOf('CMT-Item')!=-1)
						{
							vendorDetails.vendorFile='N/A';
							template += '<label href="' + vendorDetails.vendorFile + '" style="text-decoration:underline;" target="_blank">' + vendorDetails.vendorFile + '</label>';
						}
						else
						{
							template += '<a href="' + vendorDetails.vendorFile + '" style="text-decoration:underline;" target="_blank">' + vendorDetails.vendorFile + '</a>';
						}
					}
					template += '</div>';
				}
				template += '<div class="control-group">';
				template += '<label class="control-label" style="font-size: 13px;font-weight: normal;line-height: 18px;margin-right:10px;">Checked?</label>';
				template += '<label style="font-size: 1em">';
				template += '<input type="checkbox" value="" id="chkItem"' + setFabricCheckBox + '>';
				template += '</label>';
				template += '</div>';
				template += '</div>';
				template += '</div>';
				template += '</div>';
				template += '<div class="accordion" id="fabric-cmt">';
				template += '<div class="accordion-group">';
				template += '<div class="accordion-heading">';
				if(this.page_header=='CMT Item')
				{
					template += '<a class="accordion-toggle" data-toggle="collapse" data-target="#fabric-cmt-options" data-parent="#fabric-cmt">';
					template += 'CMT Fabric';
					template += '<span class="accord-arrow-down">‣</span>';
					template += '</a>';
				}
				template += '</div>';
				template += '<div id="fabric-cmt-options" class="accordion-body collapse">';
				template += '<div class="control-group">';
				template += '<div class="col-md-4">';
				template += '<label class="control-label" for="fabric-cmt-vendor"';
				template += 'style="font-size: 13px;font-weight: normal;line-height: 18px;">Fabric Vendor</label></div>';
				template += '<div class="col-md-6">' + vendorPickList + '</div>';
				template += '</div>';
				template += '<div class="control-group" style="display: none;">'
				template += '<label class="col-md-4 control-label" for="fabric-cmt-othervendorname"';
				template += 'style="font-size: 13px;font-weight: normal;line-height: 18px;padding-left: 11px;">*Other';
				template += 'Fabric Vendor </label>';
				template += '<input type="text" value="" name="fabric-cmt-othervendorname"';
				template += 'id="fabric-cmt-othervendorname" class="input-large col-md-6" style="height: 30px;padding: 5px;margin-left: 15px;min-width: auto;width: 44.5%;"';
				template += 'value="' + selectedOtherVendor + '">';
				template += '</div>';
				template += '<div class="control-group">';
				template += '<div class="col-md-4">';
				template += '<label class="control-label" for="fabric-cmt-collection"';
				template += 'style="font-size: 13px;font-weight: normal;line-height: 18px;">Fabric ';
				template += 'Collection ' + selectedFabricCollection + '</label>';
				template += '</div>';
				template += '<div class="col-md-6">';
				template += '<input type="text" value="' + selectedFabricCollection + '" name="fabric-cmt-collection"';
				template += 'id="fabric-cmt-collection" class="input-large" style="" >';
				template += '</div></div>';
				template += '<div class="control-group">';
				template += '<div class="col-md-4">';
				template += '<label class="control-label" for="fabric-cmt-code"';
				template += 'style="font-size: 13px;font-weight: normal;line-height: 18px;">Fabric ';
				template += 'Code </label>';
				template += '</div>';
				template += '<div class="col-md-6">';
				template += '<input type="text" value="' + selectedFabricCode + '" name="fabric-cmt-code" id="fabric-cmt-code"';
				template += 'class="input-large" style="" >';
				template += '</div></div>';
				template += '</div>';
				template += '</div>';
				template += '</div>';
				return template;
			}

		,	getVendorPickList: function(){
				var vendorpick = _.find(this.model.get('item').get('itemoptions_detail').fields,function(f){return f.internalid == "custcol_vendorpicked";});
				var vendorpicklist = [];
				if(vendorpick){
					vendorpicklist = vendorpick.values;
					vendorpicklist.splice(0,1);
				}

				return vendorpicklist;
			}


		,	setExtraQuantity: function() {
				var self = this;
				var url = Utils.getAbsoluteUrl('javascript/extraQuantity.json');
				jQuery.get(url).always(function(data){
					if(data){
						window.extraQuantity = data;
						self.model.get('item').set('extraQuantity', data);
						var extraQunatityHtmlContent = self.getExtraQuantityHtmlContent();
						jQuery("#extra-quantity-content").html(extraQunatityHtmlContent);

					}
				});
			}

		, 	getExtraQuantityHtmlContent: function()
			{
				var template = '';
				var extraQuantity = window.extraQuantity;
				if(extraQuantity){
					var selectedExtraQty = '';
					if(this.optionsHolder){
						selectedExtraQty = this.optionsHolder['custcol_fabric_extra'];
					}
					var itemType = this.model.get('custitem_clothing_type').split(', ');
					template += '<select id="fabric_extra" style="width:220px;" class="display-option-dropdown" name="fabric_extra" data-type="fabric_extra">';
					template += '<option value="Please Select"> Please Select </option>'; // 13/11/2019 Umar Zulfiqar {RFQ: Set Please Select for default on Drop down}
					var extraQuantityValues = _.find(extraQuantity, function(option){
						if(option.name == "extra"){
							return option;
						}
					});
					extraQuantityValues = extraQuantityValues.values;
					if (itemType.length == 3) {
						var result = _.find(extraQuantityValues, function (fextra) {
							return (fextra.code == '3-Piece-Suit' || fextra.code == 'L-3PC-Suit');  //04/02/2020
						});

						if (result) {
							_.each(result.design, function (option) {
								if(option.code == selectedExtraQty){
									template += '<option selected value="' + option.value + '" name="' + option.code + '" >' + option.code + '</option>';

								} else {
									template += '<option value="' + option.value + '" name="' + option.code + '" >' + option.code + '</option>';
								}
							});
						}
					} else if (itemType.length == 2) {
						var result = _.find(extraQuantityValues, function (fextra) {
							return (fextra.code == '2-Piece-Suit' || fextra.code == 'L-2PC-Pants'|| fextra.code == 'L-2PC-Skirt');	 //04/02/2020
						});
						if (result) {
							_.each(result.design, function (option) {
								if(option.code == selectedExtraQty){
									template += '<option selected value="' + option.value + '" name="' + option.code + '" >' + option.code + '</option>';

								} else {
									template += '<option value="' + option.value + '" name="' + option.code + '" >' + option.code + '</option>';
								}
							});
						}
					} else {
						var result = _.find(extraQuantityValues, function (fextra) {
							return fextra.code == itemType[0];
						});

						if (result) {
							_.each(result.design, function (option) {
								if(option.code == selectedExtraQty){
									template += '<option selected value="' + option.value + '" name="' + option.code + '" >' + option.code + '</option>';

								} else {
									template += '<option value="' + option.value + '" name="' + option.code + '" >' + option.code + '</option>';
								}
							});
						}
					}
					template += '</select>';
			}
				return template;
			}
			//@method getContext
			//@return {ProductDetails.Base.View.Context}
		,	getContext: function ()
			{
				var item_model = this.model.get('item');
				var changeFabricUrl = '';
				var fabricQuantity = '';
				var vendorName = item_model.get('_vendorName');
				var vendorPickListContent = this.getVendorPickListContent();
				var isFabrickChecked, selectedFabricCollection = '', selectedFabricCode = '', selectedOtherVendor = '';
				if(this.optionsHolder){
					isFabrickChecked = this.optionsHolder["custcolcustcol_item_check"] ? this.optionsHolder["custcolcustcol_item_check"] : false;
					if(this.optionsHolder["custcol_custom_fabric_details"]){
						var customFabricDetail = JSON.parse(this.optionsHolder["custcol_custom_fabric_details"]);
						selectedFabricCollection = customFabricDetail.collection ? customFabricDetail.collection : '';
						selectedFabricCode = customFabricDetail.code ? customFabricDetail.code : '';
						selectedOtherVendor =  customFabricDetail.othervendor ? customFabricDetail.othervendor : '';
					}

				}

				if(this.optionsHolder["custcol_fabric_quantity"]){
					fabricQuantity = this.optionsHolder["custcol_fabric_quantity"];
					window.fabricQuantity = fabricQuantity; //Added name="custcol_fabric_quantity" in html input and because of it value not showing so that's why using widow memory. Will fix it
				}

				if(this.selectedLineObj.productList && this.selectedLineObj.clientId && this.selectedLineObj.product){
					changeFabricUrl = "/item-type/" + this.selectedLineObj.product + "?client=" + this.selectedLineObj.clientId + "|" + this.selectedLineObj.productList;
				}
				//@class ProductDetails.Base.View.Context
				return {
					//@property {Transaction.Line.Model} model
					model: this.model
					//@property {String} pageHeader
				,	pageHeader: this.page_header
					//@property {String} itemUrl
				,	itemUrl: item_model.get('_url') + this.model.getQuery()
					//@property {Boolean} isItemProperlyConfigured
				,	isItemProperlyConfigured: item_model.isProperlyConfigured()
					//@property {Boolean} isPriceEnabled
				,	isPriceEnabled: !ProfileModel.getInstance().hidePrices()
				,	vendorDetails: {}
				,	setFabricCheckBox : (vendorName == "AC Shirt" || vendorName == "Filarte" || vendorName == "Jerome Clothiers" || vendorName == "Jerome Clothiers Cut Length" || isFabrickChecked == true || isFabrickChecked == 'T') ? "checked":""
				,	vendorPickList: vendorPickListContent
				,	clothingType: (item_model.get('custitem_clothing_type') != "&nbsp;") ? true : false
				,	isNonInvtItemPart: (item_model.get('_itemType') == 'NonInvtPart') ? true : false
				,	isNotEqualToGiftCert: (item_model.get('_itemType') != 'GiftCert') ? true : false
				,	minimumQuantity : item_model.get('_minimumQuantity') ? item_model.get('_minimumQuantity') : 0
				,	extraQuantityContent: true
				,	selectedFabricCollection: selectedFabricCollection
				,	selectedFabricCode: selectedFabricCode
				,	selectedOtherVendor: selectedOtherVendor
				,	changeFabricUrl: changeFabricUrl
				,	fabricQuantity: fabricQuantity ? fabricQuantity : ''
			};
				//@class ProductDetails.Base.View
			}
		}
		//Static properties
	,	{
			//@property {ProductDetails.Base.View.OptionBinding} optionBindEventByType
			//@static
			optionBindEventByType: {
				//@class ProductDetails.Base.View.OptionBinding This class associated an option type with the event used to set the option's value
				// @extend Dictionary<String, String>
				'select': 'change'
			,	'text': 'blur'
			,	'date': 'change'
			}
			//@class ProductDetails.Base.View

			//@method addMainActionView Allows to add a BackboneView constructor as the view that will perform the main action.
			//@param {Backbone.View} main_action_view
			//@return {Void}
			//@static
		,	addMainActionView: function (main_action_view)
			{
				ProductDetailsBaseView.mainActionView = main_action_view;
			}

			//@method getMainActionView Allows to retrieve the current set BackboneView constructor used as the view that will perform the main action.
			//@return {Backbone.View?}
			//@static
		,	getMainActionView: function ()
			{
				return ProductDetailsBaseView.mainActionView;
			}
		}
	);

	ProductDetailsBaseView.addMainActionView(CartAddToCartButtonView);

	return ProductDetailsBaseView;
});

//@class ProductDetails.Base.View.Initialize.Options
//@property {Product} model
//@property {String} baseUrl
//@property {ApplicationSkeleton} application
