/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Facets
define('Facets.Model'
,	[	'Backbone.CachedModel'
	,	'Item.Collection'
	,	'Session'
	,	'Profile.Model'
	,	'SC.Configuration'

	,	'underscore'
	,	'Utils'
	]
,	function (
		BackboneCachedModel
	,	ItemCollection
	,	Session
	,	ProfileModel
	,	Configuration

	,	_
	,	Utils
	)
{
	'use strict';

	var original_fetch = BackboneCachedModel.prototype.fetch;

	// @class Facets.Model @extends Backbone.CachedModel
	// Connects to the search api to get all the items and the facets
	// A Model Contains a Collection of items and the list of facet groups with its values
	return BackboneCachedModel.extend({

		options: {}

	,	searchApiMasterOptions: Configuration.get('searchApiMasterOptions.Facets', {})

	,	url: function()
		{
			var profile = ProfileModel.getInstance()
			,	url = _.addParamsToUrl(
				profile.getSearchApiUrl()
			,	_.extend(
					(Configuration.get('matrixchilditems.enabled') && Configuration.get('matrixchilditems.fieldset')) ? {
						matrixchilditems_fieldset: Configuration.get('matrixchilditems.fieldset')
					} : {}
				,	this.searchApiMasterOptions
				,	Session.getSearchApiParams()
				)
			,	profile.isAvoidingDoubleRedirect()
			);

			return url;
		}

	,	initialize: function (options)
		{
			if (options && options.searchApiMasterOptions)
			{
				this.searchApiMasterOptions = options.searchApiMasterOptions;
			}

			if(window.location.href.indexOf('keywords')!=-1)
			{
			// Listen to the change event of the items and converts it to an ItemCollection
				this.on('change:items', function (model, items)
				{
					if (!(items instanceof ItemCollection))
					{
						// NOTE: Compact is used to filter null values from response
						model.set('items', new ItemCollection(_.compact(items)));
					}
				});
			}
			else if(window.location.href.indexOf('search')!=-1 || window.location.href.indexOf('custitem_vendor_name')!=-1 || window.location.href.indexOf('custitem_fabric_color')!=-1)
			{
				this.on('change:items', function (model, items)
				{
					if (!(items instanceof ItemCollection))
					{
						// NOTE: Compact is used to filter null values from response
						model.set('items', new ItemCollection(_.compact(items)));
					}
				});
			}
		}

		// @method fetch overrides fetch so we make sure that the cache is set to true, so we wrap it
	,	fetch: function (options)
		{
			Utils.deepExtend(options || {}, this.options);
			if(options.cache === undefined) {
				options.cache = true;
			}
			return original_fetch.apply(this, arguments);
		}
	});
});
