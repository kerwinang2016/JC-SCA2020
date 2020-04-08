
define('Inventory.View',
[
'Backbone'
,'inventory.tpl'
,'underscore'
],function(Backbone
    ,inventory_tpl
    ,_
    ){


     return  Backbone.View.extend({
        template: inventory_tpl
    ,	title: 'Inventory'
    ,	attributes: {'class': 'Inventory'}
    , events: {

    }
    , initialize: function(options){
        this.application = options.application;
    }
    
});

});