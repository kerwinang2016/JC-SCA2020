define(
	'OrderHistoryRecords.View'
,	[	'RecordViews.View'
	,	'orderhistoryRecordsView.tpl'
	,	'underscore'
	]
,	function (
		RecordViewsView
	,	orderhistoryRecordsView_tpl
	,	_
	)
{
	'use strict';

	return RecordViewsView.extend({

		//@property {Function} template
		template: orderhistoryRecordsView_tpl

		//@method initialize
		//@param {RecordViews.Actionable.View.Initialize} options
		//@return {Void}
	,	initialize: function ()
		{
			RecordViewsView.prototype.initialize.apply(this, arguments);
		}

		//@property {Object} childViews Override the base property by adding a default Action.View composite View
	,	childViews: {
			'Action.View': function ()
			{
				var action_options = _.extend({
						model: this.model
					}, this.options.actionOptions || {})
				,	view = this.options.actionView;

				return new view(action_options);
			}
		}

	,	getContext: function ()
		{
			return {				

				model: this.model
				//@property {String} id
			,	id: this.model.id
				//@property {String} touchpoint
			,	touchpoint: this.model.get('touchpoint') || 'customercenter'
				//@property {Boolean} isNavigable
			,	isNavigable: _.isBoolean(this.model.get('isNavigable')) ? this.model.get('isNavigable') : true
				//@property {String} detailsURL
			,	detailsURL: this.model.get('detailsURL')
				//@property {String} title
			,	title: this.model.get('title')

				//@property {String} actionTitle
			,	actionTitle: this.model.get('actionTitle')

				//@property {Array<RecordViews.View.Column>} columns
			,	columns: this.normalizeColumns()

			,	recordType: this.model.get('recordType')

			};
		}
	});

});
