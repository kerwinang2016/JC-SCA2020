
define('UstyylitApplications.View',
  [
      'Backbone'
    , 'ustyylitapplications.tpl'
    , 'underscore'
    ], function(
      Backbone
    , ustyylitapplications_tpl
    , _
    ){

   return  Backbone.View.extend({
      template: ustyylitapplications_tpl
    ,	title: 'Applications'
    ,	attributes: {'class': 'ustyylitapplications'}
    , events: {

    }
    , initialize: function(options){
        this.application = options.application;
        var responseJSON = jQuery.ajax({
          url: _.getAbsoluteUrl('services/UstyylitApplications.Service.ss'),
          type: 'get',
          dataType: 'json',
          async: false
        }).responseJSON;
        this.customerliningurl = JSON.parse(responseJSON[0]).url;
        this.stylecarturl = JSON.parse(responseJSON[1]).url;
    }
    , getContext:function (){
      return {
					customerliningurl : this.customerliningurl
				,	stylecarturl: this.stylecarturl
			}
    }
  });

});
