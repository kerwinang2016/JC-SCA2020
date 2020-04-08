define('FitProfile.View',
    [
        'Backbone', 'fit_profile.tpl', 'underscore', 'Utils', 'Profile.Model', 'Client.Collection', 'HandlebarsExtras', 'Profile.View', 'Profile.Collection', 'FitProfile.Model', 'ClientOrderHistory.Collection'   //29/07/2019 Saad
    ],
    function (Backbone, fit_profile_tpl, _, Utils, ProfileModel, client_collection, HandlebarsExtras, ProfileView, profile_collection, FitProfileModel, Collection) {   //29/07/2019 Saad


        return Backbone.View.extend({
            profile_collection: null,
            fit_profile_collection: [],
            measurement_config: null,
            selected_measurement: null,
            template: fit_profile_tpl,
            title: _('Fit Profile').translate(),
            attributes: {
                'class': 'FitProfileHomeView'
            },
            events: {
                'change select#custrecord_fp_product_type': 'getMeasurementType',
                'change select#custrecord_fp_measure_type': 'buildMesureForm',
                'click [id=swx-order-client-search]': 'swxOrderClientSearch',
                'click [id=swx-fitprofile-butt-add]': 'swxFitProfileAdd',
                'click [data-action=add-profile]': 'addProfile',
                'click [id=client-edit]': 'ClientEdit',
                'click .save-action': 'saveForm',
                'click [id=swx-client-profile-select]': 'swxClientProfileSelect',
                'click [id=swx-back-to-client-profile-search]': 'swxBackToClientSearch',
                'click [data-action=remove-rec-client]': 'removeRecClientFitProfile',  //26/07/2019 Saad
                'click .save-action-edit': 'saveeditForm',
                'click [id=swx-fitprofile-viewedit]': 'swxFitProfileViewEdit',
                'click [id=swx-fitprofile-viewedit-shopflow]': 'swxFitProfileViewEdit',
                'change select#profiles-options': 'getProfileDetails',
                'change select.profiles-options-shopflow': 'getProfileDetailsShopflow',
                'click [id=butt-modal-submit-fit-profile]': 'submitProfile',
                'click [id=butt-modal-copy]': 'swxFitProfileModalButtCopy',
                'click [id=swx-fitprofile-copy]': 'swxFitProfileCopy',
                'click [data-action=copy-profile]': 'copyProfile',
                'click [id=butt-modal-remove]': 'swxFitProfileModalButtRemove',
                'click [id=swx-fitprofile-remove]': 'swxFitProfileRemove',
                'click [data-action=remove-rec]': 'removeFpRec',
                'click [data-action=remove-rec-flow]': 'removeFpFlowRec',
                'click .cancel-action': 'cancelAction',
                'change .allowance-fld': 'updateFinalMeasure', // 6/19/2019 Saad
                'change .body-measure-fld': 'updateFinalMeasure', // 6/19/2019 Saad
                'change .block-measurement-fld': 'disableCounterBlockField' // 6/19/2019 Saad
			    , 'change [id="units"]':'changedUnits'  // 6/19/2019 Saad
                , 'change [id*="body-block"]': 'fitBlockChanged'    // 6/19/2019 Saad
                , 'change [id*="body-fit"]': 'fitBlockChanged'     // 6/19/2019 Saad
                , 'blur [name="oh_dateneeded"]': 'updateDateNeeded'   //03/07/2019 Saad
                , 'change [name="oh_dateneeded"]': 'updateDateNeeded'  //03/07/2019 Saad
			    ,	'change [data-name="flag"]': 'updateFlag'        //03/07/2019 Saad
                , 'click #modalContainerSave' : 'updateFlagDetails'  //03/07/2019 Saad
                , 'change select#body-fit': 'rebuildMeasureForm'
                , 'change select#alteration-options': 'getAlterationsDetail'     //02/09/2019 Saad SAAD
                , 'click [id=alteration-modal-remove]': 'removeAlterationRec'   //02/09/2019 Saad SAAD
                , 'click [id=alteration-modal-print]': 'printAlterationRec'     //02/09/2019 Saad SAAD
                , 'click [id=alteration-modal-download]': 'downloadAlterationRec'       //02/09/2019 Saad SAAD
                ,  'click [data-action=add-alterations]': 'addAlterations'   //02/09/2019 Saad SAAD
                ,  'click [id=swx-alterations-add]': 'swxAlterationsAdd'    //02/09/2019 Saad SAAD
                , 'click [id=swx-alteration-viewedit]': 'swxAlterationsViewEdit'    //02/09/2019 Saad SAAD
                ,	'click [id=alteration-modal-submit]': 'submitAlterationForm'    //02/09/2019 Saad SAAD
                ,	'click [id=alteration-modal-submit-with-pdf]': 'submitAlterationFormAndGenratePDF'  //02/09/2019 Saad SAAD
                ,	'click [id=generate-alterations-form]': 'generateAlterationsForm'   //02/09/2019 Saad SAAD
                ,   'click [id=alteration-modal]': 'alterationModelClick'           //02/09/2019 Saad SAAD
                ,   'change #fit': "updateAllowanceLookup", //16/12/2019 Saad



            }
        ,   initialize: function (options) {
                var self = this;
                this.extra_fabric = "";
                this.selected_client = "";
                this.selected_client_data = [];
                this.clientOrderHistory = [];      //03/07/2019 Saad
                this.pdpClientId = self.options.clientID; //FitProfile ShopFlow
                this.productListEditProductType = self.options.productListEditProductType;
                this.profile_model = ProfileModel.getInstance();
                //this.fitprofilemodel= FitProfileModel.getInstance();
                this.client_collection = new client_collection();
                this.profile_collection = new profile_collection();
                this.alteration_collection= ''; //02/09/2019 Saad
                this.application = options.application;
                this.selectedProfileTypeList = [];
                this.selectedProfileIdList = [];
                this.model = options.model;
                this.objFilters = {}
                this.isDisplayClientDetailsValue = (this.profile_model.get('swx_is_display_client_details') != 'T') ? true : false
                this.id = options.mode;
                this.itemClothingType = this.model.get('custitem_clothing_type');
                this.blockValueMapping = {};
                this.blockQuantityMeasurementData = {}

                jQuery.get(Utils.getAbsoluteUrl('javascript/FitProfile_Config.json')).done(function (data) {
                    self.measurement_config = data;
                    if(self.pdpClientId){   //FitProfile ShopFlow
                        self.fitprofilepdp(self.pdpClientId,'', self.options.selectedFitProfilesObj, '');  //FitProfile ShopFlow
                    }
                });

                jQuery.get(Utils.getAbsoluteUrl('javascript/itemRangeConfig.json')).done(function (data) {
                    window.cmConfig = data;
                    window.itemRangeConfig = data;
                });
                
                jQuery.get(Utils.getAbsoluteUrl('services/influences.ss')).done(function (data) {
                    self.influences = data;
                });

                var scriptId = "customscript_ps_sl_set_scafieldset",
                deployId = "customdeploy_ps_sl_set_scafieldset";
                Utils.requestUrl(scriptId, deployId, "GET", {type: "get_block_quantity_measurement_mapping"}).always(function(data){
                    self.blockQuantityMeasurementData = JSON.parse(data)[0] || {};
                });

                this.getClientData(this.profile_model.get('parent') ,true); //load client asynchronously while initialization
            }
        ,   getSelectedMenu: function () //13/09/2019 saad
            {
                return 'fitprofile';
            }
        ,   getBreadcrumbPages: function () //13/09/2019 saad
            {
                return {
                    text: this.title,
                    href: '/fitprofile'
                };
            }

        ,   cancelAction: function(){
                var div = $('#firstname').closest('div');
                var para = div.find('p').remove();
                $('[for=firstname]').css('color','');
                $('#firstname').css('border-color','');

                var div = $('#lastname').closest('div');
                var para = div.find('p').remove();
                $('[for=lastname]').css('color','');
                $('#lastname').css('border-color','');

                var div = $('#email').closest('div');
                var para = div.find('p').remove();
                $('[for=email]').css('color','');
                $('#email').css('border-color','');

                var div = $('#phone').closest('div');
                var para = div.find('p').remove();
                $('[for=phone]').css('color','');
                $('#phone').css('border-color','');

                $('[data-type="alert-placeholder"]').html('');

            }

        ,   swxFitProfileAdd: function (e) {
                e.preventDefault();
                // this.model.set('current_profile',null);
                jQuery("a[id='swx-fitprofile-dropdown-add']").click();
            }

        ,   addProfile: function (e) {
                // debugger;
                e.preventDefault();
                var clientID = jQuery("#clients-options").val();
                this.profile_model = Utils.setFunc(this.profile_model, "current_client", clientID);
                var profileView = new ProfileView({
                    model: new FitProfileModel(),
                    application: this.application,
                    fitprofile: this.model
                });

                //  profileView.render();
                jQuery("#butt-modal-copy").hide();
                jQuery("#butt-modal-remove").hide();
                jQuery("#profile-section").html(profileView.$el);

                this.model = Utils.setFunc(this.profile_model, "current_profile", '');
                
                if(_.isEmpty(window.bodyBlockMeasurements)){ //get measurement value only once 
                    this.getData(Utils.getAbsoluteUrl('services/bodyBlockMeasurements.ss'), {}, true, function(data){
                        window.bodyBlockMeasurements = data;
                    });
                }
                //   this.model.set("current_profile", null);
                this.getProfileDetails(e);
                jQuery("#profiles-options").val("");
            }

        ,   updateDateNeeded: function (e) {     //03/07/2019 Saad
                var $ = jQuery;
                var clientFullName1 = $('#fitProfileClientName').html();
                var optionsearch = {
                    page: 1,
                    search: clientFullName1 //this.model.get('swx_order_client_name')
                };

                e.preventDefault();
                var valueofdate = e.target.value;
                if (valueofdate) {
                    var today = new Date(valueofdate);

                    this.clientOrderHistory = new Collection(optionsearch);
                    this.clientOrderHistory.reset();
                    var self = this;
                    this.clientOrderHistory.fetch().done(function () {
                        self.clientOrderHistory.each(function (model) {
                            if (model.get('solinekey') == e.target.id) {
                                model.set('custcol_avt_date_needed', today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear());
                                model.save();
                                //model.cachedSync();
                            }
                        });
                    });
                }
            }

        ,   updateFlag: function(e){      //03/07/2019 Saad
                var id = jQuery(e.target).data().id;

                if(e.target.checked){
                    var texthtml = "<input type='text' data-name='flagdetails' data-id='"+id+"' style='width:100%;'>";
                    jQuery('.modal-body').html(texthtml)
                    jQuery('#modalContainer').modal('show')
                }
                else{
                    this.clientOrderHistory.each(function (model) {
                        if (model.get('solinekey') == id) {
                            model.set('custcol_flag_comment', '');
                            model.set('custcol_flag','F')
                            model.save();
                        }
                    });
                }
            }

        ,   updateFlagDetails: function(e){         //03/07/2019 Saad
                var $ = jQuery;
                var clientFullName1 = $('#fitProfileClientName').html();
                var optionsearch = {
                    page: 1,
                    search: clientFullName1 //this.model.get('swx_order_client_name')
                };

                var id = jQuery('[data-name="flagdetails"]').data().id;

                this.clientOrderHistory = new Collection(optionsearch);
                this.clientOrderHistory.reset();
                var self = this;
                this.clientOrderHistory.fetch().done(function () {
                    self.clientOrderHistory.each(function (model) {
                        if (model.get('solinekey') == id) {
                            model.set('custcol_flag_comment',  jQuery('[data-name="flagdetails"]').val());
                            model.set('custcol_flag','T')
                            model.save();
                        }
                    });
                    jQuery('#modalContainer').modal('hide')
                });
            }

        ,   swxFitProfileViewEdit: function (e) {
                e.preventDefault();
                var selectedProfileIdValue = e.target.getAttribute('swx-fitprofile-id');
                var tailorID = this.profile_model.get('parent');

                
                if(_.isEmpty(window.bodyBlockMeasurements)){ //call must be synchronous in edit to display data
                    this.getData(Utils.getAbsoluteUrl('services/bodyBlockMeasurements.ss'), {}, false, function(data){
                        window.bodyBlockMeasurements = data;
                    });
                }

                this.getProfileDetails(e, selectedProfileIdValue, tailorID);
            }

        ,   getProfileDetails: function (e, selectedProfileIdValue, tailorId) {
                var self = this;
                var profileID;
                var clientid = $('#fitProfileClientInternalId').text();
                if(selectedProfileIdValue){
                    profileID = selectedProfileIdValue;
                } else {
                    profileID = jQuery(e.target).val();
                }
                //22-06-2019

                if(_.isEmpty(self.measurementdefaults)){
                    this.getData(Utils.getAbsoluteUrl('services/measurementdefaults.ss'), {}, true, function(data){
                        self.measurementdefaults = data;
                        self.fitBlockChanged();
                    });
                }

                self.profile_model = Utils.setFunc(self.profile_model, "current_profile", profileID);
                //var currentUser = this.application.getUser().get("internalid");
                if(e.target.innerText != "Add"){  // check if event was triggered by add button
                    var param = new Object();
                    param.type = "get_profile";
                    param.data = JSON.stringify({
                        filters: ["internalid||is||" + profileID],
                        columns: ["internalid", "name", "created", "lastmodified", "custrecord_fp_product_type", "custrecord_fp_measure_type", "custrecord_fp_measure_value", "custrecord_fp_client"]
                    });
                    Utils.requestUrlAsync("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "GET", param).always(function (data) {
                        if(data){
                            data = JSON.parse(data);
                            self.profile_collection = data;
                            var $ = jQuery;
                            if (profileID) {
                                $("#profile-actions").html("<a id='swx-fitprofile-dropdown-add' data-action='add-profile' data-toggle='show-in-modal' data-type='profile'>Add</a> | <a id='swx-fitprofile-dropdown-copy' data-action='copy-profile' data-type='profile' data-id='" + profileID + "'>Copy</a> ");//| <a id='swx-fitprofile-dropdown-remove' data-action='remove-rec' data-type='profile' data-id='" + profileID + "'>Remove</a>"); // 29/01/2020
                                var profileView = new ProfileView({
                                    profile_collection: self.profile_collection,
                                    application: self.application,
                                    fitprofile: self.model
                                });

                                var selectedProfile = data[0];
                                selectedProfile.current_client = data[0].custrecord_fp_client;
                                profileView.render(selectedProfile, self.measurement_config,'viewedit', null, tailorId);
                                jQuery("#profile-section").html(profileView.$el);

                            } else {
                                jQuery("#profile-actions").html("<a id='swx-fitprofile-dropdown-add' data-action='add-profile' data-toggle='show-in-modal' data-type='profile'>Add</a>");
                                jQuery("#profile-section").html("");
                            }
                        }

                    });
                } else {
                    jQuery("#profile-actions").html("<a id='swx-fitprofile-dropdown-add' data-action='add-profile' data-toggle='show-in-modal' data-type='profile'>Add</a>");
                    var profileView = new ProfileView({
                        profile_collection: '',
                        application: this.application,
                        fitprofile: this.model
                    });

                    profileView.render('', this.measurement_config,'add', clientid);
                    jQuery("#profile-section").html(profileView.$el);
                        //display profile details
                        //jQuery("#profile-details").html(Utils.profileForm(self.model, '','add'));
                }
            }

        ,   getProfileDetailsShopflow: function(e){
                var profileID = jQuery(e.target).val();
                //this.model.set("current_profile", profileID);

                if (profileID) {
                    var type = jQuery(e.target).data('type');
                    var typeIndex = this.selectedProfileTypeList.indexOf(type);
                    if(typeIndex == -1){
                        this.selectedProfileTypeList.push(jQuery(e.target).data('type'));
                        this.selectedProfileIdList.push(profileID);
                    } else {
                        this.selectedProfileIdList[typeIndex] = profileID;
                    }
                    jQuery('#profile-actions-' + type).html('<a id="swx-fitprofile-butt-add" class="add-fit-btn" >Add</a> <a id="swx-fitprofile-viewedit-shopflow" class="fitprofile-edit-btn" swx-fitprofile-id="' + profileID + '"> | Edit</a>'); //| <a data-action="remove-rec-flow" data-type="profile" data-id="' + profileID + '">Remove</a>

                    //this.updateQuantity(profileID); 24/12/2019 saad
                } else {
                    var type = jQuery(e.target).data('type');
                    jQuery('#profile-actions-' + type).html('<a id="swx-fitprofile-butt-add" class="add-fit-btn" >Add</a>');
                    var typeIndex = this.selectedProfileTypeList.indexOf(type);
                    if(typeIndex != -1){
                        this.selectedProfileTypeList[typeIndex] = null;
                        this.selectedProfileIdList[typeIndex] = null;
                    }
                }
                this.reCalculateQuantity();
            }

        ,   reCalculateQuantity: function(){
                var self = this;
                jQuery('[name="custcol_fabric_quantity"]').val('0.00');
                _.each(jQuery("select.profiles-options-shopflow"), function(v){
                    if(_.isEmpty(jQuery(v).val())){
                        return;
                    }
                    self.updateQuantity(v.value);  // 24/12/2019 saad
                });
            }

        ,   updateQuantity: function(profileID, extraDetails){
                // console.log(profileID, this.blockQuantityMeasurementData, this.blockValueMapping, extraDetails);
                if(this.extra_fabric != jQuery('#fabric_extra').val()){
                    this.extra_fabric = jQuery('#fabric_extra').val();
                    jQuery('[name="custcol_fabric_quantity"]').val('0.00');
                }
                
                self = this;
                var quantity = 0.0;
                if (self.blockQuantityMeasurementData) {
                    var historyFragment = decodeURIComponent(Backbone.history.fragment),
                        productType = '',
                        bqmQty = 0.0,
                        extraQuantityValue = 0.0,
                        products = [];
                    if (self.productListEditProductType) {
                        productType = self.productListEditProductType;
                    } else {
                        productType = historyFragment.split("product=")[1];
                    }
                
                    if (jQuery('#fabric_extra').val() != undefined && jQuery('#fabric_extra').val() != "" && jQuery('#fabric_extra').val().toLowerCase() != "please select" ) {
                        extraQuantityValue = parseFloat(jQuery('#fabric_extra').val())
                    }

                    var existingQty = jQuery('[name="custcol_fabric_quantity"]').val();
                    var designQuantityCodes = window.extraQuantity[0].values;
                    var designOptionsValues = jQuery('[data-type="fav-option-customization"]');

                    if (extraDetails != undefined) {
                        productType = extraDetails.product_type;
                        extraQuantityValue = extraDetails.extra_fabric;
                        existingQty = extraDetails.existing_quantity;
                        designQuantityCodes = extraDetails.design_codes;
                        designOptionsValues = extraDetails.design_options;
                    }

                    var blockValueMapping = (!_.isEmpty(self.blockValueMapping)) ? self.blockValueMapping[profileID] : extraDetails.blockValueMapping;
                    //added if get the block value of 2-piece and 3-piece instead of item specific
                    if(_.indexOf(["2-piece-suit", "3-piece-suit", "l-2pc-skirt", "l-2pc-pants", "l-3pc-suit"], productType.toLowerCase())!=-1){
                        blockValueMappingParts = blockValueMapping.split('-');
                        blockValueMapping = productType.toLowerCase()+"-"+blockValueMappingParts[blockValueMappingParts.length-1];
                    }
                    bqmQty = self.blockQuantityMeasurementData[blockValueMapping] || 0;

                    var productTypeArr = {
                        "3-Piece-Suit": ['Jacket', 'Trouser', 'Waistcoat']
                    ,   "2-Piece-Suit": ['Jacket', 'Trouser']
                    ,   "L-3PC-Suit": ['Ladies-Jacket', 'Ladies-Skirt', 'Ladies-Pants']
                    ,   "L-2PC-Skirt": ['Ladies-Jacket', 'Ladies-Skirt']
                    ,   "L-2PC-Pants": ['Ladies-Jacket', 'Ladies-Pants']
                    }
                    
                    products = (productTypeArr[productType] != undefined) ? productTypeArr[productType] : [productType];

                    //24/12/2019 saad
                    for (var i = 0; i < products.length; i++) {
                        var ptype = products[i];
                        var designOptions = _.find(designQuantityCodes, function (temp) {
                            return temp.code == ptype;
                        });
                        if (designOptions) {
                            _.each(designOptionsValues, function (temp) {
                                var val = _.find(designOptions.design, function (temp2) {
                                    return temp2.code == temp.value
                                });
                                if (val && val.value != "")
                                    extraQuantityValue += parseFloat(val.value);
                            });
                        }
                    }
                    
                    if (parseFloat(extraQuantityValue) > 0.0) {
                        quantity = parseFloat(extraQuantityValue) + parseFloat(bqmQty);
                        quantity = quantity.toFixed(2);
                    } else {
                        quantity = parseFloat(bqmQty).toFixed(2);
                    }
                    if (existingQty) {
                        if (parseFloat(existingQty) > parseFloat(quantity)) {
                            quantity = existingQty;
                        }
                    }
                    jQuery('[name="custcol_fabric_quantity"]').val(quantity);
                }
                return parseFloat(quantity);
            }

        ,   getMeasurementType: function (e) {
                jQuery("[id='butt-modal-copy']").hide();
                jQuery("[id='butt-modal-remove']").hide();
                jQuery("[id='butt-modal-submit']").hide();

                var itemType = jQuery(e.target).val()
                    , selectedItemType = null
                    , measurementType = null

                if (itemType) {
                    selectedItemType = _.where(this.measurement_config, { item_type: itemType })[0];

                    jQuery("[id='butt-modal-copy']").hide();
                    jQuery("[id='butt-modal-remove']").hide();
                    jQuery("[id='butt-modal-submit']").hide();
                }

                if (selectedItemType) {
                    measurementType = _.pluck(selectedItemType.measurement, "type");
                    jQuery("#measure-type").html(Utils.measureTypeDropdown(measurementType));
                    jQuery("#measure-form").html("");

                    jQuery("[id='butt-modal-copy']").hide();
                    jQuery("[id='butt-modal-remove']").hide();
                    jQuery("[id='butt-modal-submit']").hide();

                } else {
                    jQuery("#measure-type").html("");
                    jQuery("#measure-form").html("");

                    jQuery("[id='butt-modal-copy']").hide();
                    jQuery("[id='butt-modal-remove']").hide();
                    jQuery("[id='butt-modal-submit']").hide();

                }
            }

        ,   buildMesureForm: function (e, selectedProfile) {               //27-11-2019 , 28-11-2019 saad
                jQuery("[id='butt-modal-copy']").hide();
                jQuery("[id='butt-modal-remove']").hide();
                jQuery("[id='butt-modal-submit']").hide();

                var measureType = jQuery(e.target).val() || selectedProfile[0].custrecord_fp_measure_type
                    , itemType = jQuery("#custrecord_fp_product_type").val() || selectedProfile[0].custrecord_fp_product_type
                    , self = this
                    , fieldsForm = null;

                if (measureType && itemType) {
                    self.fieldsForm = _.where(self.measurement_config, { item_type: itemType })[0];
                    self.fieldsForm = _.where(self.fieldsForm.measurement, { type: measureType })[0];
                    self.processBlockFields(self.fieldsForm, 'Regular');
                    self.selected_measurement = self.fieldsForm;

                    jQuery("[id='butt-modal-submit']").show();
                    if(measureType == 'Block'){ //6/20/2019 Saad
                        //JHD-11 Start
                        var param = {};
                        param.type = "get_favourite_fit_tools";
                        param.id = this.profile_model.get('parent');
                        Utils.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "GET", param).always(function (data) {
                            if(data){
                                var tempFavFitToolsData = JSON.parse(data);
                                var favDefaultData = JSON.parse(tempFavFitToolsData[0]);
                                tempFavFitToolsData = _.find(favDefaultData, function(value){if(value.itemType == itemType){return value;}}) || [];
                                //27-11-2019 saad -Start-
                                var param2 ={};
                                param2.id=param.id;
                                param2.type="get_designoption_restriction";
                            Utils.requestUrlAsync("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "GET", param2).always(function (designData) {

                                    var designRestrictionData = JSON.parse(JSON.parse(designData));
                                    var fieldName = "TryonRestriction"+itemType.replace(/\s+/g, '');
                                    var blockSize = ""; var html = "";
                                    _.each(designRestrictionData, function(v){
                                        if(v.name == fieldName){
                                            blockSize = v.value;
                                        }
                                    });

                                    //17/12/2019 saad
                                    if(_.isEmpty(blockSize))
                                    {
                                        var selectedProductType = itemType.replace(/\s+/g, '');
                                        var configUrl = Utils.getAbsoluteUrl('javascript/DesignOptions_Config.json');

                                        jQuery.ajax({
                                            url: configUrl,
                                            type: "get",
                                            async: false,
                                            success: function(data){
                                                var selectOptions = [];
                                                _.each(data, function(v)
                                                {
                                                    if(selectedProductType == v.item_type){
                                                        selectOptions = v.options[0].fields[0].values;
                                                    }
                                                })
                                                html = Utils.measureForm(self.fieldsForm, tempFavFitToolsData.measurementValues, null, null, null, selectOptions);
                                            }
                                        });
                                    } else {
                                        html = Utils.measureForm(self.fieldsForm, tempFavFitToolsData.measurementValues, null, null, null, blockSize.split(','));   //27-11-2019 saad

                                    }
                                    jQuery("#measure-form").html(html);   //27-11-2019 saad
                                    //17/12/2019 saad
                                }); //27-11-2019 saad -End-

                                if (favDefaultData) {
                                    jQuery("label").removeClass( "fav-fit-tools-default");
                                    var defaultFields = '';
                                    for(var j = 0; j < favDefaultData.length; j++){
                                        if(favDefaultData[j].itemType == itemType){
                                            defaultFields = favDefaultData[j].measurementValues;
                                            if(defaultFields){
                                                for(var i = 0; i < defaultFields.length; i++ ){
                                                    var name = defaultFields[i].name;
                                                    var value = defaultFields[i].value;
                                                    if(value != 'select' ){
                                                        var defaultId = name.replace('max', 'default').replace('min', 'default').replace('%', '/').replace('2F', ''); //12/11/2019 Umar Zulfiqar {replaced F2 -> 2F}
                                                        if(parseFloat(value) != 0){
                                                            var selectMaxMinId = name.replace('%', '/').replace('2F', ''); //12/11/2019 Umar Zulfiqar {replaced F2 -> 2F}
                                                            jQuery('[id="'+ defaultId + '"]').html(value);
                                                            jQuery('select[name="' + selectMaxMinId + '"]').val(value);
                                                            var tempFiledId =  selectMaxMinId.split('-');
                                                            var index = tempFiledId.length - 1;
                                                            if(tempFiledId[index] == 'max'){
                                                                tempFiledId[index] = 'min';
                                                                var disabledFiledId = tempFiledId.join('-');
                                                                jQuery('select[id="' + disabledFiledId + '"]').prop("disabled", true);
                                                            } else {
                                                                tempFiledId[index] = 'max';
                                                                var disabledFiledId = tempFiledId.join('-');
                                                                jQuery('select[id="' + disabledFiledId + '"]').prop("disabled", true);
                                                            }
                                                        } else {
                                                            if(name.indexOf('min') != -1){
                                                                var defaultValue = jQuery('[id="'+ defaultId + '"]').text();
                                                                if(defaultValue.length == 0){
                                                                    jQuery('[id="'+ defaultId + '"]').html('---');
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        //JHD-11 End
                        });
                    }else{
                        jQuery("#measure-form").html(Utils.measureForm(self.fieldsForm));
                    }

                } else {
                    jQuery("#measure-form").html("");

                    jQuery("[id='butt-modal-copy']").hide();
                    jQuery("[id='butt-modal-remove']").hide();
                    jQuery("[id='butt-modal-submit']").hide();
                }
            }

        ,   processBlockFields: function (form, fittype) {
                if (form && form.fieldset && form.fieldset.length) {
                    _.each(form.fieldset, function (fieldset) {
                        if (fieldset && fieldset.name !== "main") {
                            if (fieldset.fields && fieldset.fields.length) {
                                _.each(fieldset.fields, function (field) {
                                    fittype = fittype.toLowerCase().replace(/ /g, '-');

                                    if (field[fittype] && field[fittype].max && field[fittype].min) {
                                        field.max = field[fittype].max;
                                        field.min = field[fittype].min;
                                    }
                                });
                            }
                        }
                    });
                }
            }

        ,   swxFitProfileModalButtSubmit: function (e) {
                jQuery("[id='swx-fitprofile-submit']").click();
            }

        ,   submitProfile: function (e) {
                // changed on 6/20/2019 Saad (Start)
                var $ = jQuery;

                if($('#name').val() == ''){
                    var div = $('#name').closest('div');
                    var para = div.find('p');
                    if(para.length == 0){
                        div.append('<p class="help-block" style="color: #b94a48;font-size:">Name is required</p>');
                        $('[for=name]').css('color','#b94a48');
                        $('#name').css('border-color','#b94a48');
                    }
                    return false;
                }else{
                    var div = $('#name').closest('div');
                    var para = div.find('p').remove();
                    $('[for=name]').css('color','');
                    $('#name').css('border-color','');
                }
                // changed on 6/20/2019 Saad (End)

                var fitProfileName= $('#name').val();
                var fitProfileId = this.profile_model.get("current_profile") || '';
                var fitprofile=_.find(this.fit_profile_collection, function(profile){
                    if(profile.name.trim() == fitProfileName.trim() && profile.custrecord_fp_product_type == jQuery("#custrecord_fp_product_type").val() && profile.internalid != fitProfileId){
                        return profile;
                    }
                });
                
                if(fitprofile!=undefined){
                    var div = $('#name').closest('div');
                    var para = div.find('p');
                    if(para.length == 0){
                        div.append('<p class="help-block" style="color: #b94a48;font-size:">Fit profile name already exists</p>');
                        $('[for=name]').css('color','#b94a48');
                        $('#name').css('border-color','#b94a48');
                    }
                    noty({
                        text: 'Fit profile name already exists.',
                        type: 'error',
                        layout: 'center',
                        //theme: 'relax',
                        timeout: 5000
                    });
                    return false;
                }
                if(jQuery("#custrecord_fp_product_type").val()==''){
                    var div = $('#custrecord_fp_product_type').closest('div');
                    var para = div.find('p');
                    if(para.length == 0){
                        div.append('<p class="help-block" style="color: #b94a48;font-size:">Product type is requierd</p>');
                        $('[for=custrecord_fp_product_type]').css('color','#b94a48');
                        $('#custrecord_fp_product_type').css('border-color','#b94a48');
                    }
                    return false;
                }
                if(jQuery("#custrecord_fp_measure_type").val()==''){
                    var div = $('#custrecord_fp_measure_type').closest('div');
                    var para = div.find('p');
                    if(para.length == 0){
                        div.append('<p class="help-block" style="color: #b94a48;font-size:">Measurement type is requierd</p>');
                        $('[for=custrecord_fp_measure_type]').css('color','#b94a48');
                        $('#custrecord_fp_measure_type').css('border-color','#b94a48');
                    }
                    return false;
                }

                e.preventDefault();
                var finishMeasurements = jQuery('#profile-form span[id*="finish_"]');
                var finisharr = ['finish_Cuff','finish_Front-Lt','finish_Top-Button','finish_front-lt','finish_top-button'];    //04/02/2020
                var hasErrors = false;
                for (var i = 0; i < finishMeasurements.length; i++) {
                    if (finishMeasurements[i].attributes['min-value'] && finishMeasurements[i].attributes['max-value']) {
                        if(_.indexOf(finisharr,finishMeasurements[i].id)!=-1){  //04/02/2020
                            continue;
                        }
                        var min = parseFloat(finishMeasurements[i].attributes['min-value'].value),
                            max = parseFloat(finishMeasurements[i].attributes['max-value'].value),
                            finalvalue = parseFloat(finishMeasurements[i].innerHTML);
                        if (min && max) {
                            if(finalvalue == 0 && finishMeasurements[i].dataset.optional == 'true'){
                                //we accept this
                            }else	if (min > finalvalue || finalvalue > max) {
                                hasErrors = true;
                                break;
                            }
                        }
                    }
                };
                if (hasErrors) {
                    //alert('Body measurements finished value is not within the range.');
                    noty({
                        text: 'Body measurements finished value is not within the range.',
                        type: 'error',
                        layout: 'center',
                        //theme: 'relax',
                        timeout: 5000
                    });
                    return false;
                }
                var measureTypeValue = jQuery("#custrecord_fp_measure_type").val() ?
                    jQuery("#custrecord_fp_measure_type").val() : jQuery("#custrecord_fp_measure_type").val();
                if (measureTypeValue == 'Block') {
                    if (jQuery('#body-fit').val() == 'Select' || !jQuery('#body-fit').val()) {

                        //alert(_('Please enter Fit Value').translate());
                        noty({
                            text: 'Please enter Fit Value',
                            type: 'error',
                            layout: 'center',
                            //theme: 'relax',
                            timeout: 5000
                        });
                        return false;

                    }

                    if (jQuery('#body-block').val() == 'Select' || !jQuery('#body-block').val()) {

                        //alert(_('Please enter Block Value').translate());
                        noty({
                            text: 'Please enter Block Value',
                            type: 'error',
                            layout: 'center',
                            //theme: 'relax',
                            timeout: 5000
                        });
                        return false;

                    }
                    if(jQuery('[id*="body-fit"]').val() == 'Slim' && jQuery('[id*="body-block"]').val() != 'Select' && jQuery("[id*='custrecord_fp_product_type']").val() == 'Shirt'){
                        if(parseFloat(jQuery('[id*="body-block"]').val()) < 35 || parseFloat(jQuery('[id*="body-block"]').val()) > 46){
                            noty({
                                text: 'You can only select slim profile for sizes 35 - 46',
                                type: 'error',
                                layout: 'center',
                                //theme: 'relax',
                                timeout: 5000
                            });
                            return false;
                        }
                    }
                }
                var regex = new RegExp("\\+","g");
                var formValues = jQuery("#profile-form").serialize().split("&")
                    , self = this
                    , dataToSend = new Array()
                    , measurementValues = new Array();

                _.each(formValues, function (formValue) {
                    if (formValue.indexOf('hide-checkbox') != -1) { //23/01/2020

                        return;
                    }
                    var field = formValue.split("=")[0]
                        , value = formValue.split("=")[1]
                        , formData = new Object()
                        , param = new Object();

                    // Saad 24/12/2019 start
                    if (field == "custrecord_fp_product_type") {
                        selectedType = value;
                    }
                    // Saad 24/12/2019 end

                    if (field == "custrecord_fp_client" || field == "name" || field == "custrecord_fp_product_type"
                    || field == "custrecord_fp_measure_type") {
                        formData.name = field;
                        if (field == "custrecord_fp_client" || field == "name") {
                            value = decodeURIComponent(value).split('|')[0]; //added to get client id for edit case.
                            formData.value = value.replace(regex, " ");
                        } else {
                            formData.text = value.replace(regex, " ");
                        }
                        formData.type = "field";
                        formData.sublist = "";

                        dataToSend.push(formData);
                    } else {
                        if(value && parseFloat(value) == 0){
                            //you can only go here if you are an optional.. check if the finish is 0 dont save if it is
                            var fieldname = field;
                            if(field.indexOf('allowance') != -1){
                                var a = field.split('-');
                                a.shift();
                                fieldname = a.join('-');
                            }
                            var x = jQuery('[id*="finish_'+fieldname+'"]')
                            if(x.length != 0 && x.data().optional && x.html() == '0'){

                            }else{
                                var measureData = new Object();
                                measureData.name = field;
                                measureData.value = value.replace(regex, "");

                                measurementValues.push(measureData);}
                            }

                        else{
                            var fieldname = field;
                            if(field.indexOf('allowance') != -1){
                                var a = field.split('-');
                                a.shift();
                                fieldname = a.join('-');
                            }
                            var x = jQuery('[id*="finish_'+fieldname+'"]')
                            if(x.length != 0 && x.data().optional && x.html() == '0'){

                            }else{
                            var measureData = new Object();
                            measureData.name = field;
                            measureData.value = value.replace(regex, " ");

                            measurementValues.push(measureData);
                            }
                        }
                    }
                });


                var param = new Object();
                var bvalue = this.lookupBlockValue(measurementValues);
                if(bvalue){
                    dataToSend.push({"name":"custrecord_fp_block_value","value":bvalue,"type":"field","sublist":""});
                }
                dataToSend.push({ "name": "custrecord_fp_measure_value", "value": JSON.stringify(measurementValues), "type": "field", "sublist": "" })
                param.type = this.profile_model.get("current_profile") ? "update_profile" : "create_profile";   //06/01/2020
                if (this.profile_model.get("current_profile")) {         //06/01/2020  //20/01/2020
                    param.id = this.profile_model.get("current_profile");
                }

                param.data = JSON.stringify(dataToSend);

                Utils.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "POST", param, true).always(function (data) {
                    $("#fit-profile-modal").modal("toggle");
                    if (Backbone.history.fragment.split("?").length > 1) { //Added salman June-2019
                        var fitprofileCreatedId;
                        var fragmentArray = Backbone.history.fragment.split("?")
                        ,	clientId = "";

                        if(data){
                            //var tempData = JSON.parse(data);
                            fitprofileCreatedId = data.id ? data.id : '';
                            self.blockValueMapping[fitprofileCreatedId] = (data.rec.custrecord_fp_product_type + '-' + data.rec.custrecord_fp_block_value).toLowerCase();           
                        }
                        
                        for(var i = fragmentArray.length -1; i >= 0; i--){
                            if(fragmentArray[i].match('client')){
                                clientId = fragmentArray[i].split("=")[1].split("&")[0];
                                break;
                            }
                        }
                        //Saad 24/12/2019 start
                        var typeIndex = self.selectedProfileTypeList.indexOf(selectedType);
                        if (typeIndex == -1) {
                            self.selectedProfileTypeList.push(selectedType);
                            self.selectedProfileIdList.push(fitprofileCreatedId);
                        } else {
                            self.selectedProfileIdList[typeIndex] = fitprofileCreatedId;
                        }
                        // added to recalcualte quantity {umar}
                        self.reCalculateQuantity();
                        //Saad 24/12/2019 end
                        self.fitprofilepdp(clientId, self.selectedProfileIdList, '', fitprofileCreatedId);
                    } else {
                        var showMessage = '';
                        if(param.type == "create_profile"){
                            showMessage = 'Record was created';
                        } else {
                            showMessage = 'Record was updated';
                        }
                        jQuery(".show-remove-error-fitprofile").html("<div class='alert alert-success alert-dismissible fade in'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" + showMessage + "</div>");
                        var client_id = jQuery('#fitProfileClientInternalId').text();
                        self.swxClientProfileSelect('', client_id);
                    }
                    // jQuery("div.modal-backdrop").fadeOut();
                    jQuery(".modal-backdrop").hide();
                    jQuery("body").removeClass("modal-open");
                    jQuery("body").removeAttr('style')
                });

            }

        ,   lookupBlockValue: function(measurementValues){
                if(jQuery('[name="custrecord_fp_measure_type"]').val() == 'Block'){
                    return jQuery('[name="block"]').val();
                }else{
                    //Should be a body
                    //3:Jacket, 4:Trouser, 6:Waistcoat, 7:Shirt, 8:Overcoat
                    var ptype = jQuery('[name="custrecord_fp_product_type"]').val(), result;
                    switch(ptype){
                        case 'Jacket':
                        case 'Shirt':
                        case 'Overcoat':
                            var partvalue = 0;
                            var partmeasure = jQuery('[id*="finish_Waist"]').html(), partvalue = 0;

                            if(partmeasure){
                                partvalue = jQuery('[name="units"]').val() == 'CM'?partmeasure:parseFloat(partmeasure)*2.54;
                                partvalue = parseFloat(partvalue)/2;
                                var filtered = _.filter(window.bodyBlockMeasurements,function(data){
                                    return parseFloat(data.custrecord_bbm_bodymeasurement) >= parseFloat(partvalue) && data.custrecord_bbm_producttypetext == ptype;
                                });
                                if(filtered && filtered.length>0)
                                    result = filtered.reduce(function(prev, curr){
                                        return parseFloat(prev['custrecord_bbm_bodymeasurement']) < parseFloat(curr['custrecord_bbm_bodymeasurement']) ? prev : curr;
                                    });
                            }
                            break;
                        case 'Waistcoat':
                            var partvalue = 0,
                            partmeasure = 0;
                            var mValue = measurementValues ? measurementValues : [];
                            var mUnits = mValue.find(function (e) {
                                return e.name == 'units';
                            })
                            var a = _.filter(mValue, function (m) {
                                return m.name == "Waist" || m.name == "allowance-Waist" || m.name == "waist" || m.name == "allowance-waist";
                            });
                            for (var i = 0; i < a.length; i++) {
                                partvalue += parseFloat(a[i].value);
                            }
                            if (partmeasure)
                                partvalue = jQuery('[name="units"]').val() == 'CM' ? partmeasure : parseFloat(partmeasure) * 2.54;
                            partvalue = parseFloat(partvalue) / 2
                            var filtered = _.filter(window.bodyBlockMeasurements, function (data) {
                                return parseFloat(data.custrecord_bbm_bodymeasurement) >= parseFloat(partvalue) && data.custrecord_bbm_producttypetext == ptype;
                            })
                            if (filtered && filtered.length > 0) {
                                result = filtered.reduce(function (prev, curr) {
                                    return parseFloat(prev['custrecord_bbm_bodymeasurement']) < parseFloat(curr['custrecord_bbm_bodymeasurement']) ? prev : curr;
                                });
                            } else {
                                var filtered = _.filter(window.bodyBlockMeasurements, function (data) {
                                    return data.custrecord_bbm_producttypetext == ptype;
                                });
                                result = filtered.reduce(function (prev, curr) {
                                    return parseFloat(prev['custrecord_bbm_bodymeasurement']) > parseFloat(curr['custrecord_bbm_bodymeasurement']) ? prev : curr;
                                });
                            }
                            break;
                        case 'Trouser':
                            var partvalue = 0, partmeasure = 0;
                            var mValue = measurementValues ? measurementValues : [];
                            var mUnits = mValue.find(function (e){return e.name == 'units';})
                            var a = _.filter(mValue,function(m){
                            return m.name == "seat" || m.name == "allowance-seat";
                            });
                            for(var i=0;i<a.length;i++){
                            partvalue += parseFloat(a[i].value);
                            }
                            if(partvalue)
                            partmeasure = mUnits.value == 'CM'?partvalue:parseFloat(partvalue)*2.54;
                            partmeasure = parseFloat(partmeasure)/2;
                                        var filtered = _.filter(window.bodyBlockMeasurements,function(data){
                                        return parseFloat(data.custrecord_bbm_bodymeasurement) >= parseFloat(partmeasure) && data.custrecord_bbm_producttypetext == ptype;
                                        })
                            if(filtered && filtered.length>0){
                                        result = filtered.reduce(function(prev, curr){
                                                return parseFloat(prev['custrecord_bbm_bodymeasurement']) < parseFloat(curr['custrecord_bbm_bodymeasurement']) ? prev : curr;
                                        });
                            }else{
                            var filtered = _.filter(window.bodyBlockMeasurements,function(data){
                                            return data.custrecord_bbm_producttypetext == ptype;
                                        });
                            result = filtered.reduce(function(prev, curr){
                                        return parseFloat(prev['custrecord_bbm_bodymeasurement']) > parseFloat(curr['custrecord_bbm_bodymeasurement']) ? prev : curr;
                                    });
                            }
                            break;
                        default:
                            break;
                    }
                    return result?result.custrecord_bbm_block:0;
                }
            }

        ,   swxFitProfileModalButtCopy: function (e) {
                var $ = jQuery;
                this.profile_model.set('current_profile', null); //added to remove the current profile to create new
                jQuery("[id='butt-modal-remove']").hide();
                jQuery("[id='butt-modal-copy']").hide();
                jQuery("[id='swx-fitprofile-copy']").click();
            }

        ,   swxFitProfileCopy: function (e) {
                var $ = jQuery;
                jQuery("[id='swx-fitprofile-dropdown-copy']").click();
                jQuery("form[id='profile-form']").find("input[id='name']").focus();
                jQuery("[id='fit-profile-modal-heading']").text('Copy Profile');
                jQuery("[id='swx-fitprofile-copy']").hide();
                jQuery("[id='swx-fitprofile-remove']").hide();
            }

        ,   rebuildMeasureForm: function (e) {

                jQuery("[id='butt-modal-copy']").hide();
                jQuery("[id='butt-modal-remove']").hide();
                jQuery("[id='butt-modal-submit']").hide();

                var fitType = jQuery(e.target).val()
                    , measureType = jQuery("#custrecord_fp_measure_type").val()
                    , itemType = jQuery("#custrecord_fp_product_type").val()
                    , self = this
                    , fieldsForm = null;

                if (measureType && itemType && fitType) {
                    fieldsForm = _.where(self.measurement_config, { item_type: itemType })[0];
                    fieldsForm = _.where(fieldsForm.measurement, { type: measureType })[0];
                    self.processBlockFields(fieldsForm, fitType)
                    self.selected_measurement = fieldsForm;

                    //jQuery("#measure-form").html(SC.macros.measureForm(fieldsForm, [{ "name": "fit", "value": fitType }]));

                    jQuery("[id='butt-modal-submit']").show();

                } else {
                    jQuery("#measure-form").html("");

                    jQuery("[id='butt-modal-copy']").hide();
                    jQuery("[id='butt-modal-remove']").hide();
                    jQuery("[id='butt-modal-submit']").hide();

                }
            }

        ,   copyProfile: function (e) {
                this.model.set("current_profile", null);
                jQuery("#profile-form #name").val("");
            }

        ,   swxFitProfileModalButtRemove: function (e) {
                //var $ = jQuery;
                //var message = _("Are you sure that you want to delete this client and their fit profiles?").translate();
                //if (window.confirm(message)) {
                jQuery("[id='swx-fitprofile-remove']").click();
                //}
            }

        ,   swxFitProfileRemove: function (e) {
                var $ = jQuery;
                jQuery("[id='swx-fitprofile-dropdown-remove']").click();
            }

        ,   removeFpRec: function (e){ //Remove Fit profile
                var self = this;
                e.preventDefault();
                var message = "Are you sure that you want to delete this fit profiles?";
                    conditionContent = jQuery(e.target).data('type') === "profile" ? window.confirm(message) : true;

                if (conditionContent) {
                    var selector = jQuery(e.target)
                        , id = selector.data("id")
                        , type = selector.data("type");
                    if(type && id){
                        var param = new Object();
                        param.type = "remove_" + type;
                        param.id = id;
                        Utils.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "GET", param).always(function(data){
                            var responseData = JSON.parse(data)
                            if(responseData.status){
                                self.model.set("current_client", null);
                                self.model.set('swx_is_display_client_details', '');

                                self.swxOrderClientSearch('');
                                self.showContent().done(function(){
                                    jQuery(".show-remove-error-fitprofile").html("<div class='alert alert-success alert-dismissible fade in'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a> Record was deleted </div>");
                                })
                            }
                        })
                    }
                    $("#fit-profile-modal").modal("toggle");
                }
            }

        ,   removeFpFlowRec: function (e) {
                e.preventDefault();
                var self=this,message = "Are you sure that you want to delete this fit profile?";
                conditionContent = jQuery(e.target).data('type') === "profile" ? window.confirm(message) : true;

                var str=window.location.href;
                if (conditionContent) {
                    var selector = jQuery(e.target),
                        id = selector.data("id"),
                        type = selector.data("type"),
                        self = this;
                    if (type && id) {
                        var param = new Object();
                        param.type = "remove_" + type;
                        param.id = id;

                        if(str.indexOf('my_account')==-1 && str.indexOf('fitprofile')==-1)
                        {
                            Utils.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "GET", param).always(function (data) {
                                var responseData = JSON.parse(data)
                                if (responseData) {
                                    self.fitprofilepdp(self.pdpClientId);
                                }
                            }).done(function () { //20/01/2020
                                jQuery(".modal-backdrop").hide();
                                jQuery("body").removeClass("modal-open");
                                jQuery("body").removeAttr('style');
                                self.reCalculateQuantity();
                            })
                        }else{
                            Utils.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "GET", param).always(function (data) {
                                var responseData = data
                                if (responseData) {
                                    var client_id = jQuery('#fitProfileClientInternalId').text();
                                    self.swxClientProfileSelect('', client_id);
                                }
                            }).done(function () {
                                jQuery(".show-remove-error-fitprofile").html("<div class='alert alert-success alert-dismissible fade in'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a> Record was deleted </div>");
                                self.reCalculateQuantity();
                            })
                            $("#fit-profile-modal").modal("toggle");                
                        }
                    }
                }
            }

        ,   fitprofilepdp: function(clientID, profileIdList, selectedFitProfilesObj, fitprofileCreatedId){         //FitProfile ShopFlow
                var self=this;
                if (clientID) {
                    var param = new Object();
                    param.type = "get_profile";
                    param.data = JSON.stringify({
                        filters: ["custrecord_fp_client||anyof|list|" + clientID],
                        columns: ["internalid", "name", "created", "lastmodified", "custrecord_fp_product_type", "custrecord_fp_measure_type", "custrecord_fp_measure_value", "custrecord_fp_block_value"]
                    });
                    Utils.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "GET", param).always(function (data) {

                        if (data) {
                            var fitProfilesByGroup = new Array();
                            var clothingType = self.itemClothingType.split(",");

                            if (data && clothingType && clothingType[0] != "&nbsp;") {
                                fitProfileData = JSON.parse(data);
                                window.currentFitProfile = fitProfileData;
                                self.fit_profile_collection = fitProfileData;
                                _.each(clothingType, function (type) {
                                    var profileObj = new Object(),
                                        profileArr = new Array();

                                    type = type.replace(" ", "");
                                    for(var i = 0; i < fitProfileData.length; i++){
                                        self.blockValueMapping[fitProfileData[i].internalid] = (fitProfileData[i].custrecord_fp_product_type + '-' + fitProfileData[i].custrecord_fp_block_value).toLowerCase();
                                        if (fitProfileData[i].custrecord_fp_product_type.trim() == type.trim()) {
                                            profileArr.push(fitProfileData[i]);
                                        }
                                    }
                                    profileObj.profile_type = type;
                                    profileObj.profiles = profileArr;

                                    fitProfilesByGroup.push(profileObj);
                                });
                            }
                            var selectedFitProfilesArr = [];
                            if(selectedFitProfilesObj){ //For edit of fit profile
                                selectedFitProfilesObj = JSON.parse(selectedFitProfilesObj);
                                for(var i = 0; i < selectedFitProfilesObj.length; i++){
                                    selectedFitProfilesArr.push(selectedFitProfilesObj[i].id);
                                }
                                profileIdList = selectedFitProfilesArr;
                            }
                            $('#fit-profile-shopflow').html(Utils.fitProfileOptionDropdownShopFlow(fitProfilesByGroup, clientID, profileIdList, fitprofileCreatedId));
                            if(fitprofileCreatedId){
                                self.updateQuantity(fitprofileCreatedId);
                            }
                            self.extra_fabric = jQuery('#fabric_extra').val();
                            self.reCalculateQuantity();
                        }
                    });
                }
            }

        ,   swxClientProfileSelect: function (e, client_id) {
                var $ = jQuery;
                var selectedClientIdValue = '';
                if(client_id){
                    selectedClientIdValue = client_id;
                } else {
                    selectedClientIdValue = e.target.getAttribute('swx-client-id');
                }

                var self = this;
                jQuery("div[data-type='alert-placeholder']").empty();

                var currentUser = this.profile_model.get("parent");
                
                this.getClientData(currentUser);
                if (this.selected_client_data) {

                    var clientOptionsSelectId = 'clients-options';

                    var clientCollection = new client_collection();
                    var updatedCollection = Utils.addFunc(clientCollection, this.selected_client_data);
                    var clientCollection = updatedCollection
                    var stClientCollection = JSON.stringify(clientCollection);
                    var arrObjClientCollection = (!_.isNull(stClientCollection)) ? JSON.parse(stClientCollection) : [];

                    $("select[id='" + clientOptionsSelectId + "']").val(selectedClientIdValue);
                    $("select[id='" + clientOptionsSelectId + "']").change();
                    $("#swx-client-profile-details").empty();
                    $("div[id='swx-client-profile-list']").hide();
                    $("[id='order-history']").empty();
                    $("div[id='swx-client-profile-list']").hide();
                    $("div[id='swx-order-client-contents']").hide();
                    $("#swx-client-profile-details").html(Utils.swxMyAccountClientProfileDetails(arrObjClientCollection, selectedClientIdValue));
                    $("div[id='swx-client-profile-view']").show();

                    var clientID = selectedClientIdValue;
                    if (clientID) {
                        var param = new Object();
                        param.type = "get_profile";
                        param.data = JSON.stringify({
                            filters: ["custrecord_fp_client||anyof|list|" + clientID],
                            columns: ["internalid", "name", "created", "lastmodified", "custrecord_fp_product_type", "custrecord_fp_measure_type", "custrecord_fp_measure_value"]
                        });
                        Utils.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "GET", param).always(function (data) {

                            if (data) {
                                self.profile_collection = data;
                                self.fit_profile_collection = JSON.parse(data);
                                $('#fit-profile').html(Utils.fitProfileOptionDropdown(self.profile_collection, clientID));
                            }
                        });

                        //02/09/2019 Saad
                        var param1 = new Object();
                        param1.type = "get_alterations";
                        param1.data = JSON.stringify({
                            filters: ["custrecord_alterations_client||anyof|list|" + clientID],
                            columns: ["internalid", "name", "lastmodified", "custrecord_alterations_measure_values"]
                        });
                        Utils.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "GET", param1).always(function(data){
                            if(data){
                                self.alteration_collection = data;
                                $("#alterations-form").html(Utils.alterationsOptionDropdown(self.alteration_collection, clientID));

                            }
                        });
                        //02/09/2019 Saad
                    }
                    var objRef = {};
                    objRef['customerid'] = self.profile_model.get("parent");;
                    objRef['clientprofileid'] = selectedClientIdValue;

                    this.getOrdersDetails();
                }
            }

        ,   getOrdersDetails: function(){
                var clientFullName1 = $('#fitProfileClientName').html();
                var clientid =jQuery('#fitProfileClientInternalId').text();

                var param = new Object();
                param.action = "getordersV2";
                param.clientname = clientFullName1;
                param.page = -1;
                param.clientid = clientid;
                
                var filteredClientOrderHistory = [];
                Utils.requestUrl("customscript_myaccountsuitelet", "customdeploy1", "GET", param).always(function (data) {
                    var collection = (data) ? JSON.parse(data).records : [];
                    _.each(collection,function (model) {
                        filteredClientOrderHistory.push({
                            transtatus: model.status,
                            orderDate: model.date,
                            orderNum: model.so_id,
                            item: model.item,
                            fabricStatus: model.fabricstatus,
                            cmtStatus: model.cmtstatus,
                            custcol_avt_date_needed: model.custcol_avt_date_needed,
                            tranline_status: model.tranline_status,
                            solinekey: model.solinekey,
                            internalid: model.internalid,
                            internalid1: model.internalid1,
                            clearstatus: model.clearstatus,
                            custcol_flag: model.custcol_flag
                        });
                    });
                    $("#order-history").html(Utils.fitProfileClientorderHistoryMacro(filteredClientOrderHistory));
                });
            }

        ,   getClientData: function(clientId, async){
                var async = (async) ? async : false;
                var self = this, 
                param = new Object();
                param.type = "get_client";
                param.data = JSON.stringify({
                    filters: ["custrecord_tc_tailor||anyof|list|" + clientId],
                    columns: ["internalid", "created", "custrecord_tc_first_name", "custrecord_tc_last_name", "custrecord_tc_dob", "custrecord_tc_company", "custrecord_tc_email", "custrecord_tc_addr1", "custrecord_tc_addr2", "custrecord_tc_country", "custrecord_tc_city", "custrecord_tc_state", "custrecord_tc_zip", "custrecord_tc_phone", "custrecord_tc_notes"]
                });
                if(this.selected_client != clientId){
                    this.getData(Utils.getAbsoluteUrl('services/fitprofile.ss'), param, async, function(data){
                        if (data) {
                            self.selected_client = clientId;
                            self.selected_client_data = data;
                        }
                    });
                }
            }

        ,   getData: function(url, params, async, success_callback){
                jQuery.ajax({
                    url: url, 
                    data: params,
                    type: 'get',
                    async: async,
                    success: function (data) {
                        if(success_callback){
                            success_callback(data);
                        }
                    }
                });
            }

        ,    ClientEdit: function (e) {
                e.preventDefault();
                var $ = jQuery;
                var selector = jQuery(e.target)

                var clientfpid= selector.attr("data-id");

                window.clientfirprofileid = clientfpid;  //27/08/2019 Saad   fitprofile
                if(window.clientfirprofileid){
                    var clientId =  window.clientfirprofileid;
                }
                else{
                    var clientId = $('#fitProfileClientInternalId').text();
                }

                jQuery("div[data-type='alert-placeholder']").empty();

                var currentUser = this.profile_model.get("parent");
                this.getClientData(currentUser);

                if (this.selected_client_data) {
                    var clientCollection = new client_collection();
                    var updatedCollection = Utils.addFunc(clientCollection, this.selected_client_data);
                    var clientCollection = updatedCollection
                    var stClientCollection = JSON.stringify(clientCollection);
                    var arrObjClientCollection = (!_.isNull(stClientCollection)) ? JSON.parse(stClientCollection) : [];
                    if(window.clientfirprofileid)  //27/08/2019 Saad   fitprofile
                    {
                        $("#clientmodal1").empty();
                        $("#clientmodal1").html(Utils.ClientEditForm(arrObjClientCollection, clientId));
                    }
                    else{
                        $("#clientmodal").empty();
                        $("#clientmodal").html(Utils.ClientEditForm(arrObjClientCollection, clientId));
                    }
                }
            }
            
        ,   swxOrderClientSearch: function (e) {     // 03/07/2019 Saad
                if(e){
                    e.preventDefault();
                }
                var $ = jQuery;

                if($('#swx-order-client-name').val() == '' && $('#swx-order-client-email').val() == '' && $('#swx-order-client-phone').val() == ''){
                    alert("Atleast one Search filter is required!");
                    return;
                }

                var self = this;
                jQuery("div[data-type='alert-placeholder']").empty();

                var tailor = this.profile_model.get("parent");
                this.getClientData(tailor);
                if (this.selected_client_data) {
                    var fitarr = [];
                    $("[id='order-history']").empty();
                    var clientCollection = new client_collection();

                    var updatedCollection = Utils.addFunc(clientCollection, this.selected_client_data);

                    clientCollection = updatedCollection;
                    var stClientCollection = JSON.stringify(clientCollection);
                    var arrObjClientCollection = (!_.isNull(stClientCollection)) ? JSON.parse(stClientCollection) : [];

                    fitarr[0] = $('input[name=swx-order-client-name]').val();
                    fitarr[1] = $('input[name=swx-order-client-email]').val();
                    fitarr[2] = $('input[name=swx-order-client-phone]').val();

                    self.objFilters['name'] = !_.isNull(fitarr[0]) ? fitarr[0] : '';
                    self.objFilters['email'] = !_.isNull(fitarr[1]) ? fitarr[1] : '';
                    self.objFilters['phone'] = !_.isNull(fitarr[2]) ? fitarr[2] : '';

                    var arrObjClient = Utils.getArrObjOrderClientList(arrObjClientCollection, self.objFilters);
                    $("#swx-order-client-list").empty();
                    if(arrObjClient.length != 0){
                        var clientTemplate = self.swxOrderClientList(arrObjClient);
                        $("#swx-order-client-list").html(clientTemplate);
                    } else {
                        alert("No record were found. Please adjust your search criteria and try again.")

                    }
                }
            }

        ,   swxOrderClientList: function (paramClientList) {
                var template = '';
                var arrObjClientList = paramClientList;
                var arrObjClientListTotal = (!_.isNull(arrObjClientList)) ? arrObjClientList.length : 0;
                var hasArrObjClientList = (arrObjClientListTotal != 0) ? true : false;


                //27/08/2019 Saad   fitprofile

                template += '<div class="modal fade" id="myModal3" role="dialog" data-backdrop="static">'; // zain 15-07-19
                template += '<div class="modal-dialog">';


                template += '<div class="modal-content">';
                template += '<div class="modal-header">';
                template += ' <button type="button" class="close cancel-action" data-dismiss="modal">&times;</button>'; // zain 15-07-19
                template += '<h4 class="modal-title">Edit Client</h4>';  //18/07/2019 Saad
                template += '</div>';
                template += '<div class="modal-body">';
                template += ' <div id="clientmodal1">';
                template += '</div>';

                template += ' </div>';
                template += '<div class="modal-footer" >';
                template += '<p class="actions">';
                template += '<a class="custom-btn save-action-edit" data-dismiss="modal">';
                template += 'Save';
                template += ' </a>';

                template += '<a class="custom-btn cancel-action" data-dismiss="modal">';
                template += 'Cancel';
                template += '</a>';
                template += '</p>';
                template += '</div>';
                template += '</div>';

                template += '</div>';
                template += ' </div>';

                if (hasArrObjClientList) {
                    template += '<style>#clientsOptionDropdown td{padding-left:10px;padding-right:10px;padding-bottom:5px !important;padding-top:5px !important; vertical-align: middle !important;}tr#clientsOptionDropdown{border-bottom: 1px solid #e5e5e5;}#clientsOptionDropdown th{padding-left:10px;padding-right:10px;}body{font-family: "Raleway", sans-serif !important;}a#swx-client-profile-select{color: #5f5f5f;background: linear-gradient(to bottom, white, #e6e6e6);border: 1px solid #e6e6e6;}a#swx-client-profile-select:hover{background: #cecccc !important;}</style>';
                    template += '<div id="clientsOptionDropdown">';

                    template += '<div id="desktop-only" class="row-fluid back-btn" style="margin-bottom: 8px;">';

                    template += '<div class="table-responsive" style="clear:both;">'
                    template += '<table style="margin-top:15px;border-top:none !important;">'; // zain (25-06-19) // zain 28-08-19
                    template += '<thead>';
                    template += '<tr>';
                    template += '<th><b>Client Name</b></th>';
                    template += '<th><b>Email</b></th>';
                    template += '<th><b>Phone</b></th>';
                    template += '<th class="disappear">&nbsp;</th>';
                    template += '<th class="disappear">&nbsp;</th>';
                    template += '<th class="disappear">&nbsp;</th>';
                    template += '<th>&nbsp;</th>';
                    template += '</tr>';
                    template += '</thead>';

                    for (var dx = 0; dx < arrObjClientListTotal; dx++) {
                        var clientNameValue = '';
                        var clientInternalId = arrObjClientList[dx]['internalid'];
                        var clientEmail = arrObjClientList[dx]['custrecord_tc_email'];
                        var clientPhone = arrObjClientList[dx]['custrecord_tc_phone'];
                        var clientState = arrObjClientList[dx]['custrecord_tc_state'];
                        var clientFirstName = arrObjClientList[dx]['custrecord_tc_first_name'];
                        var clientLastName = arrObjClientList[dx]['custrecord_tc_last_name'];
                        var hasClientFirstName = (!_.isNull(clientFirstName)) ? true : false;
                        var hasClientLastName = (!_.isNull(clientLastName)) ? true : false;
                        clientNameValue += (hasClientFirstName) ? clientFirstName + ' ' : '';
                        clientNameValue += (hasClientLastName) ? clientLastName : '';
                        template += '<tr id="clientsOptionDropdown">';
                        template += '<td> ' + clientNameValue + ' </td>';
                        template += '<td> ' + clientEmail + ' </td>';
                        template += '<td> ' + clientPhone + ' </td>';

                        //28/08/2019 Saad
                        template += '<td><a data-id='+clientInternalId+' id="remove-client-button-2" data-type="client" data-action="remove-rec-client" class="btn disappear" style="width: 83%; padding-top: 4px; padding-bottom: 4px; padding-left: 0px; padding-right: 0px;background: linear-gradient(to bottom, white, #e6e6e6);border-radius: 5px;border: 1px solid #e6e6e6;color: #656363;">Remove</a></td>'; // 26-07-19
                        template += '<td><button id="client-edit" data-id='+clientInternalId+' data-toggle="modal" data-target="#myModal3" class="btn disappear" style="width: 80%; padding-top: 4px; padding-bottom: 4px; padding-left: 0px; padding-right: 0px;background: linear-gradient(to bottom, white, #e6e6e6);margin-right: 28px;border-radius: 5px;border: 1px solid #e6e6e6;color: #656363;">View & Edit</button></td>';

                        // zain (25-06-19) start
                        template += '<td class="disappear"><a  href="/item-type?client=' + clientInternalId + '" data-touchpoint="home" data-hashtag="#item-type?client=' + clientInternalId + '" class="btn btn-primary" style="width: 100%; padding-top: 4px; padding-bottom: 4px; padding-left: 0px; padding-right: 0px;font-weight: bold;border: 1px solid #e1e1e1 !important;color: #2A2B2D;">Create Order</a></td>'; // zain (25-06-19)
                        // zain (25-06-19) end
                        // zain (19-06-19) start
                        template += '<td><a id="swx-client-profile-select" class="btn profile-select-class" swx-client-id="' + clientInternalId + '" value="' + clientInternalId + '" style="width: 100%; padding-top: 4px; padding-bottom: 4px; padding-left: 0px; padding-right: 0px;">Select</a></td>'; // zain 28-08-19
                        // zain (19-06-19) end
                        template += '</tr>';

                    }

                    template += '</table>';
                    template += '</div>';
                    template += '</div>';
                    template += '</div>';
                    // zain (19-06-19) start (22-07-19 change url)
                    template +='<script>';
                    // zain (15-07-19) start

                    template += "$('#clientsOptionDropdown #remove-client-button').click(function() {";
                    template +="$(this).closest('#clientsOptionDropdown').find('#swx-client-profile-select').trigger('click');";
                    template +="setTimeout(function(){";
                    template +="$('.shopping-layout-content #swx-client-profile-view #remove-client-button-2').trigger('click');";
                    template +="$('.shopping-layout-content .cancel-action').trigger('click');";
                    template +="}, 100);";
                    template +="$('.cancel-action').click(function(e){";
                    // template += "$('#myModal2').css('visibility', 'hidden');";
                    template += "location.reload();";
                    template +="});";
                    template +="});";

                    template +="$('#clientsOptionDropdown #swx-client-profile-select').click(function() {";
                    template +="setTimeout(function(){";
                    template +="$('.shopping-layout-content #swx-client-profile-view #client-edit').trigger('click');";
                    template +="}, 1000);";
                    template +="});";

                    // zain (08-07-19) end
                    template +='$(".shopping-layout-content").on("click",".cancel-action",function(e){';
                    template +="e.preventDefault();";
                    template +="setTimeout(function(){";
                    template += '$("#swx-back-to-client-profile-search").click();';
                    template +="}, 100);";
                    // template += "location.reload();";
                    template +='});';

                    template +='$(".shopping-layout-content").on("click",".save-action-edit",function(e){';
                    template +="e.preventDefault();";
                    template +="setTimeout(function(){";
                    template += '$("#swx-back-to-client-profile-search").click();';
                    template +="}, 100);";
                    // template += "location.reload();";
                    template +='});';


                    template +='var link = $(location).attr("href");';
                    template +='if(link == "http://jcsca3.dynasoftcloud.com/fitprofile") {'; // zain 07-08-19
                    template +='$(".profile-select-class").each(function(){';
                    template +='$(this).html("Edit");';
                    template +='});';
                    template +='}';

                    // zain (15-07-19) end
                    template +='</script>';
                    // zain (19-06-19) end

                }

                return template;
            }
                
        ,    category: function (clientId) {
                var template = '';
                template += '<div class="view-header container" itemscope itemtype="http://schema.org/WebPage">';

                if (Backbone.history.fragment.split("?").length > 1) {
                    var fragmentArray = Backbone.history.fragment.split("?"),
                        clientId = Backbone.history.fragment.split("?")[1].split("=")[1].split("&")[0] || "";

                    for (var i = fragmentArray.length - 1; i >= 0; i--) {
                        if (fragmentArray[i].match('client')) {
                            clientId = fragmentArray[i].split("=")[1].split("&")[0];
                            break;
                        }
                    }
                } else {
                    clientId = null
                }

                template += '</div>';
                template += '<div class="gradient-content">';
                template += '<div class="container">';
                template += '<div class="row-fluid view-body">';
                template += '<section id="category-list-container" class="span12 category-list-container">';
                template += '<div id="banner-section-top" class="content-banner banner-section-top"></div>';
                template += '<div class="category-list-header">';
                template += '<span class="category-list-heading">';
                template += ' ' + facet.configuration.name + ' ';
                template += '</span>';
                template += '<a href="/ facet.configuration.url " class="pull-right">';
                template += 'Shop All &gt';
                template += '</a>';
                template += '</div>';
                Utils.displayInRows(facet.values.values, categoryCell, 4)

                template += '<div id="banner-section-bottom" class="content-banner banner-section-bottom"></div>';
                template += '	</section>';
                template += '</div>';
                if (view.category.itemid != "Inventory") {
                    template += '<div class="row-fluid view-body">';
                    template += '<div class="span3">';
                    template += '<div class="category-cell">';
                    template += '<div class="category-cell-name">';
                    template += '	<a data-hashtag="#productlists/?id=clientId" data-touchpoint="customercenter" href="#" class="btn">';
                    template += '	 My Product List';
                    template += '</a>';
                    template += '	</div>';
                    template += '	</div>';
                    template += '	</div>';
                    template += '</div>';
                }
                template += ' </div>';
                template += '</div>';

                return template;
            }

        ,   removeRecClientFitProfile: function (e) { //26/07/2019 Saad
                e.preventDefault();
                // April CSD Issue #036
                var message = _("Are you sure that you want to delete this client and its fit profiles?").translate();

                if (window.confirm(message)) {
                    var selector = jQuery(e.target);

                    var type = selector.data("type")
                        , self = this;
                    this.profile_model.removeRec(type, selector.attr("data-id"));
                    this.profile_model.on("afterRemoveRec", function () {
                        self.selected_client_data = _.filter(self.selected_client_data, function(model){
                            return model.internalid != selector.attr("data-id");
                        })
                        self.profile_model.set("current_client", null);
                        self.profile_model.set('swx_is_display_client_details', '');
                        self.showContent();
                    });
                }
            }

        ,   swxBackToClientSearch: function (e) {
                var $ = jQuery;

                var clientOptionsSelectId = 'clients-options';
                $("button[id='swx-order-client-search']").click();


                this.$("select[id='" + clientOptionsSelectId + "']").val('');
                this.$("select[id='" + clientOptionsSelectId + "']").change();

                $("[id='fit-profile']").empty();
                $("[id='fit-profile-shopflow']").empty();
                $("[id='profile-section']").empty();
                $("[id='order-history']").empty();
                $("[id='saveForLaterItems']").empty();
                $("[id='swx-client-profile-details']").empty();
                $("[id='swx-client-profile-list']").show();
                $("[id='swx-order-client-contents']").show();

            }

        ,   getContext: function () {
                // @class Profile.Information.View.Context
                return {

                    isDisplayClientDetailsValue: this.isDisplayClientDetailsValue,
                    objFilters: this.objFilters,
                    profile_model: this.profile_model,
                    tailorId: this.profile_model.get("parent"),
                    clientid: this.selectedClientIdValue,
                    isPdpTrue : !!this.pdpClientId ? false : true
                    ,showCountriesField: this.quantity_countries > 1

                }
            }

        ,   saveForm: function (e) {

                var $ = jQuery;
                if($('#firstname').val() == '' || $('#lastname').val() == '' || $('#email').val() == '' || $('#phone').val() == ''){

                    $('[data-type="alert-placeholder"]').html(
                        Utils.message(_(' Sorry, the information below is either incomplete or needs to be corrected.').translate(), 'error', true)
                    );

                    if($('#firstname').val() == ''){
                        var div = $('#firstname').closest('div');
                        var para = div.find('p');
                        if(para.length == 0){
                            div.append('<p class="help-block" style="color: #b94a48;font-size:">First Name is required</p>');
                            $('[for=firstname]').css('color','#b94a48');
                            $('#firstname').css('border-color','#b94a48');
                        }
                    }
                    else{
                        var div = $('#firstname').closest('div');
                        var para = div.find('p').remove();
                        $('[for=firstname]').css('color','');
                        $('#firstname').css('border-color','');
                    }
                    if($('#lastname').val() == ''){

                        var div = $('#lastname').closest('div');
                        var para = div.find('p');
                        if(para.length == 0){
                            div.append('<p class="help-block" style="color: #b94a48;font-size:">Last Name is required</p>');
                            $('[for=lastname]').css('color','#b94a48');
                            $('#lastname').css('border-color','#b94a48');
                        }
                    }
                    else{
                        var div = $('#lastname').closest('div');
                        var para = div.find('p').remove();
                        $('[for=lastname]').css('color','');
                        $('#lastname').css('border-color','');
                    }

                    if($('#email').val() == ''){

                        var div = $('#email').closest('div');
                        var para = div.find('p');
                        if(para.length == 0){
                            div.append('<p class="help-block" style="color: #b94a48;font-size:">Email is required</p>');
                            $('[for=email]').css('color','#b94a48');
                            $('#email').css('border-color','#b94a48');
                        }
                    }
                    else{
                        var div = $('#email').closest('div');
                        var para = div.find('p').remove();
                        $('[for=email]').css('color','');
                        $('#email').css('border-color','');
                    }

                    if($('#phone').val() == ''){

                        var div = $('#phone').closest('div');
                        var para = div.find('p');
                        if(para.length == 0){
                            div.append('<p class="help-block" style="color: #b94a48;font-size:">Phone is required</p>');
                            $('[for=phone]').css('color','#b94a48');
                            $('#phone').css('border-color','#b94a48');
                        }
                    }
                    else{
                        var div = $('#phone').closest('div');
                        var para = div.find('p').remove();
                        $('[for=phone]').css('color','');
                        $('#phone').css('border-color','');
                    }

                    return;
                }
                else if ($('#email').val() != ''){
                    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                    var div = $('#email').closest('div');
                    var para = div.find('p');
                    if($('#email').val().match(mailformat))
                    {
                        var div = $('#email').closest('div');
                        var para = div.find('p').remove();
                        $('[for=email]').css('color','');
                        $('#email').css('border-color','');
                    }
                    else{
                        div.append('<p class="help-block" style="color: #b94a48;font-size:">Email is Invalid</p>');
                        $('[for=email]').css('color','#b94a48');
                        $('#email').css('border-color','#b94a48');
                        return;
                    }
                }
                // changed on 6/20/2019 Saad (End)

                // if($('#firstname').val() == '' || $('#lastname').val() == '' || $('#email').val() == '' || $('#phone').val() == ''){

                //     $('[data-type="alert-placeholder"]').html(
                //         Utils.message(_(' Sorry, the information below is either incomplete or needs to be corrected.').translate(), 'error', true)
                //     );

                //     if($('#firstname').val() == ''){
                //         var div = $('#firstname').closest('div');
                //         var para = div.find('p');
                //         if(para.length == 0){
                //             div.append('<p class="help-block" style="color: #b94a48;font-size:">First Name is required</p>');
                //             $('[for=firstname]').css('color','#b94a48');
                //             $('#firstname').css('border-color','#b94a48');
                //         }
                //     }
                //     if($('#lastname').val() == ''){

                //         var div = $('#lastname').closest('div');
                //         var para = div.find('p');
                //         if(para.length == 0){
                //             div.append('<p class="help-block" style="color: #b94a48;font-size:">Last Name is required</p>');
                //             $('[for=lastname]').css('color','#b94a48');
                //             $('#lastname').css('border-color','#b94a48');
                //         }
                //     }

                //     if($('#email').val() == ''){

                //         var div = $('#email').closest('div');
                //         var para = div.find('p');
                //         if(para.length == 0){
                //             div.append('<p class="help-block" style="color: #b94a48;font-size:">Email is required</p>');
                //             $('[for=email]').css('color','#b94a48');
                //             $('#email').css('border-color','#b94a48');
                //         }
                //     }

                //     if($('#phone').val() == ''){

                //         var div = $('#phone').closest('div');
                //         var para = div.find('p');
                //         if(para.length == 0){
                //             div.append('<p class="help-block" style="color: #b94a48;font-size:">Phone is required</p>');
                //             $('[for=phone]').css('color','#b94a48');
                //             $('#phone').css('border-color','#b94a48');
                //         }
                //     }

                //     return;
                // }

                var formValues = jQuery("#client_form").serialize().split("&");
                var self = this;
                var dataToSend = new Array();
                var firstname = jQuery('input[name=custrecord_tc_first_name]').val();
                var lastname = jQuery('input[name=custrecord_tc_last_name]').val();
                var email = jQuery('input[name=custrecord_tc_email]').val();
                var phone = jQuery('input[name=custrecord_tc_phone]').val();

                _.each(formValues, function (formValue) {
                    var field = formValue.split("=")[0],
                        value = formValue.split("=")[1],
                        formData = new Object();

                    if (field == "state") {
                        formData.name = "custrecord_tc_state";
                    } else if (field == "country") {
                        formData.name = "custrecord_tc_country";
                    } else {
                        formData.name = field;
                    }


                    formData.value = decodeURIComponent(value.replace("+", " "));
                    formData.type = jQuery("[name=" + field + "]").data("rectype");
                    formData.sublist = jQuery("[name=" + field + "]").data("sublist");

                    if (self.id != "new") {
                        if (field != "custrecord_tc_tailor" && field != "custrecord_fp_client" && field != "custrecord_fm_fit_profile" && field != "custrecord_fm_tailor") {
                            dataToSend.push(formData);
                        }
                    } else {
                        dataToSend.push(formData);
                    }

                    var testing2 = new ProfileModel({
                        field: field,
                        model: self.model,
                        model2: self.model2
                    });
                });

                var param = new Object();
                param.type = "create_client";
                if (this.id != "new") {
                    param.id = this.profile_model.get("parent");
                }
                param.data = JSON.stringify(dataToSend);

                Utils.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "POST", param).always(function (data) {
                    var newRec = JSON.parse(data);
                    if (data) {
                        if (self.id == "new") {
                            if (self.type == "measure") {
                                self.options.profileModel.tailor_measure_collection.add(newRec.rec);
                            }
                        }
                        var showMessage = '';
                        if(self.id == "new"){
                            showMessage = 'Client was created';
                        } else {
                            showMessage = 'Client was updated';
                        }
                        self.selected_client_data.push(newRec.rec);
                        jQuery(".show-remove-error-fitprofile").html("<div class='alert alert-success alert-dismissible fade in'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" + showMessage + "</div>");
                        jQuery(".cancel-action").trigger("click");
                        jQuery('#swx-order-client-name').val(firstname + ' ' + lastname);
                        jQuery('#swx-order-client-email').val(email);
                        jQuery('#swx-order-client-phone').val(phone);
                        self.swxOrderClientSearch('');
                        $('#client_form')[0].reset();
                        //self.options.application.getLayout().currentView.showContent();
                    }
                });


                $("#myModal").modal("toggle");

            }

        ,   saveeditForm: function (e) {
                var formValues = jQuery("#clientedit_form").serialize().split("&");
                var self = this;
                var dataToSend = new Array();
                
                _.each(formValues, function (formValue) {
                    var field = formValue.split("=")[0],
                        value = formValue.split("=")[1],
                        formData = new Object();

                    if (field == "state") {
                        formData.name = "custrecord_tc_state";
                    } else if (field == "country") {
                        formData.name = "custrecord_tc_country";
                    } else {
                        formData.name = field;
                    }


                    formData.value = value.replace("+", " ");
                    formData.type = jQuery("[name=" + field + "]").data("rectype");
                    formData.sublist = jQuery("[name=" + field + "]").data("sublist");

                    if (self.id != "new") {
                        if (field != "custrecord_tc_tailor" && field != "custrecord_fp_client" && field != "custrecord_fm_fit_profile" && field != "custrecord_fm_tailor") {
                            dataToSend.push(formData);
                        }
                    } else {
                        dataToSend.push(formData);
                    }

                });
                var param = new Object();

                if(window.clientfirprofileid){       //27/08/2019 Saad   fitprofile
                    param.id =   window.clientfirprofileid;
                    window.clientfirprofileid=" ";
                } else{
                    param.id =   $('#fitProfileClientInternalId').text();
                }

                param.type = "update_client";
                
                param.data = JSON.stringify(dataToSend);

                Utils.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "POST", param).always(function (data) {
                    var newRec = JSON.parse(data);
                    _.map(self.selected_client_data, function(profile){
                        if(profile.internalid == newRec.id){
                            _.each(Object.keys(profile), function(key){
                                if(newRec.rec[key] && newRec.rec[key] != "undefined"){
                                    profile[key] = newRec.rec[key];
                                }
                            });
                        }
                        return profile;
                    });
    
                    var currentTailor = _.find(self.selected_client_data, function(profile){
                        return profile.internalid == newRec.id;
                    });
                    if (newRec.status) {
                        if (self.id == "new") {
                            if (self.type == "measure") {
                                self.options.profileModel.tailor_measure_collection.add(newRec.rec);
                            }
                        }
                        
                        if(newRec.rec){
                            jQuery("div[data-type='alert-placeholder']").empty();
                            jQuery("#fitProfileClientName").html(currentTailor.custrecord_tc_first_name+" "+currentTailor.custrecord_tc_last_name);
                            jQuery("#clientEmail").html(currentTailor.custrecord_tc_email);
                            jQuery("#clientPhone").html(currentTailor.custrecord_tc_phone);
                            jQuery("#clientDOB").html(currentTailor.custrecord_tc_dob);
                            jQuery("#clientCompany").html(currentTailor.custrecord_tc_company);
                            jQuery("#clientAddress").html(currentTailor.custrecord_tc_addr1+","+currentTailor.custrecord_tc_addr2);
                            jQuery("#clientNotes").html(currentTailor.custrecord_tc_notes);

                        }
                        var str = window.location.href;
                        if(str.indexOf('my_account')!=-1 && str.indexOf('fitprofile')!=-1){
                            jQuery(".cancel-action").trigger("click");
                            jQuery(".show-remove-error-fitprofile").html("<div class='alert alert-success alert-dismissible fade in'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a> Record was updated </div>");
                            setTimeout(function(){
                                jQuery("[data-dismiss='alert']").trigger('click'); //to auto remove alert 
                            }, 3000);
                            var client_id = jQuery('#fitProfileClientInternalId').text();
                            self.swxClientProfileSelect('', client_id);
                        }else{
                            $('input[name=swx-order-client-name]').val(currentTailor.custrecord_tc_first_name+" "+currentTailor.custrecord_tc_last_name);
                            $('#swx-order-client-search').trigger('click');
                        }
                    }
                });
            }

        ,   updateFinalMeasure: function (e) { //16/12/2019 Saad
                var field = jQuery(e.target),
                    id = field.prop("id").indexOf("_") > -1 ? field.prop("id").split("_")[1] : field.prop("id"),
                    isAllowance = field.prop("id").indexOf("_") > -1 ? true : false,
                    finalMeasure = 0;

                if (isAllowance) {
                    if (_.isNaN(jQuery("[id='allowance_" + id + "']").val()) || jQuery("[id='allowance_" + id + "']").val() === "") {
                        // finalMeasure =  (parseFloat(jQuery("#" + id).val()) * (parseFloat(field.data("baseval")) / 100)) + parseFloat(jQuery("#" + id).val());
                        finalMeasure = 0 + parseFloat(field.val());
                    } else {
                        //finalMeasure = parseFloat(jQuery("#" + id).val()) + parseFloat(field.val());
                        finalMeasure = parseFloat(jQuery("[id='" + id + "']").val()) + parseFloat(field.val());
                    }
                } else {
                    if (_.isNaN(jQuery("[id='allowance_" + id + "']").val()) || jQuery("[id='allowance_" + id + "']").val() === "") {
                        // finalMeasure = (parseFloat(field.val()) * (parseFloat(jQuery("#allowance_" + id).data("baseval")) / 100)) + parseFloat(field.val());
                        finalMeasure = 0 + parseFloat(field.val());
                    } else if (jQuery("[id='allowance_" + id + "']").val() == 0) {
                        var value = jQuery("#fit").val(),
                            self = this,
                            lookUpTable = self.selected_measurement["lookup-value"][value],
                            name = jQuery(e.target).attr('name'),
                            lookUpValue = _.where(lookUpTable, {
                                field: name
                            }),
                            finalMeasure = 0,
                            allowance = 0;

                        var selectedUnit = jQuery('#units').val();
                        if (selectedUnit === 'Inches') {
                            lookUpValue = (lookUpValue / 2.54);
                            if (lookUpValue > 0) {
                                lookUpValue = lookUpValue.toFixed(1);
                            }
                        }

                        if (lookUpValue && lookUpValue.length) { // Update allowance field if there is a lookup value provided that allowance is 0
                            //jQuery("#allowance_" + id).val(lookUpValue[0].value);
                            jQuery("[id='allowance_" + id + "']").val(lookUpValue[0].value)
                            allowance = jQuery("[id='allowance_" + id + "']").val();
                        }
                        finalMeasure = parseFloat(allowance) + parseFloat(jQuery("[id='" + id + "']").val());
                    } else {
                        //finalMeasure = parseFloat(jQuery("#allowance_" + id).val()) + parseFloat(field.val());
                        //finalMeasure = parseFloat(jQuery(idAllowancePrefix + id).val()) + parseFloat(jQuery(idPrefix + id).val());
                        finalMeasure = parseFloat(jQuery("[id='allowance_" + id + "']").val()) + parseFloat(jQuery("[id='" + id + "']").val())
                    }
                }

                if (_.isNaN(finalMeasure)) {
                    finalMeasure = 0;
                }
                var finalMeasureEl = ("#finish_" + id).replace('#', '');
                //jQuery("#finish_" + id).html(Math.round(finalMeasure * 10) / 10);
                jQuery("[id='" + finalMeasureEl + "']").html(Math.round(finalMeasure * 10) / 10);
                //Now that the final measure is set.. we need to check if there are presets to update the other measurement
                var fit = jQuery('[name="fit"]').val();
                var productType = jQuery('[name="custrecord_fp_product_type"]').val();
                var presets = _.where(window.presetsConfig, {
                    make: productType
                });
                var selectedUnit = jQuery('[name="units"]').val();
                for (var i = 0; i < presets.length; i++) {
                    if (presets[i].profile && presets[i].profile.indexOf(fit) != -1) {
                        if (presets[i][id]) {
                            //Check for the values
                            var setranges = presets[i][id];
                            var rangeindex = Math.floor(setranges.length / 2);
                            var rangetop = setranges.length - 1,
                                rangebottom = 0,
                                notfound = true;
                            do {
                                var toplower = selectedUnit === 'Inches' ? parseFloat(setranges[rangetop].lower) / 2.54 : parseFloat(setranges[rangetop].lower),
                                    topupper = selectedUnit === 'Inches' ? parseFloat(setranges[rangetop].upper) / 2.54 : parseFloat(setranges[rangetop].upper),
                                    bottomlower = selectedUnit === 'Inches' ? parseFloat(setranges[rangebottom].lower) / 2.54 : parseFloat(setranges[rangebottom].lower),
                                    bottomupper = selectedUnit === 'Inches' ? parseFloat(setranges[rangebottom].upper) / 2.54 : parseFloat(setranges[rangebottom].upper),
                                    indexlower = selectedUnit === 'Inches' ? parseFloat(setranges[rangeindex].lower) / 2.54 : parseFloat(setranges[rangeindex].lower),
                                    indexupper = selectedUnit === 'Inches' ? parseFloat(setranges[rangeindex].upper) / 2.54 : parseFloat(setranges[rangeindex].upper);
                                if (toplower <= parseFloat(finalMeasure) && topupper > parseFloat(finalMeasure)) {
                                    notfound = false;
                                    rangeindex = rangetop;
                                } else if (bottomlower <= parseFloat(finalMeasure) && bottomupper > parseFloat(finalMeasure)) {
                                    notfound = false;
                                    rangeindex = rangebottom;
                                } else if (indexlower <= parseFloat(finalMeasure) && indexupper > parseFloat(finalMeasure)) {
                                    notfound = false;
                                } else if (indexlower > parseFloat(finalMeasure)) {
                                    rangetop = rangeindex;
                                    rangeindex = Math.floor((rangetop - rangebottom) / 2) + rangebottom;
                                } else {
                                    rangebottom = rangeindex;
                                    rangeindex = Math.floor((rangetop - rangebottom) / 2) + rangebottom;
                                }
                            } while (notfound && (rangetop - rangebottom) > 1);
                            if (!notfound) {
                                var keys = Object.keys(setranges[rangeindex].set);
                                for (var l = 0; l <= keys.length; l++) {
                                    if (selectedUnit === 'Inches') {
                                        //if(jQuery("#"+keys[l]).val() == 0 || jQuery("#"+keys[l]).val() == '' ){
                                        jQuery("#" + keys[l]).val((parseFloat(setranges[rangeindex].set[keys[l]]) / 2.54).toFixed(1));
                                        jQuery("#" + keys[l]).trigger('change');
                                        //}
                                    } else {
                                        //if(jQuery("#"+keys[l]).val() == 0 || jQuery("#"+keys[l]).val() == '' ){
                                        jQuery("#" + keys[l]).val(setranges[rangeindex].set[keys[l]]);
                                        jQuery("#" + keys[l]).trigger('change');
                                        //}
                                    }
                                }
                            }
                        }
                        //For Adjustment
                        if (presets[i].adjust && presets[i].adjust.length) {
                            for (var j = 0; j < presets[i].adjust.length; j++) {
                                if (presets[i].adjust[j].part == id) {
                                    var partmeasure = parseFloat(jQuery("[id='" + id + "']").val());
                                    if (partmeasure > 0) {
                                        if (selectedUnit === 'Inches') {
                                            var adjustpart = presets[i].adjust[j].adjustpart;
                                            var adjustval = parseFloat(presets[i].adjust[j].value) / 2.54;
                                            jQuery("[id='" + adjustpart + "']").val((partmeasure + adjustval));
                                            jQuery("[id='" + adjustpart + "']").trigger('change');
                                        } else {
                                            var adjustpart = presets[i].adjust[j].adjustpart;
                                            var adjustval = parseFloat(presets[i].adjust[j].value);
                                            jQuery("[id='" + adjustpart + "']").val((partmeasure + adjustval));
                                            jQuery("[id='" + adjustpart + "']").trigger('change');
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

        ,   disableCounterBlockField: function (e) {    // 6/19/2019 Saad
                jQuery('[class="fav-fit-tools-default"]').html('---');
                var currentField = jQuery(e.target),
                    counterField = currentField.prop("id").indexOf('-max') > -1 ? currentField.prop("id").replace('-max', '-min') : currentField.prop("id").replace('-min', '-max');

                if (counterField && currentField.val() != "0") {
                    jQuery("[id='" + counterField + "']").prop("disabled", true);
                } else {
                    jQuery("[id='" + counterField + "']").prop("disabled", false);
                }

                if (jQuery('[id*="body-block"]').val() != 'Select' && jQuery('[id*="body-fit"]').val() != 'Select') {
                    this.updateBlockAndFinished(jQuery('[id*="body-fit"]').val(), jQuery('[id*="body-block"]').val())
                } else {
                    this.clearBlockAndFinished();
                }
            }

        ,   changedUnits : function(el){   // 6/19/2019 Saad
                var $ = jQuery;

                var productType = jQuery('#custrecord_fp_product_type').val();
                var unit = $('#units').val();


                var configUrl = unit ==='CM'?'javascript/itemRangeConfig.json':'javascript/itemRangeConfigInches.json';
                jQuery.get(Utils.getAbsoluteUrl(configUrl)).done(function (data) {
                    var selectedMeasurementConfig = _.findWhere(data,{ type: productType });
                    _.each(selectedMeasurementConfig.config,function(el){
                        var fiedlName = el.name;
                        if(el.name === 'Sleeve L' || el.name ==='Sleeve R'){
                            fiedlName = fiedlName.replace(' ','-');
                        }

                        $('#range_'+fiedlName).html('('+el.min+'-'+el.max+')');
                        $('#finish_'+fiedlName).attr('min-value', el.min);
                        $('#finish_'+fiedlName).attr('max-value', el.max);


                    });
                    //Update Values
                    var bodyfields = jQuery('.body-measure-fld');
                    if(bodyfields.length >0){
                        if(unit === 'CM'){
                            for(var i=0;i<bodyfields.length;i++){
                                bodyfields[i].value = (parseFloat(bodyfields[i].value?bodyfields[i].value:0)*2.54).toFixed(2)
                            }
                        }
                        else{
                            for(var i=0;i<bodyfields.length;i++){
                                bodyfields[i].value = (parseFloat(bodyfields[i].value?bodyfields[i].value:0)/2.54).toFixed(2)
                            }
                        }
                    }
                    jQuery('.body-measure-fld').trigger('change');
                });

                jQuery('#fit').trigger('change');
            }

        ,   fitBlockChanged: function(e){        // 6/19/2019 Saad
                if((jQuery('[id*="body-block"]').val() != 'Select' && jQuery('[id*="body-fit"]').val() != 'Select') ){
                    this.updateBlockAndFinished(jQuery('[id*="body-fit"]').val(),jQuery('[id*="body-block"]').val())
                }else{
                    this.clearBlockAndFinished();
                }
            }
            
        ,   clearBlockAndFinished: function () {          // 6/19/2019 Saad
                jQuery('[data-container]').html('---');
            }

        ,   updateBlockAndFinished: function (fit, block) { // 6/19/2019 Saad    //01/08/2019 Saad
                var self = this;
                var producttype = jQuery('[name="custrecord_fp_product_type"]').val();
                var blockfields = jQuery('.block-measurement-fld');
                var checklayout='';
                var checklayout1='';
                var str = window.location.href;
                if(str.indexOf('my_account')!=-1 && str.indexOf('fitprofile')!=-1)  //01/08/2019 Saad
                {
                    checklayout=self.options.application._layoutInstance.currentView.measurementdefaults;
                }
                else
                {
                    checklayout=self.measurementdefaults;
                }
                _.each(blockfields, function (blockfield) {
                    var a = _.find(checklayout, function (b) {
                        return b.custrecord_md_blockmeasurement == block && b.custrecord_md_bodyparttext == blockfield.dataset.field && b.custrecord_md_fitoptionstext == fit && b.custrecord_md_producttypetext == producttype;
                    });
                    if (a) {
                        var mdvalue = a.custrecord_md_value ? parseFloat(a.custrecord_md_value).toFixed(1) : '---';
                        jQuery('[data-container="' + blockfield.dataset.field + '-block"]').html(mdvalue);
                        jQuery('[data-container="' + blockfield.dataset.field + '-finished"]').html(mdvalue);
                    }

                });
                _.each(blockfields, function (blockfield) {
                    if (blockfield.value != '0') {
                        if(str.indexOf('my_account')!=-1 && str.indexOf('fitprofile')!=-1){  //01/08/2019 Saad
                            checklayout1=self.options.application._layoutInstance.currentView.influences;
                        }
                        else{
                            checklayout1=self.influences;
                        }
                        var in_items = _.filter(checklayout1, function (c) {
                            return c.custrecord_in_producttypetext == producttype && c.custrecord_in_bodyparttext == blockfield.dataset.field;
                        });

                        if (in_items && in_items.length > 0) {
                            var blockval = parseFloat(blockfield.value);
                            for (var i = 0; i < in_items.length; i++) {
                                var finishedval = parseFloat(jQuery('[data-container="' + in_items[i].custrecord_in_in_parttext + '-finished"]').html());
                                var newval = parseFloat(blockval * (parseFloat(in_items[i].custrecord_in_influence) / 100) + finishedval).toFixed(1)
                                jQuery('[data-container="' + in_items[i].custrecord_in_in_parttext + '-finished"]').html(newval);
                            }
                        }
                    }
                });

            }

        ,   swxAlterationsAdd: function (e) {  //02/09/2019 Saad SAAD
                e.preventDefault();
                var $ = jQuery;
                jQuery("a[id='swx-alterations-dropdown-add']").click();
                $("[id='alteration-modal']").click();
                $("[id='alteration-modal-submit']").show();
                $("[id='alteration-modal-submit-with-pdf']").show();
            }

        ,   alterationModelClick: function(e) {   //02/09/2019 Saad
                e.preventDefault();
            }

        ,   swxAlterationsViewEdit: function (e) {  //02/09/2019 Saad SAAD
                var self = this;
                var $ = jQuery;
                var selectedAlterationIdValue = e.target.getAttribute('swx-alteration-id');
                $("select[id='alteration-options']").val(selectedAlterationIdValue);
                $("select[id='alteration-options']").change();
            }

        ,   addAlterations: function (e) {  //02/09/2019 Saad SAAD
                var clientID = jQuery("#clients-options").val();
                this.profile_model = Utils.setFunc(this.profile_model, "current_client", clientID);

                this.model = Utils.setFunc(this.profile_model, "current_profile", '');
                this.getAlterationsDetail(e);
                jQuery("#profiles-options").val("");
            }

        ,   getAlterationsDetail: function (e) {      //02/09/2019 Saad
                var $ = jQuery;
                var self = this;
                var clientid = $('#fitProfileClientInternalId').text();
                var alterationID = jQuery(e.target).val();

                if (alterationID) {
                var param = new Object();
                    param.type = "get_alterations";
                    param.data = JSON.stringify({filters: ["custrecord_alterations_client||anyof|list|" + clientid], columns: ["internalid", "name", "lastmodified", "custrecord_alterations_measure_values"]});
                    Utils.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "GET", param).always(function(data){
                        if(data){
                            data = JSON.parse(data);
                            self.alteration_collection = data;


                    var dataArr;
                    var alterationsData = self.alteration_collection;
                    jQuery("#alterations-actions").html("<a id='swx-alterations-dropdown-add' data-action='add-alterations' data-toggle='show-in-modal' data-type='profile'>Add</a> | <a id='swx-fitprofile-dropdown-copy' data-action='copy-profile' data-type='profile' data-id='" + alterationID + "'>Copy</a> | <a id='swx-fitprofile-dropdown-remove' data-action='remove-rec' data-type='profile' data-id='" + alterationID + "'>Remove</a>");

                    _.each(alterationsData,function(alteration){
                        var alterationInternalId = alteration.internalid;
                            if(alterationInternalId == alterationID){
                                dataArr = alteration.custrecord_alterations_measure_values;
                                //break;
                            }
                    });

                    if(dataArr){
                            var obj = {};
                            //dataArr = dataArr.replace(/\+/g, " ");
                            dataArr = JSON.parse(dataArr);
                            var clientName = jQuery('#fitProfileClientName').html();

                            for(var i = 0; i < dataArr.length; i++){
                                if(dataArr[i].name == "alteration_jkt"){
                                    var jktNumOfSectionGenerate = dataArr[i].value ? dataArr[i].value : 0;
                                } else if(dataArr[i].name == "alteration_trs"){
                                    obj.trsNumOfSectionGenerate = dataArr[i].value ? dataArr[i].value : 0;
                                }  else if(dataArr[i].name == "alteration_wst"){
                                    obj.wstNumOfSectionGenerate = dataArr[i].value ? dataArr[i].value : 0;
                                }  else if(dataArr[i].name == "alteration_sht"){
                                    obj.shtNumOfSectionGenerate = dataArr[i].value ? dataArr[i].value : 0;
                                }  else if(dataArr[i].name == "alteration_ovc"){
                                    var ovcNumOfSectionGenerate = dataArr[i].value ? dataArr[i].value : 0;
                                    obj.jckOvcNumGenerate = parseInt(jktNumOfSectionGenerate) + parseInt(ovcNumOfSectionGenerate);
                                    break;
                                }
                            }
                            jQuery("#alterations-form-modaldata").html(Utils.alterationsForm(clientid, '', clientName));
                            jQuery("#alterations-measurements-html").html(Utils.alterationsMeasurement(clientid, obj));
                            if(obj.trsNumOfSectionGenerate != 0 || obj.wstNumOfSectionGenerate != 0 || obj.shtNumOfSectionGenerate != 0 || obj.jckOvcNumGenerate != 0){
                            jQuery("[id='modal-fotar-form']").show();
                            jQuery("[id='generate-alterations-form']").hide();
                            jQuery("[id='alteration_jkt']").prop("disabled", true);
                            jQuery("[id='alteration_trs']").prop("disabled", true);
                            jQuery("[id='alteration_sht']").prop("disabled", true);
                            jQuery("[id='alteration_ovc']").prop("disabled", true);
                            jQuery("[id='alteration_wst']").prop("disabled", true);
                        }

                        for(var i=0; i < dataArr.length; i++){
                                jQuery("[id='" + dataArr[i].name + "']").val(dataArr[i].value);

                        }
                        jQuery("#alteration_rec_id").val(alterationID);
                        var image = jQuery('.header-logo-image').attr('src');
                        if(image){
                            jQuery("#image-logo-id").attr("src", image);
                        }

                    }
                        $("[id='alteration-modal-submit']").show();
                        $("[id='alteration-modal-remove']").show();
                        $("[id='alteration-modal-print']").show();
                        $("[id='alteration-modal-download']").show();
                        $("[id='alteration-modal']").click();

                    }
                });


                } else {
                        jQuery("#alterations-actions").html("<a id='swx-alterations-dropdown-add' data-action='add-alterations' data-toggle='show-in-modal' data-type='profile'>Add</a>");
                        // check if event was triggered by add button
                        if (e.target.innerText === "Add") {
                            //display profile details
                            var clientName = jQuery('#fitProfileClientName').html();
                            jQuery("#alterations-form-modaldata").html(Utils.alterationsForm(clientid, 'add', clientName));
                        } else {
                            //hide profile section
                            jQuery("#profile-section").html("");
                        }
                }

            }

        ,   generateAlterationsForm: function() {       //02/09/2019 Saad
                var obj = {};
                var clientid = $('#fitProfileClientInternalId').text();
                jktNumOfSectionGenerate = jQuery("[id='alteration_jkt']").val() ? jQuery("[id='alteration_jkt']").val() : 0;
                obj.trsNumOfSectionGenerate = jQuery("[id='alteration_trs']").val() ? jQuery("[id='alteration_trs']").val() : 0;
                obj.wstNumOfSectionGenerate = jQuery("[id='alteration_wst']").val() ? jQuery("[id='alteration_wst']").val() : 0;
                obj.shtNumOfSectionGenerate = jQuery("[id='alteration_sht']").val() ? jQuery("[id='alteration_sht']").val() : 0;
                var ovcNumOfSectionGenerate = jQuery("[id='alteration_ovc']").val() ? jQuery("[id='alteration_ovc']").val() : 0;
                obj.jckOvcNumGenerate = parseInt(jktNumOfSectionGenerate) + parseInt(ovcNumOfSectionGenerate);
                jQuery("#alterations-measurements-html").html(Utils.alterationsMeasurement(clientid, obj));
                if(obj.trsNumOfSectionGenerate != 0 || obj.wstNumOfSectionGenerate != 0 || obj.shtNumOfSectionGenerate != 0 || obj.jckOvcNumGenerate != 0){
                jQuery("[id='modal-fotar-form']").show();
                } else {
                    jQuery("[id='modal-fotar-form']").hide();
                }
            }


        ,   submitAlterationForm: function(e){    //02/09/2019 Saad
                var self = this;
                var alterationInternalId;
                jQuery('input:disabled').removeAttr('disabled');
                jQuery('select:disabled').removeAttr('disabled');
                var formValues = jQuery('#alteration-form').serialize().split("&");
                var clientId = jQuery('#alteration_client_id').val();
                var dataToSend = new Array();
                for(var i =0; i< formValues.length; i++){
                    var obj = {};
                    var formValue = formValues[i];
                    var field = formValue.split("=")[0]
                        , value = jQuery('#' + formValue.split("=")[0]).val().replace(/\%0D%0A/g, ' ').replace(/\s+/g, ' ').trim();
                        if(field == "alteration_rec_id" && value != '-999'){
                            alterationInternalId = value;
                        } else {
                            obj.name = field;
                            obj.value = value;
                            dataToSend.push(obj);
                        }
                };
                var param = new Object();
                var tempArr = [];
                tempArr.push({"name": "custrecord_alterations_client" , "value": clientId , "type": "field"});
                tempArr.push({"name": "custrecord_alterations_measure_values" , "value": JSON.stringify(dataToSend)  , "type": "field"});
                tempArr.push({"name": "name" , "value": "Alterations Form" , "type": "field"});
                param.data = JSON.stringify(tempArr);

                if(alterationInternalId){
                    param.type = "update_alteration";
                    param.id = alterationInternalId;

                } else {
                    param.type = "create_alteration_form";
                    param.id = clientId;
                }
                var showMessage = '';
                Utils.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "POST", param).always(function (data) {
                    if (data) {
                        jQuery("[id='alteration-modal-close']").click();
                        if(param.type == "create_alteration_form"){
                            showMessage = 'Record was created';
                        } else {
                            showMessage = 'Record was updated';
                        }
                        jQuery(".show-remove-error-fitprofile").html("<div class='alert alert-success alert-dismissible fade in'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" + showMessage + "</div>");        
                        var client_id_main = jQuery('#fitProfileClientInternalId').text();  //21/08/2019 Saad SAAD
                        self.swxClientProfileSelect('', client_id_main);

                    }
                });
                jQuery(".modal-backdrop").hide();
                jQuery("body").removeClass("modal-open");
                jQuery("body").removeAttr('style');
            }

        ,   removeAlterationRec: function (e) {   //02/09/2019 Saad
                var self = this;
                e.preventDefault();
                var message = _("Are you sure that you want to delete this alteration form?").translate()
                    var isTrue = window.confirm(message);

                if (isTrue) {
                    var id = jQuery("#alteration_rec_id").val();

                    if(id){
                        var clientId = jQuery('#alteration_client_id').val();
                        var param = new Object();
                        param.type = "remove_alteration";
                        param.id = id;
                    Utils.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "POST", param).always(function (data) {
                            if (data) {
                                jQuery("[id='alteration-modal-close']").click();
                                jQuery(".show-remove-error-fitprofile").html("<div class='alert alert-success alert-dismissible fade in'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a> Record was deleted </div>");
                                var client_id_main = jQuery('#fitProfileClientInternalId').text();  //21/08/2019 Saad SAAD
                                self.swxClientProfileSelect('', client_id_main);
                            }
                    });
                    jQuery(".modal-backdrop").hide();
                    jQuery("body").removeClass("modal-open");
                    jQuery("body").removeAttr('style');
                    }
                }
            }

        ,   printAlterationRec: function (e) {    //02/09/2019 Saad
                var alterationRecId = jQuery( "#alteration_rec_id" ).val();
                if (alterationRecId) {
                    var scriptLink = '/app/site/hosting/scriptlet.nl?script=279&deploy=1&compid=3857857&h=7146800f2cdac0a8e1b9';
                    var link = scriptLink + '&recid=' + alterationRecId;
                    window.open(link);
                }
            }

        ,   downloadAlterationRec: function(e){   //02/09/2019 Saad
                var alterationRecId = jQuery( "#alteration_rec_id" ).val();
                if (alterationRecId) {
                    var scriptLink = '/app/site/hosting/scriptlet.nl?script=279&deploy=1&compid=3857857&h=7146800f2cdac0a8e1b9';
                    var link = scriptLink + '&recid=' + alterationRecId;
                    window.open(link);
                }
            }

        ,   updateAllowanceLookup: function (e) { //16/12/2019 Saad
                var value = jQuery(e.target).val(),
                    self = this,
                    lookUpTable = JSON.parse(JSON.stringify(self.selected_measurement["lookup-value"][value]));

                var selectedUnit = jQuery('#units').val();
                _.each(lookUpTable, function (element, index, list) {
                    if (selectedUnit === 'Inches') {
                        list[index].value = (list[index].value * 0.39).toFixed(1);
                    }
                });

                jQuery(".allowance-fld").each(function () {
                    var id = jQuery(this).prop("id").split("_")[1],
                        lookUpValue = _.where(lookUpTable, {
                            field: id
                        }),
                        finalMeasure = 0;

                    if (lookUpValue && lookUpValue.length) {
                        jQuery(this).data("baseval", lookUpValue[0].value);

                        if (jQuery("#" + id).val() !== "") {
                            jQuery(this).val(lookUpValue[0].value);
                        } else {
                            jQuery(this).val("0");
                        }
                    } else {
                        //jQuery(this).data("baseval", 0);
                        jQuery(this).val("0");
                    }

                    jQuery(this).trigger('change');
                });
            }

        ,   submitAlterationFormAndGenratePDF: function(e){   //02/09/2019 Saad
                var self = this;
                var alterationInternalId;
                jQuery('input:disabled').removeAttr('disabled');
                jQuery('select:disabled').removeAttr('disabled');
                var formValues = jQuery('#alteration-form').serialize().split("&");
                var clientId = jQuery('#alteration_client_id').val();
                var dataToSend = new Array();
                for(var i =0; i< formValues.length; i++){
                    var obj = {};
                    var formValue = formValues[i];
                    var field = formValue.split("=")[0]
                        , value = jQuery('#' + formValue.split("=")[0]).val().replace(/\%0D%0A/g, ' ').replace(/\s+/g, ' ').trim();
                        if(field == "alteration_rec_id" && value != '-999'){
                            alterationInternalId = value;
                        } else {
                            obj.name = field;
                            obj.value = value;
                            dataToSend.push(obj);
                        }
                };
                var param = new Object();
                var tempArr = [];
                tempArr.push({"name": "custrecord_alterations_client" , "value": clientId , "type": "field"});
                tempArr.push({"name": "custrecord_alterations_measure_values" , "value": JSON.stringify(dataToSend) , "type": "field"});
                tempArr.push({"name": "name" , "value": "Alterations Form" , "type": "field"});
                param.data = JSON.stringify(tempArr);
                param.type = "create_alteration_form";
                param.id = clientId;

                Utils.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "POST", param).always(function (data) {
                    data = JSON.parse(data);
                    if (data) {
                        jQuery("[id='alteration-modal-close']").click();
                        jQuery(".show-remove-error-fitprofile").html("<div class='alert alert-success alert-dismissible fade in'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a> Record was created</div>");
                        var client_id_main = jQuery('#fitProfileClientInternalId').text();  //21/08/2019 Saad SAAD
                        self.swxClientProfileSelect('', client_id_main);
                        setTimeout(function() {
                        var scriptLink = '/app/site/hosting/scriptlet.nl?script=279&deploy=1&compid=3857857&h=7146800f2cdac0a8e1b9';
                        var link = scriptLink + '&recid=' + data.id;
                        window.open(link);

                        }, 100);
                    }
                    jQuery(".modal-backdrop").hide();
                    jQuery("body").removeClass("modal-open");
                    jQuery("body").removeAttr('style');
                });

            }

        });

    });
