

define('TrainingGuides.View',
[
'Backbone'
,'training_guide.tpl'
,'underscore'
],function(Backbone,training_guide_tpl,_){


     return Backbone.View.extend({
        template: training_guide_tpl
    ,	title: _('Training Guides').translate()
    ,	page_header: _('Training Guides').translate()
    ,	attributes: {'class': 'trainingGuides'}
    , events: {

    }
    ,	initialize: function (options)
		{
			this.options = options;
			this.application = options.application;
		}

		,	getSelectedMenu: function ()   //13/09/2019 saad
		{
			return 'trainingguides';
		}
    ,	getBreadcrumbPages: function ()	//13/09/2019 saad
		{
			return {
				text: this.title
			,	href: '/trainingguides'
			};
		}


	,	showContent: function ()
		{
			this.application.getLayout().showContent(this, 'training_guide', [{
				text: this.title
			,	href: '/trainingguides'
			}]);
		}
});

});