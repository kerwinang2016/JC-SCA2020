/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module GlobalViews.Pagination.View
define(
	'GlobalViews.Measure.Form.View'
,	[	'global_measure_form.tpl'

	,	'Backbone'
	,	'underscore'
	]
,	function(
		global_measure_form_tpl
	,	Backbone
	,	_
	)
{
	// @class GlobalViews.Measure.Form.View @extends Backbone.View
	return Backbone.View.extend({

		template: global_measure_form_tpl
	,	initialize: function (options)
	{
		this.options = options;
		this.name = options.name;
	}

		// @method getContext @return {GlobalViews.Measure.Form.View.Content}
	,	getContext: function ()
		{
			//@class GlobalViews.Measure.Form.View
			return {				
				//@property {Text} test
				test: this.name
			};
		}
	});
});
