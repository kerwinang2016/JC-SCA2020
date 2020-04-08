define('Facets.Translator.Extension'
,	[	'Facets.Translator'
	,	'underscore'
	,	'jQuery'
	,	'SC.Configuration'
	,	'Utils'
	,	'UrlHelper'
	]
,	function (
		FacetsTranslator
	,	_
	,	jQuery
	,	Configuration
	)
{
	'use strict';

	_.extend(FacetsTranslator.prototype,
		{
		FacetsTranslator (facets, options, configuration, category)
		{
			// Enforces new
			if (!(this instanceof FacetsTranslator))
			{
				return new FacetsTranslator(facets, options, configuration, category);
			}

			// Facets go Here
			this.facets = [];

			// Other options like page, view, etc. goes here
			this.options = {};

			// This is an object that must contain a fallbackUrl and a lists of facet configurations
			this.configuration = configuration || default_config;

			// Get the facets that are in the sitesettings but not in the config.
			// These facets will get a default config (max, behavior, etc.) - Facets.Translator
			// Include facet aliases to be conisdered as a possible route
			var facets_data = Configuration.get('siteSettings.facetfield')
			,	facets_to_include = [];

			_.each(facets_data, function(facet)
			{
				if (facet.facetfieldid !== 'commercecategory')
				{
					facets_to_include.push(facet.facetfieldid);

					// If the facet has an urlcomponent defined, then add it to the possible values list.
					facet.urlcomponent && facets_to_include.push(facet.urlcomponent);

					// Finally, include URL Component Aliases...
					_.each(facet.urlcomponentaliases, function(facet_alias)
					{
						facets_to_include.push(facet_alias.urlcomponent);
					});
				}
			});

			facets_to_include = _.union(facets_to_include, _.pluck(Configuration.get('facets'), 'id'));
			facets_to_include = _.uniq(facets_to_include);

			this.facetsToInclude = facets_to_include;

			this.isCategoryPage = !!category;

			if (_.isBoolean(category) && category)
			{
				var index = facets.length
				,	facetsToInclude = this.facetsToInclude.slice(0)
				,	facets_delimiter = this.configuration.facetDelimiters.betweenDifferentFacets
				,	facet_value_delimiter = this.configuration.facetDelimiters.betweenFacetNameAndValue;

				facetsToInclude.push(this.configuration.facetDelimiters.betweenFacetsAndOptions);

				_.each(facetsToInclude, function(facetname)
				{
					facetname = facets_delimiter + facetname + facet_value_delimiter;
					var i = facets.lastIndexOf(facetname);

					if (i !== -1 && i < index)
					{
						index = i;
					}
				});

				var categoryUrl = facets.substring(0, index);

				facets = facets.substring(index);

				if (categoryUrl[0] !== '/')
				{
					categoryUrl = '/' + categoryUrl;
				}

				if (categoryUrl[categoryUrl.length - 1] === '/')
				{
					categoryUrl = categoryUrl.substring(0, categoryUrl.length - 1);
				}

				if (facets && facets[0] === facets_delimiter)
				{
					facets = facets.substring(1, facets.length);
				}

				this.categoryUrl = categoryUrl;
			}
			else if (_.isString(category))
			{
				this.categoryUrl = category;
			}

			// We cast on top of the passed in parameters.
			if (facets && options)
			{
				this.facets = facets;
				this.options = options;
			}
			else if (_.isString(facets))
			{
				// It's a url
				this.parseUrl(facets);
			}
			else if (facets)
			{
				// It's an API option object
				this.parseOptions(facets);
			}
		}
	});
});