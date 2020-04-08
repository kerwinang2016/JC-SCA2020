/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Transaction.Line.Views
define('Cart.Lines.View'
,	[
		'Transaction.Line.Views.Price.View'
	,	'Transaction.Line.Views.Options.Selected.View'
	,	'ProductLine.Stock.View'
	,	'ProductLine.Sku.View'
	,	'ProductLine.StockDescription.View'

	,	'Transaction.Line.Views.Tax'

	,	'Backbone.CollectionView'
	,	'Backbone.CompositeView'

	,	'cart_lines.tpl'

	,	'Backbone'
	,	'underscore'

	,	'SC.Configuration'
	]
,	function (
		TransactionLineViewsPriceView
	,	TransactionLineViewsOptionsSelectedView
	,	ProductLineStockView
	,	ProductLineSkuView
	,	ProductLineStockDescriptionView

	,	TransactionLineViewsTax

	,	BackboneCollectionView
	,	BackboneCompositeView

	,	cart_lines_tpl

	,	Backbone
	,	_

	,	Configuration
	)
{
	'use strict';

	//@class Cart.Lines.View @extend Backbone.View
	return Backbone.View.extend({

		template: cart_lines_tpl

		//@method initialize
		//@param {Transaction.Line.Views.Cell.Actionable.Initialize.Options} options
		//@return {Void}
	,	initialize: function ()
		{
			BackboneCompositeView.add(this);
		}

	,	childViews: {
			'Item.Price': function ()
			{
				return new TransactionLineViewsPriceView({
					model: this.model
				,	showComparePrice: true
				});
			}
		,	'Item.Sku': function ()
			{
				return new ProductLineSkuView({
					model: this.model
				});
			}
		,	'Item.SelectedOptions': function ()
			{
				return new TransactionLineViewsOptionsSelectedView({
					model: this.model
				});
			}
		,	'Product.Stock.Info': function ()
			{
				return new ProductLineStockView({
					model: this.model
				});
			}
		,	'Item.Tax.Info': function()
			{
				if(Configuration.get('showTaxDetailsPerLine'))
				{
					return new TransactionLineViewsTax({
						model: this.model
					});
				}
			}
		,	'Item.Summary.View': function ()
			{
				return new this.options.SummaryView(_.extend({
					model: this.model
				,	application: this.options.application
				}, this.options.summaryOptions || {}));
			}
		,	'Item.Actions.View': function ()
			{
				return new this.options.ActionsView(_.extend({
					model: this.model
				,	application: this.options.application
				}, this.options.actionsOptions || {}));
			}
		,	'StockDescription': function ()
			{
				return new ProductLineStockDescriptionView({
					model: this.model
				});
			}
		}

		//@method getContext
		//@return {Transaction.Line.Views.Actionable.View.Context}
	,	getContext: function ()
		{
			var item = this.model.get('item');
			var lineOptions = this.model.get('options').models;
			var tailorCustomPrice = '';
			var fabric_details = {};
			for(var i = 0; i < lineOptions.length; i++){
				if(lineOptions[i].attributes.cartOptionId == "custcol_order_list_line_item_total"){
					tailorCustomPrice = lineOptions[i].attributes.value.label || lineOptions[i].attributes.value.internalid
					if(tailorCustomPrice.indexOf('.') == '-1'){
						tailorCustomPrice = tailorCustomPrice.toString() + '.00'
					}
					tailorCustomPrice = tailorCustomPrice
				}
				// added if to get the fabric detail to display
				if(lineOptions[i].attributes.cartOptionId == "custcol_custom_fabric_details"){
					fabric_details = JSON.parse(lineOptions[i].attributes.value.label);
				}
			}

			// added if to get the fabric detail to display
			if(item.get('itemid') == "CMT Item"){
				item.set("_name", "CMT Item - "+ fabric_details.collection+" ("+fabric_details.code+")");
			}
			var thumbnailObj = this.model.getThumbnail();
			if(thumbnailObj){
				thumbnailObj.url = thumbnailObj.url.replace('no_image_available', 'no_image_available_blank'); //13/09/2019 saad
			}

			//@class Transaction.Line.Views.Actionable.View.Context
			return {
					//@property {OrderLine.Model|Transaction.Line.Model} line
					line: this.model
					//@property {String} lineId
				,	lineId: this.model.get('internalid')
					//@property {Item.Model} item
				,	item: item
					//@property {String} itemId
				,	itemId: item.get('internalid')
					//@property {String} linkAttributes
				,	linkAttributes: this.model.getFullLink({quantity:null,location:null,fulfillmentChoice:null})
					//@property {Boolean} isNavigable
				// ,	isNavigable: !!this.options.navigable && !!item.get('_isPurchasable')
				,	isNavigable: false //false added to remove clickable link from item name
					//@property {Boolean} showCustomAlert
				,	showCustomAlert: !!item.get('_cartCustomAlert')
					//@property {String} customAlertType
				,	customAlertType: item.get('_cartCustomAlertType') || 'info'
					//@property {Boolean} showActionsView
				,	showActionsView: !!this.options.ActionsView
					//@property {Boolean} showSummaryView
				,	showSummaryView: !!this.options.SummaryView
					//@property {Boolean} showAlert
				,	showAlert: !_.isUndefined(this.options.showAlert) ? !!this.options.showAlert : true
					//@property {Boolean} showGeneralClass
				,	showGeneralClass: !!this.options.generalClass
					//@property {String} generalClass 
				,	generalClass: this.options.generalClass
					// @property {ImageContainer} thumbnail
				,	thumbnail: thumbnailObj
				,	tailorCustomPrice: tailorCustomPrice ? tailorCustomPrice : 0.00
				,	currencSymbol: SC.ENVIRONMENT.currentCurrency.symbol ? SC.ENVIRONMENT.currentCurrency.symbol : '$'
			};
			//@class Transaction.Line.Views.Actionable.View
		}
	});
});


//@class Cart.Lines.Initialize.Options
//@property {Transaction.Line.Model} model
//@property {String} generalClass Class name used in the generated HTML
//@property {Backbone.View} SummaryView View to show details
//@property {Backbone.View} ActionsView View to show actions buttons
//@property {Object} actionsOptions Any object used to extend the options sent to the Action View
//@property {Object} summaryOptions Any object used to extend the options sent to the Summary View
//@property {Boolean} navigable
//@property {Boolean} showAlert Indicate if a place holder is added in the final HTML, used when the action can generate errors
//@property {ApplicationSkeleton} application
//@property {Boolean} hideComparePrice Property used to bypass to the TransactionLineViewsPriceView
