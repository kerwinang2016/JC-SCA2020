/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Cart
define('Cart.Confirmation.View'
,	[
		'Transaction.Line.Views.Price.View'
	,	'Backbone.CompositeView'
	,	'Transaction.Line.Views.Options.Selected.View'
	,	'ProductLine.Sku.View'

	,	'cart_confirmation_modal.tpl'

	,	'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function (
		TransactionLineViewsPriceView
	,	BackboneCompositeView
	,	TransactionLineViewsOptionsSelectedView
	,	ProductLineSkuView

	,	cart_confirmation_modal_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	// @class Cart.Confirmation.View Cart Confirmation view @extends Backbone.View
	return Backbone.View.extend({

		// @property {Function} template
		template: cart_confirmation_modal_tpl

		// @property {String} title
	,	title: _('Added to Order').translate()  //16/12/2019 saad

	,	modalClass: 'global-views-modal-large'

		// @property {String} page_header
	,	page_header: _('Added to Order').translate()		//16/12/2019 saad

		// @property {Object} attributes
	,	attributes: {
			'id': 'Cart.Confirmation.View'
		,	'class': 'add-to-cart-confirmation-modal shopping-cart-modal'
		}

	,	events: {
			'click [id=redirect-to-cart]': 'redirectToCart'
		}
		// @method initialize
	,	initialize: function ()
		{
			this.model.on('change', this.render, this); 

			BackboneCompositeView.add(this);
		} 
	,	redirectToCart: function() 
		{ //26/07/2019 Saad
			window.location = SC._applications.MyAccount.getConfig().siteSettings.touchpoints.home + "#cart";
			//window.location.href = 'http://jcsca.dynasoftcloud.com/cart'; 
			//Backbone.history.navigate('cart', { trigger: true });

		}	

	,	destroy: function destroy ()
		{
			this.model.off('change', this.render, this);
			this._destroy();
		}

		// @property {Object} childViews
	,	childViews: {
				'Line.Price': function ()
				{
					return new TransactionLineViewsPriceView({
						model: this.model
					});
				}
			,	'Line.SelectedOptions': function ()
				{
					return new TransactionLineViewsOptionsSelectedView({
						model: this.model
					});
				}
			,	'Line.Sku': function ()
				{
					return new ProductLineSkuView({
						model: this.model
					});
				}
		}

		// @method getContext
		// @return {Cart.Confirmation.View.Context}
	,	getContext: function()
		{
			var thumbnailObj = this.model.getThumbnail(); //13/09/2019 saad 
			thumbnailObj.url = thumbnailObj.url.replace('no_image_available', 'no_image_available_blank'); //13/09/2019 saad 
			var optionsLength = this.model.get('options').models.length;
			var item = this.model.get('item');
			var productType = '';

			for(var i = 0; i < optionsLength; i++){
				if(this.model.get('options').models[i].attributes.cartOptionId == 'custcol_producttype'){
					var temp = this.model.get('options').models[i].attributes.value;
					if(temp){
						productType = temp.label || temp.internalid;
					}
				}
			}

			var itemName = item.get('_name', true) + ' - ' + productType;
			if(item.get('itemid') == "CMT Item"){
				var fabric_detail = jQuery("#fabric-cmt-collection").val()+" ("+jQuery("#fabric-cmt-code").val()+")";
				itemName = item.get('_name', true) +' - '+fabric_detail+ ' - ' + productType;
			}
			var hash = window.location.href;
			var clientId;
			if (hash.indexOf('?') != -1) {
				var hashInfo = hash.split('?');
				var tempDetail = hashInfo[1].split('&');
				if (tempDetail) {
					clientId = tempDetail[0].indexOf("=") != -1 ? tempDetail[0].split('=')[1] : "";

					if(clientId.indexOf('|') != -1){
						clientId = clientId.split('|')[0]
					}
				}
			}


			// @class Cart.Confirmation.View.Context
			return {
				// @property {LiveOrder.Line.Model} model
				model: this.model
				// @property {ImageContainer} thumbnail
			,	thumbnail: thumbnailObj  //13/09/2019 saad 
				// @property {Boolean} showQuantity
			,	showQuantity: (item.get('_itemType') !== 'GiftCert') && (this.model.get('quantity') > 0)
				// @property {String} itemName
			,	itemName: itemName
			,	showFitProfileError: this.options.application.noFitProfile // 20/11/2019 Umar Zulfiqar: {RFQ:Shopping Cart Confirmation Modal - Show warning on No Fit Profile}
			,	clientId: clientId
			};
		}

		// @class Cart.Confirmation.View
	});

});
