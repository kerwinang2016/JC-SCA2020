/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Transaction.Line.Views
define(
	'Transaction.Line.Views.Option.View'
,	[
		'SC.Configuration'

	,	'Backbone'
	,	'underscore'
	,	'backbone.stickit'
	]
,	function (
		Configuration

	,	Backbone
	,	_
	)
{
	'use strict';

	//@class Transaction.Line.Views.Option.View.initialize
	//@property {Transaction.Line.Model} line
	//@property {String} templateName As this view can be used to show options in all state (selected or to be selected) it is required to specify
	//what template should be used from the list of templates in configuration. If not value is given 'selector' is used, note that this value
	//is used to select option (in the PDP for instance)
	//@property {Backbone.Model<Transaction.Line.Option.Model>} model

	// @class Transaction.Line.Views.Option.View @extends Backbone.View
	return Backbone.View.extend({

		//@initialize initialize Set the option template and values availability
		//@param {Transaction.Line.Views.Option.View.initialize} options
		//@return {Void}
		initialize: function (options)
		{

			this.config = _.findWhere(Configuration.get('ItemOptions.optionsConfiguration', []), {cartOptionId: this.model.get('cartOptionId')}) || {templates:{}};
			this.config.templates = this.config.templates || {};
			this.line_model = this.options.line;
			this.lineId = this.line_model.get('internalid');
			this.clothType = '';

			var item_options_default_templates = Configuration.get('ItemOptions.defaultTemplates', {});

			if (item_options_default_templates && item_options_default_templates.selectorByType)
			{
				// Sets templates for this option
				if (!this.config.templates.selector)
				{
					var option_selector_template = item_options_default_templates.selectorByType[this.model.get('type')]
					,	default_option_selector_template = item_options_default_templates.selectorByType['default'];

					this.config.templates.selector = option_selector_template || default_option_selector_template;
				}
				if (!this.config.templates.selected)
				{
					var selected_option_template = item_options_default_templates.selectedByType[this.model.get('type')]
					,	default_selected_option_template = item_options_default_templates.selectedByType['default'];

					this.config.templates.selected = selected_option_template || default_selected_option_template;
				}
			}

			this.options.templateName = this.options.templateName || 'selector';
			this.template =	this.config.templates[this.options.templateName];
		}

	,	render: function ()
		{
			if (!this.model.get('value') || !this.model.get('value').internalid)
			{
				return this;
			}
			return this._render();
		}

		//@method getContext
		//@returns {Transaction.Line.Views.Option.View.Context}
	,	getContext: function()
		{
			var isShowDesignOption = false, isShowFitProfile = false, isShowCogsContents = false;
			var self = this
			,	selected_value = this.model.get('value') || {}
			,	values = _.map(this.model.get('values') || [], function (value)
				{
					var color = ''
					,	is_color_tile = false
					,	image = {}
					,	is_image_tile = false;

					if (self.model.get('colors'))
					{
						color = self.model.get('colors')[value.label] || self.model.get('colors').defaultColor;
						if (_.isObject(color))
						{
							image = color;
							color = '';
							is_image_tile = true;
						}
						else
						{
							is_color_tile = true;
						}
					}

					//@class ItemOptions.Option.View.Value
					return {
						// @property {String} internalid
						internalid: value.internalid
						// @property {Boolean} isAvailable
					,	isAvailable: value.isAvailable
						// @property {String} label
					,	label: value.label
						// @property {Boolean} isActive
					,	isActive: value.internalid === selected_value.internalid
						// @property {String} color
					,	color: color
						// @property {Boolean} isColorTile
					,	isColorTile: is_color_tile
						// @property {Boolean} isImageTile
					,	isImageTile: is_image_tile
						// @property {Object} image
					,	image: image
						// @property {Boolean} isLightColor
					,	isLightColor: _.contains(Configuration.get('layout.lightColors',[]), value.label)
					};
					//@class Transaction.Line.Views.Option.View
				});

			selected_value = _.extend({}, selected_value, _.findWhere(values, {internalid: selected_value.internalid}) || {});
			selected_value.label = selected_value.label || selected_value.internalid;
			if(this.model.get('cartOptionId').indexOf('custcol_fabric_quantity') != -1){
				
			}
			if(this.options.productType == '3-Piece-Suit' && this.model.get('cartOptionId') == 'custcol_designoptions_waistcoat'){
				isShowDesignOption = true;
				isShowFitProfile = true;
				isShowCogsContents = true;
			}

			if(this.options.productType == '2-Piece-Suit' && this.model.get('cartOptionId') == 'custcol_designoptions_trouser'){
				isShowDesignOption = true;
				isShowFitProfile = true;
				isShowCogsContents = true;
			}
			if(this.options.productType == 'L-3PC-Suit' && this.model.get('cartOptionId') == 'custcol_designoptions_ladiesskirt'){
				isShowDesignOption = true;
				isShowFitProfile = true;
				isShowCogsContents = true;
			}
			if(this.options.productType == 'L-2PC-Skirt' && this.model.get('cartOptionId') == 'custcol_designoptions_ladiesskirt'){
				isShowDesignOption = true;
				isShowFitProfile = true;
				isShowCogsContents = true;
			}
			if(this.options.productType == 'L-2PC-Pants' && this.model.get('cartOptionId') == 'custcol_designoptions_ladiespants'){
				isShowDesignOption = true;
				isShowFitProfile = true;
				isShowCogsContents = true;
			}

			if(this.options.productType != '2-Piece-Suit' && this.options.productType != '3-Piece-Suit' && this.options.productType != 'L-3PC-Suit' && this.options.productType != 'L-2PC-Skirt' && this.options.productType != 'L-2PC-Pants' && this.model.get('cartOptionId').indexOf('custcol_designoptions') != -1){
				isShowDesignOption = true;
				isShowFitProfile = true;
				isShowCogsContents = true;
			}
			if(this.model.get('cartOptionId').indexOf('custcol_avt_date_needed') != -1){
				if(selected_value.label != '1/1/1900'){
					var temp = selected_value.label.split('/');
					selected_value.label = temp[2] + '-' + temp[1] + '-' + temp[0];
				} else {
					selected_value.label = '';
				}
			}

			if(this.model.get('cartOptionId').indexOf('custcol_expected_delivery_date') != -1){
				var temp = selected_value.label.split('/');
				selected_value.label = temp[2] + '-' + temp[1] + '-' + temp[0]
			}

			if (this.options.expectedDateFlag || this.options.clientNameFlag) {
				if (!window.clientInfo) {
					window.clientInfo = [];
					window.lineIdTrack = [];

					window.clientInfo.push({
						lineId: this.lineId,
						clientId: this.options.client_Id,
						itemId: this.options.itemInternalId,
						customerId: this.options.customerId
					});
					window.lineIdTrack.push(this.lineId);
				} else {
					if (window.lineIdTrack.indexOf(this.lineId) == -1) {
						window.clientInfo.push({
							lineId: this.lineId,
							clientId: this.options.client_Id,
							itemId: this.options.itemInternalId,
							customerId: this.options.customerId
						});
						window.lineIdTrack.push(this.lineId);
					}
				}
			}

			var urlPathname = window.location.pathname;
			var completeUrl = window.location.href;
			var isNotCheckOutPage = urlPathname.indexOf('checkout') == -1 ? true : false
			var isNotPurchasesPage = completeUrl.indexOf('purchases') == -1 ? true : false
			var isProductListPage = completeUrl.indexOf('wishlist') != -1 ? true : false
			// @class Transaction.Line.Views.Option.View.Context
			return {
				// @property {Transaction.Line.Option.Model} model
				model: this.model
				// @property {Array<ItemOptions.Option.View.Value>} values
			,	values: values
				// @property {Boolean} showSelectedValue
			,	showSelectedValue: !!selected_value
				// @property {Boolean} isMandatory
			,	isMandatory: this.model.get('isMandatory')
				// @property {String} itemOptionId
			,	itemOptionId: this.model.get('itemOptionId')
				// @property {String} cartOptionId
			,	cartOptionId: this.model.get('cartOptionId')
				// @property {String} label
			,	label: this.config && this.config.label ||  this.model.get('label')
				// @property {ItemViews.Option.View.Option} selectedValue
			,	selectedValue: selected_value
				// @property {Boolean} isTextArea
			,	isTextArea: this.model.get('type') === 'textarea'
				// @property {Boolean} isEmail
			,	isEmail: this.model.get('type') === 'email'
				// @property {Boolean} isText
			,	isText: this.model.get('type') === 'text'
				// @property {Boolean} isSelect
			,	isSelect: this.model.get('type') === 'select'
				// @property {Boolean} isCheckbox
			,	isCheckbox: this.model.get('type') === 'checkbox'
				// @property {Boolean} idDate
			,	isDate: this.model.get('type') === 'date'
				// @property {String} htmlId
			,	htmlId: 'option-' + this.model.get('cartOptionId')
				// @property {String} htmlIdContainer
			,	clothType : this.clothType
			,	lineId: this.lineId
			,	htmlIdContainer: this.model.get('cartOptionId') + '-container'
			,	isProductType: this.model.get('cartOptionId') == 'custcol_producttype' ? true : false
			,	isTailorClient: (this.model.get('cartOptionId') == 'custcol_tailor_client_name'  && isNotCheckOutPage) == true ? true : false
			,	isDateNeeded: (this.model.get('cartOptionId') == 'custcol_avt_date_needed'  && isNotCheckOutPage == true)  ? true : false
			,	isDesignOption: (this.model.get('cartOptionId').indexOf('custcol_designoptions') != -1  && isNotCheckOutPage == true)  ? true : false
			,	isFitProfile: (this.model.get('cartOptionId').indexOf('custcol_fitprofile') != -1  && isNotCheckOutPage == true)  ? true : false
			,	isExpectedDate: (this.model.get('cartOptionId').indexOf('custcol_expected_delivery_date') != -1 && isNotCheckOutPage) == true  ? true : false
			,	isExpectedDateFlag: (this.model.get('cartOptionId').indexOf('custcol_producttype') != -1 && this.options.expectedDateFlag  && isNotCheckOutPage) == true  ? true : false
			,	isclientName: (this.model.get('cartOptionId').indexOf('custcol_tailor_client_name') != -1 && isNotCheckOutPage == true)  ? true : false
			,	isclientNameFlag: (this.model.get('cartOptionId').indexOf('custcol_producttype') != -1 && this.options.clientNameFlag && isNotCheckOutPage == true)  ? true : false
			,	isFabricQty: !isProductListPage && (this.model.get('cartOptionId').indexOf('custcol_fabric_quantity') != -1  && isNotCheckOutPage == true)  ? true : false
			,	isShowDesignOption: isNotCheckOutPage ? isShowDesignOption : false
			,	isShowFitProfile: !isProductListPage && isShowFitProfile ? true : false
			,	designOptionsHtmlContent: this.options.designOptionsHtmlContent
			,	fitProfileOptionHtmlContent: this.options.fitProfileOptionHtmlContent
			,	isProductList: !this.options.isProductList
			,	client_Id: this.options.client_Id
			,	cogsHtmlContent: (isShowCogsContents && this.options.cogsHtmlContent && isNotPurchasesPage && !isProductListPage) ? this.options.cogsHtmlContent : false
			,	flagComment: (this.model.get('cartOptionId').indexOf('custcol_flag_comment') != -1  && isNotCheckOutPage == true)  ? true : false   //29/08/2019 Saad SAAD
			};
			// @class Transaction.Line.Views.Option.View
		}
	});
});
