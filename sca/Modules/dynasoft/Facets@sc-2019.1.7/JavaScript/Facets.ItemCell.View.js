/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Facets
define(
	'Facets.ItemCell.View'
,	[
		'ProductLine.Stock.View'
	,	'Product.Model'
	,	'GlobalViews.StarRating.View'
	,	'Cart.QuickAddToCart.View'
	,	'ProductViews.Option.View'
	,	'ProductLine.StockDescription.View'
	,	'SC.Configuration'
	,	'Utils'

	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'underscore'
	]
,	function (
		ProductLineStockView
	,	ProductModel
	,	GlobalViewsStarRating
	,	CartQuickAddToCartView
	,	ProductViewsOptionView
	,	ProductLineStockDescriptionView
	,	Configuration
	,	Utils

	,	Backbone
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	_
	)
{
	'use strict';

	// @class Facets.ItemCell.View @extends Backbone.View
	return Backbone.View.extend({

		//@method initialize Override default method to convert this View into Composite
		//@param {Facets.ItemCell.View.Initialize.Options} options
		//@return {Void}
		initialize: function ()
		{
			BackboneCompositeView.add(this);
			this.stockclass = "instockmessage";
		}

	,	contextData: {
			'item': function ()
			{
				return Utils.deepCopy(this.model);
			}
		}

	,	childViews: {
			'ItemViews.Stock': function ()
			{
				return new ProductLineStockView({
					model: this.model
				});
			}

		,	'GlobalViews.StarRating': function()
			{

				var view = new GlobalViewsStarRating({
					model: this.model
				,	showRatingCount: false
				,	queryOptions: Utils.parseUrlOptions(location.href)
				});

				return this.options.showStarRating === false ? null : view;
			}

		,	'ItemDetails.Options': function()
			{
				var options_configuration = Configuration.get('ItemOptions.optionsConfiguration', []);

				return new BackboneCollectionView({
					collection: _.filter(this.model.get('options').sortBy('index'), function (option)
					{
						var option_configuration = _.findWhere(options_configuration, {cartOptionId: option.get('cartOptionId')});
						return option_configuration && option_configuration.showSelectorInList;
					})
				,	childView: ProductViewsOptionView
				,	viewsPerRow: 1
				,	childViewOptions: {
						item: this.model
					,	templateName: 'facetCell'
					,	showLink: true
					,	hideLabel: true
					,	showSmall: true
					}
				});
			}

		,	'Cart.QuickAddToCart': function ()
			{
				var product = new ProductModel({
					item: this.model
				,	quantity: this.model.get('_minimumQuantity', true)
				});

				return new CartQuickAddToCartView({
					model: product
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

	,	getStockInfo: function()
		{
			var tempStockInfo = '';
			if (this.model.get('outofstockmessage') == "Low Stock" ) {

				tempStockInfo = this.model.get('outofstockmessage') + '(m):' + this.model.get('custitem_ftorderstock');
				this.stockclass = 'outofstockmessage';
			}
			else if(this.model.get('outofstockmessage') == "Out of Stock" || this.model.get('outofstockmessage') == "Temp Soldout" || this.model.get('outofstockmessage') == "Soldout")
			{
				tempStockInfo = this.model.get('outofstockmessage');
				this.stockclass = 'outofstockmessage';
			}
			else if (this.model.get('custitem_ftorderstock') && parseFloat(this.model.get('custitem_ftorderstock')) > 0) {

				tempStockInfo = 'In stock(m):' + this.model.get('custitem_ftorderstock');
				this.stockclass = 'instockmessage';
			} else {

				if (this.model.get('custitem_checkstockmessage')) {
					tempStockInfo = this.model.get('custitem_checkstockmessage');
				} else {
					tempStockInfo = 'Check Stock';
				}
				this.stockclass = 'checkstockmessage';
			}

			return tempStockInfo;
		}

		// @method getContext @returns {Facets.ItemCell.View.Context}
	,	getContext: function ()
		{
			var hash = window.location.href.split(window.location.host + '/')[1]; //Added salman June-2019
			if(hash.indexOf('Inventory/Fabrics') == -1 && hash.indexOf('Inventory/Inventory-Accessories') == -1 && hash.indexOf('Inventory/Packaging') == -1 && hash.indexOf('item-type/') != -1){ // 6/20/2019
				var paramarr = hash.split('item-type/')[1];
				var product = paramarr.split('?')[0];
				var client = paramarr.split('?')[1];
			}
			var stockInfo = this.getStockInfo();
			var thumbnailObj = this.model.getThumbnail();
			thumbnailObj.url = thumbnailObj.url.replace('no_image_available', 'no_image_available_blank');


			//@class Facets.ItemCell.View.Context
			return {
				// @property {String} itemId
				itemId: this.model.get('_id')
				// @property {String} name
			,	name: this.model.get('_name')
				// @property {String} url
			,	url: this.model.get('_url') + '?' + client + '&product=' + product
				//@property {String} sku
			,	sku: this.model.getSku()
				// @property {Boolean} isEnvironmentBrowser
			,	isEnvironmentBrowser: SC.ENVIRONMENT.jsEnvironment === 'browser' && !SC.ENVIRONMENT.isTouchEnabled
				// @property {ImageContainer} thumbnail
			,	thumbnail: thumbnailObj
				// @property {Boolean} itemIsNavigable
			,	itemIsNavigable: !_.isUndefined(this.options.itemIsNavigable) ? !!this.options.itemIsNavigable : true
				//@property {Boolean} showRating
			,	showRating: SC.ENVIRONMENT.REVIEWS_CONFIG && SC.ENVIRONMENT.REVIEWS_CONFIG.enabled
				// @property {Number} rating
			,	rating: this.model.get('_rating')
				//@property {String} track_productlist_list
			,	track_productlist_list: this.model.get('track_productlist_list')
				//@property {String} track_productlist_position
			,	track_productlist_position: this.model.get('track_productlist_position')
				//@property {String} track_productlist_category
			,	track_productlist_category: this.model.get('track_productlist_category')
			,	vendorName: this.model.get('vendorname')
			,	stockInfo: stockInfo
			, stockclass: this.stockclass
			};
			//@class Facets.ItemCell.View
		}
	});
});


//@class Facets.ItemCell.View.Initialize.Options
//@property {Item.Model} model
//@property {ApplicationSkeleton} application
//@property {Boolean?} itemIsNavigable
