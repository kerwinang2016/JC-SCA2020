/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Header
define(
	'Header.MiniCartItemCell.View'
,	[
		'Transaction.Line.Views.Options.Selected.View'
	,	'Profile.Model'

	,	'header_mini_cart_item_cell.tpl'

	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	]
,	function (
		TransactionLineViewsOptionsSelectedView
	,	ProfileModel

	,	header_mini_cart_item_cell_tpl

	,	Backbone
	,	BackboneCompositeView
	)
{
	'use strict';

	// @class Header.MiniCart.View @extends Backbone.View
	return Backbone.View.extend({

		template: header_mini_cart_item_cell_tpl

	,	initialize: function ()
		{
			BackboneCompositeView.add(this);
		}

	,	childViews: {
			'Item.SelectedOptions': function ()
			{
				return new TransactionLineViewsOptionsSelectedView({
					model:this.model
				});
			}
		}

		// @method getContext
		// @return {Header.MiniCart.View.Context}
	,	getContext: function ()
		{
			var product;
			var clientId;
			var fabric_details = {};
			var thumbnailObj = this.model.getThumbnail(); //16/12/2019 saad 
			thumbnailObj.url = thumbnailObj.url.replace('no_image_available', 'no_image_available_blank'); //16/12/2019 saad 

			var options = this.model.get('options');
			var itemUrlComponent = this.model.get('item').get('urlcomponent');
			if (!itemUrlComponent) {
				itemUrlComponent = 'product/' + this.model.get('item').get('internalid');
			}
			for (var i = 0; i < options.length; i++) {
				if (options.models[i].attributes.cartOptionId == 'custcol_producttype') {
					product = options.models[i].attributes.value.label || options.models[i].attributes.value.internalid;
				}
				if (options.models[i].attributes.cartOptionId == 'custcol_tailor_client') {
					clientId = options.models[i].attributes.value.label || options.models[i].attributes.value.internalid;
					clientId = clientId.split('|')[0];
				}
				// added if to get the fabric detail to display
				if(options.models[i].attributes.cartOptionId == "custcol_custom_fabric_details"){
					fabric_details = JSON.parse(options.models[i].attributes.value.label);
				}
			}
			var internalid = this.model.get('internalid');
			var editItemUrl = "/" + itemUrlComponent + "?client=" + clientId + "|" + internalid + "&product=" + product;
			// added if to get the fabric detail to display
			if(this.model.get('item').get('itemid') == "CMT Item"){
				this.model.get('item').set("_name", "CMT Item - "+ fabric_details.collection+" ("+fabric_details.code+")");
			}
			// @class Header.MiniCart.View.Context
			return {
				line: this.model
				//@property {Number} itemId
			,	itemId: this.model.get('item').id
				//@property {String} itemType
			,	itemType: this.model.get('item').get('itemtype')
				//@property {String} linkAttributes
			,	linkAttributes: this.model.getFullLink({quantity:null,location:null,fulfillmentChoice:null})
				// @property {ImageContainer} thumbnail
			,	thumbnail: thumbnailObj //16/12/2019 saad 
				// @property {Boolean} isPriceEnabled
			,	isPriceEnabled: !ProfileModel.getInstance().hidePrices()
				// @property {Boolean} isFreeGift
			,	isFreeGift: this.model.get('free_gift') === true 
			,	editItemUrl: editItemUrl ? editItemUrl : ''
			,	product: product ? product : ''
			};
			// @class Header.MiniCart.View
		}
	});
});