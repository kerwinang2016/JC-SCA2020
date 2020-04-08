
define('ContactUs.View',
[
'Backbone'
,'contact_us.tpl'
,'underscore'
],function(Backbone,contact_us_tpl,_){


     return  Backbone.View.extend({
        template: contact_us_tpl
    ,	title: _('Contact Us').translate()
    ,	attributes: {'class': 'ContactUs'}
    , events: {

    }
    , initialize: function(options){
        this.application = options.application;
    }
    ,	getSelectedMenu: function ()   //13/09/2019 saad
    {
        return 'contactus';
    }
    ,	getBreadcrumbPages: function ()	//13/09/2019 saad
    {
        return {
            text: this.title
        ,	href: '/contactus'
        };
    }
});

});