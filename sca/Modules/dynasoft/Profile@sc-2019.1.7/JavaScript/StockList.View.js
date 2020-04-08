
define('StockList.View',
[
'Backbone'
,'stock_list.tpl'
,'underscore'
,'Profile.Model'
,'SC.Configuration' 
],function(Backbone,stock_list_tpl,_,ProfileModel, Configuration){


     return Backbone.View.extend({
        template: stock_list_tpl
    ,	title: _('Stock List').translate()
    ,	attributes: {'class': 'StockListView'}
    , events: {

    }
    , initialize: function(options){
        this.application = options.application;
        this.profile_model = ProfileModel.getInstance(); 
    } 
    ,	getSelectedMenu: function ()   //13/09/2019 saad
		{
			return 'stocklist';
		}
    ,	getBreadcrumbPages: function () //13/09/2019 saad
		{
			return {
				text: this.title
			,	href: '/stocklist'
			};
		}

    	//@method getContext @return {Balance.View.Context}
	,	getContext: function () 
    {
        var stocklist = _.map(this.profile_model.get("stocklist"), function(stock){
            if(!_.isEmpty(stock.file)){
                stock.stocklink = window.location.origin+"/app/site/hosting/scriptlet.nl?script=213&deploy=1&compid=3857857&h=272f4e9a8e3a11190698&action=downloadstocklist&id="+stock.file;
            }
            return stock;
        });
        //@class Balance.View.Context
        return {
            //@property {Profile.Model} model
            stocklist: stocklist
        }
    }
});

});