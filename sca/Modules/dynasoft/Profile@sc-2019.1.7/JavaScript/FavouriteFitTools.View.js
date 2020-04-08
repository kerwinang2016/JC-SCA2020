
define('FavouriteFitTools.View',
[
    'Backbone'
,   'favourite_fit_tools.tpl'
,   'Profile.Model'
,   'underscore'
,   'jQuery'
,	'Utils'
],function(
    Backbone
,   favourite_fit_tools_tpl
,   ProfileModel
,   _
,   jQuery
,	Utils
)
{

     return  Backbone.View.extend({
        //JHD-11 Start
        template: favourite_fit_tools_tpl
   ,	title: _('Favourite Fit Tools').translate()
   ,	page_header: _('Favourite Fit Tools').translate()
   ,	attributes: {'class': 'FavouriteFitTools'}
   ,    events: {
            'submit #favourite_fit_tools': 'submitFormData'
       ,    'change .block-measurement-fld': 'disableCounterBlockField'
        }

   ,	initialize: function (options)
		{
            this.profile_model = ProfileModel.getInstance();
			this.options = options;
            this.application = options.application;
            this.options_config = options.data;
            this.values = options.values;
            this.paramEvent = options.paramEvent;
            this.selectedItemType = options.selectedItemType;
            this.favFitToolsFlag = options.favFitToolsFlag;
            this.favouriteFitToolDataArr =  JSON.parse(this.profile_model.get('favouriteFitToolData'));
        }
        ,	getSelectedMenu: function ()   //13/09/2019 saad
        {
            return 'favouritefittools';
        }
        ,	getBreadcrumbPages: function ()	//13/09/2019 saad
        {
            return {
                text: this.title
            ,	href: '/favouritefittools'
            };
        }

    ,	showContent: function ()
        {
            this.application.getLayout().showContent(this, 'favourite_fit_tools', [{
                text: this.title
            ,	href: '/favouritefittools'
            }]);
        }

    ,   disableCounterBlockField: function (e) {
            var currentField = jQuery(e.target)
                , counterField = currentField.prop("id").indexOf('-max') > -1 ? currentField.prop("id").replace('-max', '-min') : currentField.prop("id").replace('-min', '-max');

            if (counterField && currentField.val() != "0") {
                jQuery("[id='"+counterField+"']").prop("disabled", true);
            } else {
                jQuery("[id='"+counterField+"']").prop("disabled", false);
            }
        }

    ,	submitFormData: function (e)
        {
            var self = this;
            e.preventDefault();
            jQuery('input:disabled').removeAttr('disabled');
            jQuery('select:disabled').removeAttr('disabled');
            var itemType;
            var regex = new RegExp("\\+","g");
            var formValues = jQuery(e.target).serialize().split("&")
                , self = this
                , dataToSend = new Array()
                , tempMeasurementValues = new Array();
                for(var i =0; i< formValues.length; i++){
                    var formValue = formValues[i];
                    var field = formValue.split("=")[0]
                        , value = formValue.split("=")[1];
                    if(field == 'fav-fit-tools-itemtype'){
                        var obj = {};
                        obj.itemType = value;
                        obj.measurementValues = tempMeasurementValues;
                        dataToSend.push(obj);
                        tempMeasurementValues = [];
                    } else {
                        var measureData = new Object();
                        measureData.name = field;
                        measureData.value = value;
                        tempMeasurementValues.push(measureData);
                    }
                };

                var param = new Object();
                param.data = JSON.stringify(dataToSend);
                param.type = "save_favourite_fit_tools";
                param.id = this.profile_model.get("parent");
                Utils.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "POST", param).always(function(data){
                    if(data.replace(/\"/g, "") == self.profile_model.get("parent").toString()){
                        self.favouriteFitToolDataArr[0] = JSON.stringify(dataToSend);
                        self.options.application.getLayout().currentView.showContent(true);

                    } else {
                        self.showError(_('Your Favourite Fit Tools not saved').translate())
                    }

                });
        }


		// @method getContext @return Profile.Information.View.Context
	,	getContext: function()
    {
        // @class Profile.Information.View.Context
        return {
            // @property {String} pageHeader
            options_config: this.options_config,
            values : this.values,
            paramEvent : this.paramEvent,
            selectedItemType : this.selectedItemType,
            favFitToolsFlag : this.favFitToolsFlag,
            favouriteFitToolDataArr: JSON.stringify(this.favouriteFitToolDataArr),
            userInternId: this.profile_model.get('parent')

        }
    }
    ,   favouriteFitToolsDisable: function()    //27-11-2019 saad
    {
        var customerInternalId = this.profile_model.get("parent");//jQuery('#customer_internal_id').val();


    if(customerInternalId){
    var param = {};
	param.type = "get_favourite_fit_tools";
	param.id = customerInternalId;
	_.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "GET", param).always(function (data) {
		if (data) {
			var tempFavFitToolsData = JSON.parse(data);
        	var favFitToolsData = tempFavFitToolsData[0];
			var isFavFitToolsEnable = tempFavFitToolsData[1];
				if (favFitToolsData) {
					jQuery('select').prop("disabled", false);
					jQuery('button').prop("disabled", false);
                    var favFitToolsData = JSON.parse(favFitToolsData);
                    for (var i = 0; i < favFitToolsData.length; i++) {
						var itemType = favFitToolsData[i].itemType;
						var tempMeasurementValues = favFitToolsData[i].measurementValues;
						for (var j = 0; j < tempMeasurementValues.length; j++) {
							var fieldId = tempMeasurementValues[j].name;
                            var fieldValue = tempMeasurementValues[j].value;
                            if(fieldId.indexOf('-hide-checkbox') != -1 && fieldValue == 'true'){
                                jQuery('#'+fieldId).prop('checked', true);
                            }
							if (fieldValue != 'Select' && parseFloat(fieldValue) != 0) {
								fieldId = fieldId.replace('%', '/').replace('F2', '');
								var id = "fav-fit-tools-div-" + itemType;
								jQuery('#' + id + ' select[name="' + fieldId + '"]').val(fieldValue);
                                var tempFiledId = fieldId.split('-');

                                var index = tempFiledId.length - 1;

								if (tempFiledId[index] == 'max') {
									tempFiledId[index] = 'min';
									var disabledFiledId = tempFiledId.join('-');
									jQuery('#fav-fit-tools-div-' + itemType + ' select[id="' + disabledFiledId + '"]').prop("disabled", true);
								} else {
									tempFiledId[index] = 'max';
                                    var disabledFiledId = tempFiledId.join('-');

									jQuery('#fav-fit-tools-div-' + itemType + ' select[id="' + disabledFiledId + '"]').prop("disabled", true);
                                }

							}
						}

					}
				}

			if (isFavFitToolsEnable == 'F') {
				jQuery('select').prop("disabled", true);
				jQuery('button').prop("disabled", true);
			}
            window.scrollTo({ top: 100, behavior: 'smooth' });
		}
    });

    }
    }
    , render: function ()     //27-11-2019 saad
    {
        Backbone.View.prototype.render.call(this);

        this.favouriteFitToolsDisable();

    }
   });
});
