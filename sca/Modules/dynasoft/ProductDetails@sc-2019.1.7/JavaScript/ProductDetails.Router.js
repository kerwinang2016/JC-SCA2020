/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductDetails
define(
	'ProductDetails.Router'
,	[
		'Product.Model'
	,	'ProductDetails.Full.View'
	,	'ProductDetails.QuickView.View'

	,	'Backbone'
	,	'AjaxRequestsKiller'
	,	'Utils'
	]
,	function (
		ProductModel
	,	ProductDetailsFullView
	,	ProductDetailsQuickView

	,	Backbone
	,	AjaxRequestsKiller
	,	Utils
	)
{
	'use strict';

	// @class ProductDetails.Router This will listen to any route that should display Product Detailed
	// Page Parses any options passed as parameters @extends Backbone.Router
	return Backbone.Router.extend({

		//@property {Object} routes
		routes: {
			':url': 'productDetailsByUrl'
		}

		//@method initialize
		//@param {ProductDetails.Router.InitializeParameters}
		//@return {Void}
	,	initialize: function initialize (options)
		{
			this.application = options.application;
			// we will also add a new reg-exp route to this, that will cover any URL with slashes in it so in the case
			// you want to handle URLs like /cat1/cat2/urlcomponent, as this are the last routes to be evaluated,
			// it will only get here if there is no other more appropriate one
			this.route(/^(.*?)$/, 'productDetailsByUrl');

			// This is the fall-back URL if a product does not have a URL component.
			this.route('product/:id', 'productDetailsById');
			this.route('product/:id?:options', 'productDetailsById');
		}

		//@method getView Returns the view constructor to show the PDP depending if the view will be shown in modal or not
		//@return {ProductDetails.Full.View|ProductDetails.QuickView.View}
	,	getView: function getView ()
		{
			if (this.application.getLayout().isShowContentRewritten)
			{
				return ProductDetailsQuickView;
			}
			return ProductDetailsFullView;
		}

		// @method productDetailsByUrl dispatch the 'view product details by URL' page.
		// @param {String} url
		// @return {Void}
	,	productDetailsByUrl: function productDetailsByUrl (url)
		{
			//This decode is done because when a PDP is reached from a secure domain it is encoded so NetSuite preserve all the parameters when made
			//the redirect.
			url  = decodeURIComponent(url);
			// if there are any options in the URL
			var options = null;

			if (~url.indexOf('?'))
			{
				options = Utils.parseUrlOptions(url);
				url = url.split('?')[0];
			}
			// Now go grab the data and show it
			if (options)
			{
				this.productDetails({url: url}, url, options);
			}
			else
			{
				this.productDetails({url: url}, url);
			}
		}

		// @method productDetailsById dispatch the 'view product details by id' page
		// @param {String} id
		// @param {String} options
		// @return {Void}
	,	productDetailsById: function productDetailsById (id, options)
		{
			// Now go grab the data and show it
			this.productDetails({id: id}, '/product/' + id, Utils.parseUrlOptions(options));
		}

		// @method productDetails dispatch the 'view product details' page . This is the base implementation
		// @param {String} api_query
		// @param {String} base_url
		// @param {ParameterOptions} options All the URL options specified when navigated
		// @return {Void}
	,	productDetails: function productDetails (api_query, base_url, options)
		{
			var application = this.application
			,	product = new ProductModel()
			,	ViewConstructor = this.getView()
			,	item = product.get('item');
			var vendorDetails, extraQuantity;

			item.fetch({
				data: api_query
			,	killerId: AjaxRequestsKiller.getKillerId()
			,	pageGeneratorPreload: true
			}).then(
				// Success function
				function (data, result, jqXhr)
				{
					if (!item.isNew())
					{
						// once the item is fully loaded we set its options
						product.setOptionsFromURL(options);

						product.set('source', options && options.source);

						product.set('internalid', options && options.internalid);

						if (api_query.id && item.get('urlcomponent') && SC.ENVIRONMENT.jsEnvironment === 'server')
						{
							nsglobal.statusCode = 301;
							nsglobal.location = product.generateURL();
						}

						if (data.corrections && data.corrections.length > 0)
						{
							if (item.get('urlcomponent') && SC.ENVIRONMENT.jsEnvironment === 'server')
							{
								nsglobal.statusCode = 301;
								nsglobal.location = data.corrections[0].url + product.getQuery();
							}
							else
							{
								return Backbone.history.navigate('#' + data.corrections[0].url + product.getQuery(), {trigger: true});
							}
						}

						if (!(options && options.quantity))
						{
							product.set('quantity', product.get('_minimumQuantity'));
						}

						var productTypeArr = {
							"3-Piece-Suit": "Jacket, Trouser, Waistcoat"
						,	"2-Piece-Suit": "Jacket, Trouser"
						,	"L-3PC-Suit": "Ladies-Jacket, Ladies-Skirt, Ladies-Pants"
						,	"L-2PC-Skirt": "Ladies-Jacket, Ladies-Skirt"
						,	"L-2PC-Pants": "Ladies-Jacket, Ladies-Pants"
						}

						if(options && options['product']){
							product.set('custcol_producttype',options['product']);
							product.set('custitem_clothing_type',productTypeArr[options['product']] || options['product']);
						}else{
							var tempProductType = plist.split('|')[3];
							product.set('custcol_producttype',tempProductType);
							product.set('custitem_clothing_type',productTypeArr[tempProductType] || tempProductType);
						}
						jQuery.ajax({
							url: '/app/site/hosting/scriptlet.nl?script=154&deploy=1&compid=3857857&h=70494400753de3ffe57b&inputJson='+ "{'func': 'getVendorLink',	'data': "+product.get('item').id+"}",
							type: 'get',
							async: false,
							dataType: "json",
							success: function(data){
								vendorDetails = data;
							}
						});
						var url = Utils.getAbsoluteUrl('javascript/extraQuantity.json');
						jQuery.ajax({
							url: url,
							type: 'get',
							async: false,
							success: function(data){
								extraQuantity = data[1];
								window.extraQuantity = data
							}
						});
						var	view = new ViewConstructor({
								model: product
							,	baseUrl: base_url
							,	application: application
							, vendorDetails: vendorDetails
							, extraQuantity: extraQuantity
							});

						// then we show the content
						view.showContent();
					}
					else if (jqXhr.status >= 500)
					{
						application.getLayout().internalError();
					}
					else if (jqXhr.responseJSON.errorCode !== 'ERR_USER_SESSION_TIMED_OUT')
					{
						// We just show the 404 page
						application.getLayout().notFound();
					}
				}
				// Error function
			,	function (jqXhr)
				{
					// this will stop the ErrorManagment module to process this error
					// as we are taking care of it
					jqXhr.preventDefault = true;

					if (jqXhr.status >= 500)
					{
						application.getLayout().internalError();
					}
					else if (jqXhr.responseJSON.errorCode !== 'ERR_USER_SESSION_TIMED_OUT')
					{
						// We just show the 404 page
						application.getLayout().notFound();
					}
				}
			);
		}
	});
});


//@class ProductDetails.Router.InitializeParameters
//@property {ApplicationSkeleton} application
//
