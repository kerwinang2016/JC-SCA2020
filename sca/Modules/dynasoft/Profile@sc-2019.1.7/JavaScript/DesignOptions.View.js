define('DesignOptions.View',
[
    'Backbone'
,   'design_options.tpl'
,   'Profile.Model'
,   'underscore'
,   'jQuery'
,	'Utils'
],function(
    Backbone
,   design_options_tpl
,   ProfileModel
,   _
,   jQuery
,	Utils
)
{

     return  Backbone.View.extend({
       template: design_options_tpl
   ,	title: _('Design Options Restriction').translate()
   ,	page_header: _('Design Options Restriction').translate()
   ,	attributes: {'class': 'DesignOptionsRestrictionView'}
   ,	events: 
        {
            'submit #design_option': 'submitForm'
        }

   ,	initialize: function (options)
		{
            this.profile_model = ProfileModel.getInstance(); 
			this.options = options;
            this.application = options.application;
            this.options_config = options.options_config;
            this.mode = options.mode;
            this.values =  '';
            if(localStorage.getItem('designOption') != null){
                this.values =  JSON.parse(JSON.parse(localStorage.getItem('designOption')));
            } else {
                this.values =  JSON.parse(JSON.parse(this.profile_model.get('designoptionRestrictionData')));
            }
		}
        ,	getSelectedMenu: function ()   //13/09/2019 saad
        {
            return 'designoptions';
        }
        ,	getBreadcrumbPages: function ()	//13/09/2019 saad
        {
            return {
                text: this.title
            ,	href: '/designoptions'
            };
        }

   ,	showContent: function () //6/19/2019 Saad
        {	
            var self = this
			// ,	param = new Object();

			// param.type = "get_designoption_restriction";
			// param.id = this.profile_model.get("internalid");
			// Utils.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "GET", param).always(function(data){
            //     if(data){
			// 		self.values = JSON.parse(JSON.parse(data));
			// 	}	
            // });

            this.application.getLayout().showContent(this, 'designoptionsrestriction', [{
                text: this.title
            ,	href: '/designoptionsrestriction'
            }]);
        }
        
    ,	submitForm: function(e){
			e.preventDefault();
			var formValues = jQuery(e.target).serialize().split("&")
			,	formatValues = []
			,	param = new Object()
			,	self = this;
			_.each(formValues, function(formValue){
				var field = formValue.split("=")[0]
				,	value = formValue.split("=")[1]
				,	formatValue = _.where(formatValues, {name: field});
				value = (!_.isEmpty(value)) ? decodeURIComponent(value.replace(/([+])/g,' ')) : "";
				if(formatValue && formatValue.length){
					formatValue[0].value = formatValue[0].value + "," + value;
				} else {
					formatValue = new Object();
					formatValue.name = field;
					formatValue.value = value;

					formatValues.push(formatValue);
				}
			});
			param.data = JSON.stringify(formatValues);
			param.type = "save_designoption_restriction";
            param.id = this.profile_model.get("internalid");
            
            //6/19/2019 Saad
			Utils.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "POST", param).always(function(data){
				if(data.replace(/\"/g, "") == self.profile_model.get("internalid").toString()){
                    self.values = formatValues;
                    // self.profile_model.set('designoptionRestrictionData', JSON.stringify(JSON.stringify(formatValues)));
                    // self.profile_model.save();
                    localStorage.setItem("designOption", '');
                    localStorage.setItem("designOption", JSON.stringify(JSON.stringify(formatValues)));
                    self.options.application.getLayout().currentView.showContent(true)
				} else {
					self.showError(_('Your design option restriction was not saved').translate())
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
        ,   values : this.values
        }
    }
   });
});