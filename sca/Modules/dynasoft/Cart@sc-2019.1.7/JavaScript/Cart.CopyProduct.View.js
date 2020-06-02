/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Cart
define('Cart.CopyProduct.View'
,	[
		'Backbone.CompositeView'
	,	'Item.Model'
	,	'cart_copyproduct_modal.tpl'

	,	'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function (
		BackboneCompositeView
	,	ItemDetailsModel
	,	cart_confirmation_modal_tpl

	,	Backbone
	,	_
	, Utils
	)
{
	'use strict';

	return Backbone.View.extend({

		// @property {Function} template
		template: cart_confirmation_modal_tpl

		// @property {String} title
	,	title: _('Copy Item').translate()  //16/12/2019 saad

	,	modalClass: 'global-views-modal-small'

		// @property {String} page_header
	,	page_header: _('Copy Product').translate()		//16/12/2019 saad

		// @property {Object} attributes
	,	attributes: {
			'id': 'Cart.CopyProduct.View'
		,	'class': 'copy-product-modal shopping-cart-modal'
		}

	,	events: {
			'click [data-action="copy-products"]' : 'copyProducts'
		}
		// @method initialize
	,	initialize: function (options){
			var self = this;
			this.productType = options.productType;
			this.selected_options = options.selected_options;
			this.application = options.application;
			this.item = options.item;
			this.model = options.model;
			jQuery.get(_.getAbsoluteUrl('javascript/extraQuantity.json')).done(function (data) {
					self.extraQuantity = data;
			});

			jQuery.get(_.getAbsoluteUrl('services/BlockQuantity.Service.ss')).done(function (data) {
				self.blockQuantity = data;
			});
			BackboneCompositeView.add(this);
		}
	,	destroy: function destroy (){
			this._destroy();
		}
	, copyProducts: function (e){
			e.preventDefault();

			var self = this;
			jQuery(".cart-copyproduct-modal-details input[type=checkbox]:checked").each(function(x,y){
				var pt = y.name;
				var option_values = []
				var selected_options = JSON.parse(JSON.stringify(self.selected_options.models));
				var selected_item = self.item.get('item');
				var selected_item_internalid = selected_item.get('internalid');
				var item_detail = self.getItemForCart(selected_item_internalid, self.item.get('quantity'));

				var d = _.find(selected_options,function(data){
					return data.cartOptionId == "custcol_producttype";
				});
				d.value = {
					internalid: pt,
					label: pt
				}
				var fpsummary = _.find(selected_options,function(data){
					return data.cartOptionId == "custcol_fitprofile_summary";
				});

				var fpsummaryval = JSON.parse(fpsummary.value.internalid);
				var fitprofile = _.filter(fpsummaryval,function(v){return v.name == pt;});
				fpsummary.value ={
					internalid: JSON.stringify(fitprofile),
					label:  JSON.stringify(fitprofile)
				};
				var fabricExtra = _.find(selected_options,function(data){
					return data.cartOptionId == "custcol_fabric_extra";
				});
				var fabricQuantity = _.find(selected_options,function(data){
					return data.cartOptionId == "custcol_fabric_quantity";
				});

				switch(self.productType){
					case '3-Piece-Suit':
							if(pt == 'Jacket'){
								for(var i = 0; i < selected_options.length; i++){
									if (selected_options[i].cartOptionId == "custcol_designoptions_waistcoat" ||
											selected_options[i].cartOptionId == "custcol_designoptions_trouser" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_trouser" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_waistcoat" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_trouser_in" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_waistcoat_in") {
											selected_options[i].value ={
												internalid: "",
												label: ""
											};
									}
								}
								var dop = _.find(selected_options,function(data){
									return data.cartOptionId == "custcol_designoptions_jacket";
								});
								var correctQuantity = self.getUpdatedQuantity(pt, fitprofile,fabricExtra.value.internalid, dop.value.internalid);
								fabricQuantity.value ={
									internalid: correctQuantity,
									label:  correctQuantity
								};
							}
							else if(pt=='Trouser'){
								for(var i = 0; i < selected_options.length; i++){
									if (selected_options[i].cartOptionId == "custcol_designoptions_waistcoat" ||
											selected_options[i].cartOptionId == "custcol_designoptions_jacket" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_jacket" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_waistcoat" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_jacket_in" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_waistcoat_in") {
											selected_options[i].value ={
												internalid: "",
												label: ""
											};
									}
								}
								var dop = _.find(selected_options,function(data){
									return data.cartOptionId == "custcol_designoptions_trouser";
								});
								var correctQuantity = self.getUpdatedQuantity(pt, fitprofile,fabricExtra.value.internalid, dop.value.internalid);
								fabricQuantity.value ={
									internalid: correctQuantity,
									label:  correctQuantity
								};
							}
							else if(pt=='Waistcoat'){
								for(var i = 0; i < selected_options.length; i++){
									if (selected_options[i].cartOptionId == "custcol_designoptions_trouser" ||
											selected_options[i].cartOptionId == "custcol_designoptions_jacket" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_jacket" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_trouser" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_jacket_in" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_trouser_in") {
											selected_options[i].value ={
												internalid: "",
												label: ""
											};
									}
								}
								var dop = _.find(selected_options,function(data){
									return data.cartOptionId == "custcol_designoptions_waistcoat";
								});
								var correctQuantity = self.getUpdatedQuantity(pt, fitprofile,fabricExtra.value.internalid, dop.value.internalid);
								fabricQuantity.value ={
									internalid: correctQuantity,
									label:  correctQuantity
								};
							}
						break;
					case '2-Piece-Suit':
							if(pt == 'Jacket'){
								for(var i = 0; i < selected_options.length; i++){
									if (selected_options[i].cartOptionId == "custcol_designoptions_trouser" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_trouser" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_trouser_in") {
											selected_options[i].value ={
												internalid: "",
												label: ""
											};
									}
								}
								var dop = _.find(selected_options,function(data){
									return data.cartOptionId == "custcol_designoptions_jacket";
								});
								var correctQuantity = self.getUpdatedQuantity(pt, fitprofile,fabricExtra.value.internalid, dop.value.internalid);
								fabricQuantity.value ={
									internalid: correctQuantity,
									label:  correctQuantity
								};
							}
							else if(pt=='Trouser'){
								for(var i = 0; i < selected_options.length; i++){
									if (selected_options[i].cartOptionId == "custcol_designoptions_jacket" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_jacket" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_jacket_in") {
											selected_options[i].value ={
												internalid: "",
												label: ""
											};
									}
								}
								var dop = _.find(selected_options,function(data){
									return data.cartOptionId == "custcol_designoptions_trouser";
								});
								var correctQuantity = self.getUpdatedQuantity(pt, fitprofile,fabricExtra.value.internalid, dop.value.internalid);
								fabricQuantity.value ={
									internalid: correctQuantity,
									label:  correctQuantity
								};
							}
						break;
					case 'L-2PC-Skirt':
							if(pt == 'Ladies-Jacket'){
								for(var i = 0; i < selected_options.length; i++){
									if (selected_options[i].cartOptionId == "custcol_designoptions_ladiesskirt" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_ladiesskirt" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_ladiesskirt_in") {
											selected_options[i].value ={
												internalid: "",
												label: ""
											};
									}
								}
								var dop = _.find(selected_options,function(data){
									return data.cartOptionId == "custcol_designoptions_ladiesjacket";
								});
								var correctQuantity = self.getUpdatedQuantity(pt, fitprofile,fabricExtra.value.internalid, dop.value.internalid);
								fabricQuantity.value ={
									internalid: correctQuantity,
									label:  correctQuantity
								};
							}
							else if(pt=='Ladies-Skirt'){
								for(var i = 0; i < selected_options.length; i++){
									if (selected_options[i].cartOptionId == "custcol_designoptions_ladiesjacket" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_ladiesjacket" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_ladiesjacket_in") {
											selected_options[i].value ={
												internalid: "",
												label: ""
											};
									}
								}
								var dop = _.find(selected_options,function(data){
									return data.cartOptionId == "custcol_designoptions_ladiesskirt";
								});
								var correctQuantity = self.getUpdatedQuantity(pt, fitprofile,fabricExtra.value.internalid, dop.value.internalid);
								fabricQuantity.value ={
									internalid: correctQuantity,
									label:  correctQuantity
								};
							}
						break;
					case 'L-2PC-Pants':
							if(pt == 'Ladies-Jacket'){
								for(var i = 0; i < selected_options.length; i++){
									if (selected_options[i].cartOptionId == "custcol_designoptions_ladiespants" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_ladiespants" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_ladiespants_in") {
											selected_options[i].value ={
												internalid: "",
												label: ""
											};
									}
								}
								var dop = _.find(selected_options,function(data){
									return data.cartOptionId == "custcol_designoptions_ladiesjacket";
								});
								var correctQuantity = self.getUpdatedQuantity(pt, fitprofile,fabricExtra.value.internalid, dop.value.internalid);
								fabricQuantity.value ={
									internalid: correctQuantity,
									label:  correctQuantity
								};
							}
							else if(pt=='Ladies-Pants'){
								for(var i = 0; i < selected_options.length; i++){
									if (selected_options[i].cartOptionId == "custcol_designoptions_ladiesjacket" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_ladiesjacket" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_ladiesjacket_in") {
											selected_options[i].value ={
												internalid: "",
												label: ""
											};
									}
								}
								var dop = _.find(selected_options,function(data){
									return data.cartOptionId == "custcol_designoptions_ladiespants";
								});
								var correctQuantity = self.getUpdatedQuantity(pt, fitprofile,fabricExtra.value.internalid, dop.value.internalid);
								fabricQuantity.value ={
									internalid: correctQuantity,
									label:  correctQuantity
								};
							}
						break;
					case 'L-3PC-Suit':
							if(pt == 'Ladies-Jacket'){
								for(var i = 0; i < selected_options.length; i++){
									if (selected_options[i].cartOptionId == "custcol_designoptions_ladiesskirt" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_ladiesskirt" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_ladiesskirt_in" ||
											selected_options[i].cartOptionId == "custcol_designoptions_ladiespants" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_ladiespants" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_ladiespants_in") {
											selected_options[i].value ={
												internalid: "",
												label: ""
											};
									}
								}
								var dop = _.find(selected_options,function(data){
									return data.cartOptionId == "custcol_designoptions_ladiesjacket";
								});
								var correctQuantity = self.getUpdatedQuantity(pt, fitprofile,fabricExtra.value.internalid, dop.value.internalid);
								fabricQuantity.value ={
									internalid: correctQuantity,
									label:  correctQuantity
								};
							}
							else if(pt=='Ladies-Skirt'){
								for(var i = 0; i < selected_options.length; i++){
									if (selected_options[i].cartOptionId == "custcol_designoptions_ladiesjacket" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_ladiesjacket" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_ladiesjacket_in" ||
											selected_options[i].cartOptionId == "custcol_designoptions_ladiespants" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_ladiespants" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_ladiespants_in") {
											selected_options[i].value ={
												internalid: "",
												label: ""
											};
									}
								}
								var dop = _.find(selected_options,function(data){
									return data.cartOptionId == "custcol_designoptions_ladiesskirt";
								});
								var correctQuantity = self.getUpdatedQuantity(pt, fitprofile,fabricExtra.value.internalid, dop.value.internalid);
								fabricQuantity.value ={
									internalid: correctQuantity,
									label:  correctQuantity
								};
							}
							else if(pt=='Ladies-Pants'){
								for(var i = 0; i < selected_options.length; i++){
									if (selected_options[i].cartOptionId == "custcol_designoptions_ladiesjacket" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_ladiesjacket" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_ladiesjacket_in" ||
											selected_options[i].cartOptionId == "custcol_designoptions_ladiesskirt" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_ladiesskirt" ||
											selected_options[i].cartOptionId == "custcol_fitprofile_ladiesskirt_in") {
											selected_options[i].value ={
												internalid: "",
												label: ""
											};
									}
								}
								var dop = _.find(selected_options,function(data){
									return data.cartOptionId == "custcol_designoptions_ladiespants";
								});
								var correctQuantity = self.getUpdatedQuantity(pt, fitprofile,fabricExtra.value.internalid, dop.value.internalid);
								fabricQuantity.value ={
									internalid: correctQuantity,
									label:  correctQuantity
								};
							}
						break;
				}
				var add_to_cart_promise = self.copyItemToCart(item_detail, selected_options);
			});
			self.options.application.getLayout().closeModal();
		}
		, getUpdatedQuantity: function(productType, fitProfileSummary, fabricextra,dop){
			// 1. product type block size
			// 2. extra quantity
			// 3. design options
				var item = productType, self = this;
				var qty = 0;
				for (var i = 0; i < fitProfileSummary.length; i++) {
						if (fitProfileSummary[i].value){
								if(fitProfileSummary[i].blockvalue){
										var bq = _.find(this.blockQuantity,function(q){
											return q.custrecord_bqm_producttext == fitProfileSummary[i].value && q.custrecord_bqm_block == fitProfileSummary[i].blockvalue;
										})
										if(bq){
											if(qty < parseFloat(bq.custrecord_bqm_quantity))
												qty = parseFloat(bq.custrecord_bqm_quantity);
										}
								}
						}
				}
				var extra = 0;
				var extraQuantityCodes = _.find(self.extraQuantity[1].values,function(temp){
					return temp.code == productType;
				});
				if(extraQuantityCodes){
						var val = _.find(extraQuantityCodes.design,function(temp2){
							return temp2.code == fabricextra
						});
						if(val && val.value != "")
							extra = parseFloat(val.value);
				}
				for (var i = 0; i < fitProfileSummary.length; i++) {
					var ptype = fitProfileSummary[i].name;
					var designQuantityCodes = _.find(self.extraQuantity[0].values,function(temp){
						return temp.code == productType;
					});
					if(designQuantityCodes){
					_.each(JSON.parse(dop),function(temp){
						var val = _.find(designQuantityCodes.design,function(temp2){
							return temp2.code == temp.value
						});
						if(val && val.value != "")
							extra+= parseFloat(val.value);
						});
					}
				}
				return (qty + extra).toFixed(2);
		}
	,	copyItemToCart: function (item, options)
		{
			//return this.cart.addItem(item);
			return this.model.addItem(item, options);
		}
	,	getItemForCart: function (id, qty, opts)
		{
			return new ItemDetailsModel({
				internalid: id
			,	quantity: qty
			,	options: opts
			});
		}

		// @method getContext
		//
	,	getContext: function()
		{
			var producttypes = [];
			switch(this.productType){
				case '3-Piece-Suit':
					producttypes = [{name:'3-Piece-Suit'},{name:'Jacket'},{name:'Trouser'},{name:'Waistcoat'}]; break;
				case '2-Piece-Suit':
					producttypes = [{name:'2-Piece-Suit'},{name:'Jacket'},{name:'Trouser'}]; break;
				case 'L-2PC-Skirt':
					producttypes = [{name:'L-2PC-Skirt'},{name:'Ladies-Jacket'},{name:'Ladies-Skirt'}]; break;
				case 'L-2PC-Pants':
					producttypes = [{name:'L-2PC-Pants'},{name:'Ladies-Jacket'},{name:'Ladies-Pants'}]; break;
				case 'L-3PC-Suit':
					producttypes = [{name:'L-3PC-Suit'},{name:'Ladies-Jacket'},{name:'Ladies-Pants'},{name:'Ladies-Skirt'}]; break;
			}
			return {
					model: this.model
				, producttypes: producttypes

			};
		}

		//
	});

});
