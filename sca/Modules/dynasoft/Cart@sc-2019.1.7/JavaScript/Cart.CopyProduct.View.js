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
			var scriptId = "customscript_ps_sl_set_scafieldset",
			deployId = "customdeploy_ps_sl_set_scafieldset";
			Utils.requestUrl(scriptId, deployId, "GET", {type: "get_block_quantity_measurement_mapping"}).always(function(data){
					self.blockQuantityMeasurementData = JSON.parse(data)[0] || {};
			});
			var url = Utils.getAbsoluteUrl('javascript/extraQuantity.json');
			jQuery.ajax({
				url: url,
				type: 'get',
				async: false,
				success: function(data){
					this.extraQuantity = data;
				}
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
				console.log(selected_options);
				var d = _.find(selected_options,function(data){
					return data.cartOptionId == "custcol_producttype";
				});
				d.value = {
					internalid: pt,
					label: pt
				}
				var f = _.find(selected_options,function(data){
					return data.cartOptionId == "custcol_fitprofile_summary";
				});

				var val = JSON.parse(f.value.internalid);
					var newval = _.filter(val,function(v){return v.name == pt;});
					f.value ={
						internalid: JSON.stringify(newval),
						label:  JSON.stringify(newval)
					};

				switch(self.productType){
					case '3-Piece-Suit':
						var g = _.find(selected_options,function(data){
							return data.cartOptionId == "custcol_fabric_quantity";
						});
						var qty = 0;
						// var correctQuantity = this.updateQuantity(self.item,selected_options, pt, newval);
						// g.value ={
						// 	internalid: correctQuantity,
						// 	label:  correctQuantity
						// });
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
								}}
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
								}}
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
								}}
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
								}}
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
							}
						break;
				}
				console.log(selected_options);
				var add_to_cart_promise = self.copyItemToCart(item_detail, selected_options);
			});
			self.options.application.getLayout().closeModal();
		}
		, updateQuantity: function(model, selected_options, productType, fitprofileSummary){
				var item = productType;
				var qty = 0;
				console.log(productType);
				console.log(fitProfileSummary);
				console.log(this.blockQuantityMeasurementData);
				for (var i = 0; i < fitProfileSummary.length; i++) {
						var profileID = fitProfileSummary[i].value;
						if (fitProfileSummary[i].value){
								if(fitProfileSummary[i].block){
										var bq = _.find(this.blockQuantityMeasurementData,function(q){
											return q.custrecord_bqm_producttext == item && q.custrecord_bqm_block == fitProfileSummary[i].block;
										})
										if(bq){
											if(qty < parseFloat(bq.custrecord_bqm_quantity))
												qty = parseFloat(bq.custrecord_bqm_quantity);
										}
								}
						}
				}
				var extra = 0;
				if(jQuery('#fabric_extra').val() != "" && jQuery('#fabric_extra').val() != "Please Select")
					extra = parseFloat(jQuery('#fabric_extra').val())
				for (var i = 0; i < fitProfileSummary.length; i++) {
					var ptype = fitProfileSummary[i].name;
					var designQuantityCodes = _.find(this.extraQuantity[0].values,function(temp){
						return temp.code == ptype;
					});
					if(designQuantityCodes){
					_.each(jQuery('[data-type="fav-option-customization"]'),function(temp){
						var val = _.find(designQuantityCodes.design,function(temp2){
							return temp2.code == temp.value
						});
						if(val && val.value != "")
							extra+= parseFloat(val.value);
					});
					}
				}
				jQuery('[name="custcol_fabric_quantity"]').val((qty + extra).toFixed(2));
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
