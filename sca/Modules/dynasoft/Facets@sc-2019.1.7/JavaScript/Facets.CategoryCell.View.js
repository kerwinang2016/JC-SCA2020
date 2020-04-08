/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Facets
define(
	'Facets.CategoryCell.View'
,	[
		'Categories.Utils'

	,	'facets_category_cell.tpl'

	,	'Backbone'
	,	'Utils'
	]
,	function(
		CategoriesUtils

	,	facets_category_cell_tpl

	,	Backbone
	,	Utils
	)
{
	'use strict';

	// @class Facets.CategoryCell.View @extends Backbone.View
	return Backbone.View.extend({

		template: facets_category_cell_tpl

		// @method getContext @return Facets.CategoryCell.View.Context
	,	getContext: function ()
		{
		
			if (Backbone.history.fragment.split("?").length > 1) { //Added salman June-2019
				var fragmentArray = Backbone.history.fragment.split("?")
				,	clientId = "";

				for(var i = fragmentArray.length -1; i >= 0; i--){
					if(fragmentArray[i].match('client')){
						clientId = fragmentArray[i].split("=")[1].split("&")[0];
						break;
					}
				}
			}
			var additionalFields = CategoriesUtils.getAdditionalFields(this.model.attributes, 'categories.subCategories.fields');
			return {
				// @property {String} label
				name: this.model.get('name')
				// @property {String} name
			,	url: this.model.get('fullurl') + '?client=' + clientId
				// @property {String} image
			,	image: this.model.get('thumbnailurl')
				// @property {Boolean} hasImage
			,	hasImage: !!this.model.get('thumbnailurl')
				// @property {Object} additionalFields
			,	additionalFields: additionalFields			
			};
		}
	});
});
