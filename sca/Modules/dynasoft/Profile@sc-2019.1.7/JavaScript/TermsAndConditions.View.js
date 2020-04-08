
define('TermsAndConditions.View',
[
'Backbone'
,'terms_and_conditions.tpl'
,'underscore'
],function(Backbone,terms_and_conditions_tpl,_){


     return Backbone.View.extend({
        template: terms_and_conditions_tpl 
    ,	title: _('Terms and Conditions').translate()
    ,	attributes: {'class': 'TermsandConditions'}
    , events: {

    }
    , initialize: function(options){
        this.application = options.application;
    }

    ,	getSelectedMenu: function ()   //13/09/2019 saad
		{
			return 'termsandconditions';
		}
    ,	getBreadcrumbPages: function () //13/09/2019 saad
		{
			return {
				text: this.title
			,	href: '/termsandconditions'
			};
		}
});

});