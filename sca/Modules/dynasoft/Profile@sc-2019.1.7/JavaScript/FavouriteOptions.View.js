define('FavouriteOptions.View',
[
    'Backbone'
,   'favourite_options.tpl'
,   'Profile.Model'
,   'underscore'
,   'jQuery'
,	'Utils'
],function(
    Backbone
,   favourite_options_tpl
,   ProfileModel
,   _
,   jQuery
,	Utils
)
{

     return  Backbone.View.extend({
       template: favourite_options_tpl
   ,	title: _('Favourite Options').translate()
   ,	page_header: _('Favourite Options').translate()
   ,	attributes: {'class': 'DesignOptionsRestrictionView'}
   ,    events:
        {
            'submit #design_option': 'submitForm'
        ,	'change select[data-type="fav-option-customization"]' : 'clearMessage'
        }

   ,	initialize: function (options)
		{
            this.profile_model = ProfileModel.getInstance();
			this.options = options;
            this.application = options.application;
            this.options_config = options.options_config;
            this.mode = options.mode;
            this.favouriteOptions =   JSON.parse(JSON.parse(this.profile_model.get('favouriteOptionsData')));
		}
        ,	getSelectedMenu: function ()   //13/09/2019 saad
        {
            return 'favouriteoptions';
        }
        ,	getBreadcrumbPages: function ()	//13/09/2019 saad
        {
            return {
                text: this.title
            ,	href: '/favouriteoptions'
            };
        }

   ,	showContent: function ()
        {
            this.application.getLayout().showContent(this, 'favouriteoptions', [{
                text: this.title
                ,	href: 'favouriteoptions'
            }]);
        }

	,	parseDataParams : function(){
        var rawArray = jQuery("#design_option").serializeArray();

        var favouriteOptionsMap = {};
        for (var i = 0; i < rawArray.length; i++){
            var option = rawArray[i];
            favouriteOptionsMap[option.name] = option.value;
        };

        return JSON.stringify(favouriteOptionsMap);
        }
    ,	clearMessage: function(){
            jQuery("div.alert").remove();
        }
    ,	submitForm: function(e){

            e.preventDefault();
            var	param = new Object()
            ,	self = this;

            param.data = this.parseDataParams();
            param.type = "save_fav_designoption";
            param.id = this.profile_model.get("parent");

            _.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "POST", param).always(function(data){

                if (data.replace(/\"/g, "") == self.profile_model.get("internalid").toString()){

                    self.favouriteOptions = JSON.parse(param.data);
                    self.options.application.getLayout().currentView.showContent();
                } else {
                    //self.showError(_('Your favourite option restriction was not saved').translate())
                }
            });
        }

		// @method getContext @return Profile.Information.View.Context
	,	getContext: function()
    {

        // @class Profile.Information.View.Context
        return {
            // @property {String} pageHeader
            options_config: this.options_config
        ,   mode:  this.mode
        ,   values : this.favouriteOptions ? this.favouriteOptions : ""
        }
    }
   });
});
