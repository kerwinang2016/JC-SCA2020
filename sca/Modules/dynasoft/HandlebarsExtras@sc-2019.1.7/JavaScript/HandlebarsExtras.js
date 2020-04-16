/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
    'HandlebarsExtras', [
        'SC.Configuration', 'Utils', 'Handlebars', 'Backbone', 'underscore', 'jQuery'
    ],
    function (
        Configuration, Utils, Handlebars, Backbone, _, jQuery
    ) {
        'use strict';

        Handlebars.registerHelper('getThemeAssetsPathWithDefault', function (img_path, default_img_path) {
            if (img_path && img_path === Utils.getAbsoluteUrlOfNonManagedResources('')) {
                img_path = null;
            }

            //If the theme path provided by the template's context is an url (and not a relative path) I'll use it as it's
            //This is used for the local devtool in order to serve the assets locally
            if (/^https?:\/\//.test(this._theme_path) && !img_path) {
                return this._theme_path + default_img_path;
            }

            return Utils.getThemeAbsoluteUrlOfNonManagedResources(default_img_path, img_path);
        });

        Handlebars.registerHelper('getThemeAssetsPath', function (default_img_path) {
            return Handlebars.helpers.getThemeAssetsPathWithDefault.apply(this, [null, default_img_path]);
        });

        Handlebars.registerHelper('getExtensionAssetsPathWithDefault', function (img_path, default_img_path) {
            if (img_path && img_path !== Utils.getAbsoluteUrl()) {
                return img_path;
            }

            //If the extension path provided by the template's context is an url (and not a relative path) I'll use it as it's
            //This is used for the local devtool in order to serve the assets locally
            if (/^https?:\/\//.test(this._extension_path)) {
                return this._extension_path + default_img_path;
            }

            img_path = (this._extension_path || '') + default_img_path;
            return Utils.getAbsoluteUrl(img_path);
        });

        Handlebars.registerHelper('getExtensionAssetsPath', function (default_img_path) {
            return Handlebars.helpers.getExtensionAssetsPathWithDefault.apply(this, [null, default_img_path]);
        });

        Handlebars.registerHelper('translate', function () {
            //NOTE: translate returns a safe string
            return new Handlebars.SafeString(_.translate.apply(_, arguments));
        });

        Handlebars.registerHelper('highlightKeyword', function (text, keyword) {
            //NOTE: highlightKeyword returns a safe string
            return new Handlebars.SafeString(Utils.highlightKeyword(text, keyword));
        });

        var objectToAttributesFn = function () {
            //Note: object to attributes
            return new Handlebars.SafeString(Utils.objectToAtrributes(this, ''));
        };

        Handlebars.registerHelper('objectToAtrributes', objectToAttributesFn);
        Handlebars.registerHelper('objectToAttributes', objectToAttributesFn);

        //define our own each helper with support for backbone collections
        Handlebars.registerHelper('each', function (context, options) {
            var ret = '',
                iterable = context instanceof Backbone.Collection ? context.models : context,
                length = iterable && iterable.length || 0;

            for (var i = 0, j = length; i < j; i++) {
                ret = ret + options.fn(iterable[i], {
                    data: {
                        first: i === 0,
                        last: i === iterable.length - 1,
                        index: i,
                        indexPlusOne: i + 1
                    }
                });
            }

            if (!length) {
                ret = options.inverse(this);
            }

            return ret;
        });

        Handlebars.registerHelper('resizeImage', function (url, size) {
            url = url || _.getThemeAbsoluteUrlOfNonManagedResources('img/no_image_available.jpeg', Configuration.get('imageNotAvailable'));
            var mapped_size = Configuration['imageSizeMapping.' + size] || size;
            return Utils.resizeImage(SC.ENVIRONMENT.siteSettings.imagesizes || [], url, mapped_size);
        });

        Handlebars.registerHelper('trimHtml', function (htmlString, length) {
            var htmlStringSelector;

            try {
                htmlStringSelector = jQuery(htmlString);
            } catch (e) {}

            var trimmedString = (htmlStringSelector && htmlStringSelector.length > 0) ? jQuery.trim(htmlStringSelector.text()) : jQuery.trim(htmlString),
                moreContent = '';

            if (trimmedString.length > length) {
                moreContent = '...';
            }

            return trimmedString.substring(0, length) + moreContent;
        });

        //Helper 'breaklines' places <br/> tags instead of the newlines provided by backend
        //Used in messages in Quotes, Return, Case, Review.
        Handlebars.registerHelper('breaklines', function (text) {
            text = Handlebars.Utils.escapeExpression(text || '');
            text = text.replace(/(\r\n|\n|\r|\u0005)/gm, '<br/>');
            return new Handlebars.SafeString(text);
        });

        //Helper 'ifEqual' works like if (v1 == v2) {} else {}
        Handlebars.registerHelper('ifEquals', function (v1, v2, options) {
            /*jslint eqeq: true*/
            if (v1 == v2) {
                return options.fn(this);
            }
            return options.inverse(this);
        });
        //Helper 'ifEqual' works like if (v1 == v2) {} else {}
        Handlebars.registerHelper('ifContains', function (v1, v2, options) {
          if(v1){
            /*jslint eqeq: true*/
            if (v1.indexOf(v2) != -1) {
                return options.fn(this);
            }
          }
            return options.inverse(this);
        });
        //Helper 'ifNotEquals' works like if (v1 != v2) {} else {}
        Handlebars.registerHelper('ifNotEquals', function (v1, v2, options) {

            if (v1 != v2) {
                return options.fn(this);
            }
            return options.inverse(this);
        });

        //Helper 'ifLessThan' works like if (v1 < v2) {} else {}
        Handlebars.registerHelper('ifLessThan', function (v1, v2, options) {

            if (v1 < v2) {
                return options.fn(this);
            }
            return options.inverse(this);
        });

        //Helper 'ifGreaterThan' works like if (v1 > v2) {} else {}
        Handlebars.registerHelper('ifGreaterThan', function (v1, v2, options) {

            if (v1 > v2) {
                return options.fn(this);
            }
            return options.inverse(this);
        });

        //Helper 'ifLessThanEquals' works like if (v1 <= v2) {} else {}
        Handlebars.registerHelper('ifLessThanEquals', function (v1, v2, options) {

            if (v1 <= v2) {
                return options.fn(this);
            }
            return options.inverse(this);
        });

        //Helper 'ifGreaterThanEquals' works like if (v1 >= v2) {} else {}
        Handlebars.registerHelper('ifGreaterThanEquals', function (v1, v2, options) {

            if (v1 >= v2) {
                return options.fn(this);
            }
            return options.inverse(this);
        });

        //Helper generate html list
        Handlebars.registerHelper('list', function (items, options) {
            var out = "<ul>";

            for (var i = 0, l = items.length; i < l; i++) {
                out = out + "<li>" + options.fn(items[i]) + "</li>";
            }

            return out + "</ul>";
        });

        //Helper generate measureForm form html
        Handlebars.registerHelper('measureForm', function (measurement, formType, values, paramEvent, selectedItemType, favFitToolsFlag) {
            var template = '';
            var fields = '';
            if (formType == 'favourite_fit_tools') {
                fields = measurement[0];
            }

            var eventValue = (!_.isNull(paramEvent) && paramEvent == 'add') ? 'add' : 'viewedit';
            var isAddEvent = (eventValue == 'add') ? true : false;
            var isViewEdit = (eventValue == 'viewedit') ? true : false;

            if (fields && fields.fieldset && fields.fieldset.length) {
                template += '<h4 class="section-header">' + _('Measurement Details').translate() + '</h4>';
                _.each(fields.fieldset, function (fieldset) {
                    if (fieldset.name == 'main') {
                        template += '<div class="main-section">';
                        if (fields.type == 'Body') {

                            _.each(fieldset.fields, function (field) {
                                var mainBodyValue = null,
                                    fieldValue = _.where(values, {
                                        name: field.name
                                    })
                                if (fieldValue.length) {
                                    mainBodyValue = fieldValue[0].value;
                                }

                                template += Utils.bodyMeasureField(field, mainBodyValue, fieldset.name, 0, 0, selectedItemType);
                                //SC.macros.bodyMeasureField(field, mainBodyValue, fieldset.name,0,0,selectedItemType)
                            })
                        } else {
                            _.each(fieldset.fields, function (field) {
                                var mainBlockValue = null,
                                    fieldValue = _.where(values, {
                                        name: field.name
                                    })
                                if (fieldValue.length) {
                                    mainBlockValue = fieldValue[0].value;
                                }

                                template += Utils.blockMeasureField(field, mainBlockValue);
                                //SC.macros.blockMeasureField(field, mainBlockValue)
                            })
                        }
                        template += '</div>'
                    } else {
                        template += '<div class=" fieldset.name -section">';
                        template += '<h4>' + fieldset.label + '</h4>';
                        template += '<hr />';
                        if (fields.type == 'Body')  {
                            if (fieldset.name == "body-measurement") {
                                template += '<div class="row-fluid">';
                                template += '<div style="width:30%; float:left;margin:0;">&nbsp;</div>';
                                template += '<div style="width:20%;margin:0;" class="span3-profile offset2">' + _('Measurement').translate() + '</div>';
                                template += '<div style="width:20%;margin:0;" class="span3-profile">' + _('Allowance').translate() + '</div>';
                                template += '<div style="width:20%;margin:0; text-align:center;" class="span3-profile">' + _('Finished').translate() + '</div>';
                                template += '<div style="width:10%;margin:0;" class="span3-profile">' + _('Range').translate() + '</div>';
                                template += '</div>';
                            }
                            _.each(fieldset.fields, function (field) {

                                var fieldName = field.name;
                                var bodyValue = 0,
                                    allowance = 0,
                                    baseAllowance = 0

                                var fieldValue = _.where(values, {
                                    name: fieldName
                                });
                                if (fieldValue.length === 0) {
                                    fieldValue = _.where(values, {
                                        name: fieldName.replace('-', ' ')
                                    });
                                    fieldName = fieldName.replace('-', ' ');
                                }
                                if (fieldValue.length === 0) {
                                    fieldValue = _.where(values, {
                                        name: fieldName.replace('+', ' ')
                                    });
                                    fieldName = fieldName.replace('+', ' ');
                                }

                                var allowFieldValue = _.where(values, {
                                    name: "allowance-" + fieldName
                                })
                                var lookUpField = _.where(values, {
                                    name: fields["lookup-key"]
                                });

                                if (values) {
                                    if (fieldValue.length) {
                                        bodyValue = fieldValue[0].value;
                                    }
                                    if (allowFieldValue.length) {
                                        allowance = allowFieldValue[0].value;
                                    }
                                    if (lookUpField.length) {
                                        baseAllowance = _.where(fields["lookup-value"][lookUpField[0].value], {
                                            field: field.name
                                        })[0];
                                        baseAllowance = baseAllowance && baseAllowance.value ? baseAllowance.value : 0;
                                    }
                                } else {
                                    baseAllowance = _.where(fields["lookup-value"]["Very Slim"], {
                                        field: field.name
                                    })[0];
                                    baseAllowance = baseAllowance && baseAllowance.value ? baseAllowance.value : 0;
                                }

                                template += Utils.bodyMeasureField(field, bodyValue, fieldset.name, baseAllowance, allowance, selectedItemType);
                                //SC.macros.bodyMeasureField(field, bodyValue, fieldset.name, baseAllowance, allowance, selectedItemType)
                            })
                        } else {
                            template += '<div class="row-fluid">';
                            template += '<div class="col-wid-30">&nbsp;</div>';
                            template += '<div style="margin:0;color:##777777;" class="span2 offset3 col-wid-20">' + fieldset["max-label"] + '</div>';
                            template += '<div style="margin:0;color:##777777;"  class="span2 offset5p col-wid-20">' + fieldset["min-label"] + '</div>';
                            template += '<div style="margin:0;color:##777777;"  class="span2 offset5p col-wid-20">' +'Hide?'+ '</div>';  //22/01/2020
                            if ((fieldset.name == 'length' || fieldset.name == 'horizontals') && !favFitToolsFlag) {
                                template += '<div style="width:11%;float:left; color:#c1c1c1;">' + _('Default').translate() + '</div>';
                                template += '<div style="width:9%;margin:0; color:#c1c1c1;"  class="span-w-10 offset5p">' + _('Block').translate() + '</div>';
                                template += '<div style="width:10%;margin:0; color:#c1c1c1;" class="span-w-10">' + _('Finished').translate() + '</div>';
                            } else if (!favFitToolsFlag) {
                                template += '<div style="width:11%;text-align:left;float: left; color:#c1c1c1;">' + _('Default').translate() + '</div>';
                                template += '<div style="width:9%;margin:0; color:#c1c1c1;" class="span3">&nbsp;</div>';
                                template += '<div style="width:10%;margin:0; color:#c1c1c1;" class="span3">&nbsp;</div>';
                            }

                            template += '</div>';
                            _.each(fieldset.fields, function (field) {
                                var blockValueMin = _.where(values, {
                                        name: field.name + "-min"
                                    })[0],
                                    blockValueMax = _.where(values, {
                                        name: field.name + "-max"
                                    })[0],
                                    value = [blockValueMin, blockValueMax];
                                template += Utils.blockMeasureField(field, value, fields.increment, fieldset);
                                //SC.macros.blockMeasureField(field, value, fields.increment,fieldset)
                            })
                        }
                        template += '</div>';
                        // 				 if(fieldset.name == "body-measurement" && (selectedItemType == 'Jacket' || selectedItemType == 'Waistcoat' ||
                        // jQuery('[id*="custrecord_fp_product_type"]').val() == 'Jacket' || jQuery('[id*="custrecord_fp_product_type"]').val() == 'Waistcoat')){

                        // 				<p id="optionalmessage">** optional measurement</p>
                        // 				 }
                    }
                });

                template += '<div class="form-actions" style="display: none;">';
                template += '<button id="swx-fitprofile-submit" class="btn btn-primary" type="submit">Submit</button>';
                template += '<button data-action="reset" class="btn hide" type="reset">Cancel</button>';

                if (isViewEdit) {
                    template += '<button id="swx-fitprofile-remove" class="btn" type="button" style="">Remove</button>';
                    template += '<button id="swx-fitprofile-copy" class="btn" type="button" style="">Copy</button>';
                }

                template += '</div>';

            }

            return template;

        });

        //Helper generate design Option Fields form html
        Handlebars.registerHelper('designOptionFields', function (fields, values, mode) {
            var template = '';
            if (fields && fields.length > 1) {
                template += '<ul class="nav nav-tabs design-option-list">';
                _.each(fields, function (field, count) {
                    if (count == 0) {
                        template += '<li class="active">';
                    } else {
                        template += '<li>';
                    }
                    template += '<a data-target="#design-option-' + field["item_type"] + '" data-toggle="tab" data-type="-' + field["item_type"] + '" href="#">';
                    template += field["item_label"]; // 28-11-2019 saad
                    template += '</a>';
                    template += '</li>';
                })
                template += '</ul>';
            }

            template += '<div class="tab-content">';
            _.each(fields, function (field, count) {
                if (count == 0) {
                    template += '<div class="tab-pane active design-option-' + field["item_type"] + '" id="design-option-' + field["item_type"] + '">';
                } else {
                    template += '<div class="tab-pane design-option-' + field["item_type"] + '" id="design-option-' + field["item_type"] + '">';
                }

                if (mode == "multi") {
                    template += Utils.designOptionMultiField(field, values)
                    //SC.macros.designOptionMultiField(field, values)
                } else {
                    template += Utils.designOptionSingleField(field, values)
                    //SC.macros.designOptionSingleField(field, count)
                }
                template += '</div>';
            });
            template += '</div>'

            return template;
        });

        //Helper Set Favourite Fit Tools default values
        Handlebars.registerHelper('setfavouriteFitTools', function (data) {
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
            }
        });

        Handlebars.registerHelper('fitprofilesearch', function (paramObj, paramCurrentUserInternalId, paramToggleDisplay) {

            //var objRef = paramObj;
            var objRef = paramObj;
            var filterClientName = objRef['name'] ? objRef['name'] : '';
            var filterClientEmail = objRef['email'] ? objRef['email'] : '';
            var filterClientPhone = objRef['phone'] ? objRef['phone'] : '';

            var isDisplayForm = paramToggleDisplay

            var isDisplayForm = '';

            var template = '';

            if (isDisplayForm) {
                template += '<div id="swx-order-client-contents" style="margin-bottom: 20px;">';
            } else {
                template += '<div id="swx-order-client-contents" style="margin-bottom: 20px;">';
            }
            template += '<div class="row-fluid" style="margin-bottom: 20px;">';
            template += '<div class="span3">';
            template += '<div class="control-group">';
            template += '<label for="swx-order-client-name" class="control-label">Name</label>';
            template += '<div class="controls">';
            template += '<input type="text" value="' + filterClientName + '" name="swx-order-client-name" id="swx-order-client-name" class="" style="width: 100%;">';
            template += '</div>';
            template += '</div>';
            template += '</div>	';

            template += '<div class="span3">';
            template += '<div class="control-group">';
            template += '<label for="swx-order-client-email" class="control-label">Email</label>';
            template += '<div class="controls">';
            template += '<input type="text" value="' + filterClientEmail + '" name="swx-order-client-email" id="swx-order-client-email" class="" style="width: 100%;">';
            template += '</div>';
            template += '</div>';
            template += '</div>';

            template += '<div class="span3">';
            template += '<div class="control-group">';
            template += '<label for="swx-order-client-phone" class="control-label">Phone</label>';
            template += '<div class="controls">';
            template += '<input type="number" value="' + filterClientPhone + '" name="swx-order-client-phone" id="swx-order-client-phone" class="" style="width: 100%;">';
            template += '</div>';
            template += '</div>';
            template += '</div>';

            template += '<div class="span3">';
            template += '<div class="control-group">';
            template += '<label for="swx-order-client-search" class="control-label">&nbsp;</label>';
            template += '<div class="controls">';
            template += '<div class="row-fluid">';
            template += '<div class="span6"><button id="swx-order-client-search" class="btn btn-primary" style="width: 100%;">Search</button></div>';
            template += '<div class="span6"><button type="button" class="btn btn-info btn-lg" data-toggle="modal" data-target="#myModal" style="margin-left: 3px;">Add</button></div>';
            template += '</div>';

            template += '</div>';
            template += '</div>';

            template += '</div>';
            template += '<div id="swx-order-client-list">';
            template += '</div>';
            template += '</div>';

            template += '</div>';
            template += '<div id="swx-client-profile-details"></div>';


            return template

        });

        Handlebars.registerHelper('clientForm', function (tailorId) { //29/07/2019 Saad

            var clientRec = '';
            // ,	site_settings = SC.ENVIRONMENT.siteSettings
            // ,	countries = SC.ENVIRONMENT.siteSettings.countries
            // ,	quantity_countries = _.size(countries)
            // ,	selected_country = clientRec.get("custrecord_tc_country") || site_settings.defaultshipcountry;

            var stClientRec = JSON.stringify(clientRec);
            var arrObjClientRec = JSON.parse(stClientRec);
            var arrObjClientRec = (!_.isNull(JSON.parse(stClientRec)))


            var dateCreated = (_.isObjectExist(arrObjClientRec['created'])) ? arrObjClientRec['created'] : '';

            var template = '';
            template += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">';
            template += '<form id="client_form">';
            template += '<fieldset>';
            template += '<div data-type="alert-placeholder"></div>';
            template += '<input type="hidden" value=' + tailorId + '  name="custrecord_tc_tailor" data-rectype="field">';
            template += '<input type="hidden" value=' + dateCreated + ' name="created" data-rectype="uneditablefield">';
            template += '<div class="control-group" data-input="firstname">';
            template += '<label class="control-label" for="firstname">';
            template += 'First name'; // zain 26-08-19
            template += '  <small>';
            template += 'required';
            template += ' </small>';
            template += ' </label>';
            template += '<div class="controls">';
            template += '<input type="text" class="input-xlarge" id="firstname" name="custrecord_tc_first_name" value="" data-rectype="field">';
            template += ' </div>';
            template += '</div>';
            template += '<div class="control-group" data-input="lastname">';
            template += ' <label class="control-label" for="lastname">';
            template += ' Last name';  // zain 26-08-19
            template += '<small>';
            template += ' required'; // zain 30-08-19
            template += ' </small>';
            template += ' </label>';
            template += '<div class="controls">';
            template += ' <input type="text" class="input-xlarge" id="lastname" name="custrecord_tc_last_name" value="" data-rectype="field">';
            template += '</div>';
            template += '</div>';

            // zain 30-08-19 start
            template += '<div class="control-group" data-input="email">';
            template += '<label class="control-label" for="email">';
            template += 'Email';
            template += ' <small>';
            template += 'required';
            template += ' </small>';
            template += '</label>';
            template += '<div class="controls">';
            template += '  <input type="email" class="input-xlarge" id="email" name="custrecord_tc_email" value="" data-rectype="field">';
            template += '  </div>';
            template += '</div>';

            template += '<div class="control-group"  data-input="phone">';
            template += ' <label class="control-label" for="phone">';
            template += 'Phone Number';
            template += '<small>';
            template += ' required'; // zain 30-08-19
            template += '  </small>';
            template += ' </label>';
            template += ' <div class="controls">';
            template += ' <input type="number" class="input-xlarge" id="phone" name="custrecord_tc_phone" value="" data-type="phone" data-rectype="field">';
            template += ' </div>';
            template += ' <span class="help-block">';
            template += 'Example: 5551231234';
            template += ' </span>';
            template += '</div>';
            // zain 30-08-19 end

            template += '<div class="control-group control-group-big" data-input="dob">';
            template += '<label class="control-label" for="dob">';
            template += 'Date Of Birth';
            template += ' </label>';
            template += ' <div class="controls">';
            template += ' <input type="text" class="input-xlarge" id="dob" name="custrecord_tc_dob" placeholder="optional" value=""  data-rectype="field">';
            template += '</div>';
            template += '</div>';

            template += '<div class="control-group control-group-big" data-input="company">';
            template += ' <label class="control-label" for="company">';
            template += ' Company';
            template += '</label>';
            template += ' <div class="controls">';
            template += '<input type="text" class="input-xlarge" id="company" name="custrecord_tc_company" placeholder="optional" value=""  data-rectype="field">';
            template += '</div>';
            template += '</div>';

            template += '<div class="control-group" data-input="address1">';
            template += '<label class="control-label" for="address1">';
            template += 'Address 1';
            template += '</label>';
            template += '<div class="controls">';
            template += ' <input type="text" class="input-xlarge" id="custrecord_tc_addr1" name="custrecord_tc_addr1" value="" data-rectype="field">';
            template += '</div>';
            template += ' <span class="help-block">';
            template += 'Example: 1234 Main Street';
            template += '  </span>';
            template += '</div>';

            template += '<div class="control-group control-group-big" data-input="address2">';
            template += '<label class="control-label" for="address2">';
            template += 'Address 2';
            template += ' </label>';
            template += '<div class="controls">';
            template += ' <input type="text" class="input-xlarge" id="address2" name="custrecord_tc_addr2" placeholder="optional" value="" data-rectype="field">';
            template += '  </div>';
            template += '  <span class="help-block">';
            template += 'Example: Apt. 3 or Suite #1516';
            template += ' </span>';
            template += '</div>';

            template += ' <div class="control-group" data-input="city">';
            template += '  <label class="control-label" for="city">';
            template += 'City';
            template += ' </label>';
            template += ' <div class="controls">';
            template += '<input type="text" class="input-xlarge" id="city" name="custrecord_tc_city" value="" data-rectype="field">';
            // template += Utils.cityOptions();
            // template += '</select>';
            template += '</div>';
            template += ' </div>';

            // template += '<div class="address-edit-fields-group {{#unless showCountriesField}} {{/unless}}" data-view="CountriesDropdown" data-input="country" data-validation="control-group" name="custrecord_tc_country" data-rectype="field">';
            // template += '</div>';

            // template += '<div class="address-edit-fields-group" data-input="state" data-view="StatesView" data-validation="control-group" id="state" name="custrecord_tc_state">';
            // template += '</div>';

            template += '<div class="control-group" data-input="country">';
            template += '  <label class="control-label" for="country">';
            template += 'Country';
            template += ' </label>';
            template += ' <div class="controls">';
            template += '  <select class="input-xlarge" id="country" name="custrecord_tc_country" data-rectype="field">';
            template += Utils.countryOptions();
            template += '</select>';
            template += '</div>';
            template += ' </div>';

            // template += '<div class="control-group= quantity_countries <= 1 ?  hide : ' + ' " data-input="country">';
            // template += '  <label class="control-label" for="country">';
            // template += 'Country';
            // template += ' </label>';
            // template += '<div class="controls">';

            // template += ' </div>';
            // template += ' </div>';

            template += '<div class="control-group" data-input="state">';
            template += '<label class="control-label" for="state">';
            template += 'State/Province/Region';
            template += ' </label>';
            template += ' <div class="controls">';
            template += ' <input type="text" class="input-medium" id="state" name="custrecord_tc_state" value="" data-type="state" data-rectype="field">';
            template += ' </div>';
            template += ' </div>';

            template += '<div class="control-group"  data-input="zip">';
            template += '<label class="control-label" for="zipcode">';
            template += 'Zip Code';
            template += ' </label>';
            template += ' <div class="controls">';
            template += ' <input type="text" class="input-medium" id="zipcode" name="custrecord_tc_zip" value="" data-type="zip" data-rectype="field">';
            template += ' </div>';
            template += ' <span class="help-block">';
            template += 'Example: 94117';
            template += ' </span>';
            template += '</div>';

            template += '<div style="width:100%" class="control-group control-group-big" data-input="notes">';
            template += '<label class="control-label" for="notes">';
            template += 'Client Notes';
            template += '  </label>';
            template += ' <div class="controls">';
            template += ' <textarea id="notes" name="custrecord_tc_notes" data-rectype="field" style="resize:none; width: 100% !important;"> </textarea>';
            template += '</div>';
            template += '</div>';

            template += ' </fieldset>';
            template += '</form>';



            return template;
        });


        Handlebars.registerHelper('ClientEditForm', function (tailorId) {

            var clientRec = '';
            // ,	site_settings = SC.ENVIRONMENT.siteSettings
            // ,	countries = SC.ENVIRONMENT.siteSettings.countries
            // ,	quantity_countries = _.size(countries)
            // ,	selected_country = clientRec.get("custrecord_tc_country") || site_settings.defaultshipcountry;

            var stClientRec = JSON.stringify(clientRec);
            var arrObjClientRec = JSON.parse(stClientRec);
            var arrObjClientRec = (!_.isNull(JSON.parse(stClientRec)))


            var dateCreated = (_.isObjectExist(arrObjClientRec['created'])) ? arrObjClientRec['created'] : '';

            var template = '';
            template += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">';
            template += '<form id="clientedit_form">';
            template += '<fieldset>';
            template += '<div data-type="alert-placeholder"></div>';
            template += '<input type="hidden" value=' + tailorId + '  name="custrecord_tc_tailor" data-rectype="field">';
            template += '<input type="hidden" value=' + dateCreated + ' name="created" data-rectype="uneditablefield">';
            template += '<div class="control-group" data-input="firstname">';
            template += '<label class="control-label" for="firstname">';
            template += 'First name'; // zain 26-08-19
            template += '  <small>';
            template += 'required';
            template += ' </small>';
            template += ' </label>';
            template += '<div class="controls">';
            template += '<input type="text" class="input-xlarge" id="firstname" name="custrecord_tc_first_name" value="" data-rectype="field">';
            template += ' </div>';
            template += '</div>';
            template += '<div class="control-group" data-input="lastname">';
            template += ' <label class="control-label" for="lastname">';
            template += ' Last name'; // zain 26-08-19
            template += '<small>';
            template += 'required';
            template += ' </small>';
            template += ' </label>';
            template += '<div class="controls">';
            template += ' <input type="text" class="input-xlarge" id="lastname" name="custrecord_tc_last_name" value="" data-rectype="field">';
            template += '</div>';
            template += '</div>';

            template += '<div class="control-group control-group-big" data-input="dob">';
            template += '<label class="control-label" for="dob">';
            template += 'Date Of Birth';
            template += ' </label>';
            template += ' <div class="controls">';
            template += ' <input type="text" class="input-xlarge" id="dob" name="custrecord_tc_dob" placeholder="optional" value=""  data-rectype="field">';
            template += '</div>';
            template += '</div>';

            template += '<div class="control-group control-group-big" data-input="company">';
            template += ' <label class="control-label" for="company">';
            template += ' Company';
            template += '</label>';
            template += ' <div class="controls">';
            template += '<input type="text" class="input-xlarge" id="company" name="custrecord_tc_company" placeholder="optional" value=""  data-rectype="field">';
            template += '</div>';
            template += '</div>';


            template += '<div class="control-group" data-input="email">';
            template += '<label class="control-label" for="email">';
            template += 'Email';
            template += ' <small>';
            template += 'required';
            template += ' </small>';
            template += '</label>';
            template += '<div class="controls">';
            template += '  <input type="email" class="input-xlarge" id="email" name="custrecord_tc_email" value="" data-rectype="field">';
            template += '  </div>';
            template += '</div>';

            template += '<div class="control-group"  data-input="phone">';
            template += ' <label class="control-label" for="phone">';
            template += 'Phone Number';
            template += '<small>';
            template += 'required';
            template += '  </small>';
            template += ' </label>';
            template += ' <div class="controls">';
            template += ' <input type="number" class="input-xlarge" id="phone" name="custrecord_tc_phone" value="" data-type="phone" data-rectype="field">';
            template += ' </div>';
            template += ' <span class="help-block">';
            template += 'Example: 5551231234';
            template += ' </span>';
            template += '</div>';

            template += '<div class="control-group" data-input="address1">';
            template += '<label class="control-label" for="address1">';
            template += 'Address 1';
            template += '</label>';
            template += '<div class="controls">';
            template += ' <input type="text" class="input-xlarge" id="custrecord_tc_addr1" name="custrecord_tc_addr1" value="" data-rectype="field">';
            template += '</div>';
            template += ' <span class="help-block">';
            template += 'Example: 1234 Main Street';
            template += '  </span>';
            template += '</div>';

            template += '<div class="control-group control-group-big" data-input="address2">';
            template += '<label class="control-label" for="address2">';
            template += 'Address 2';
            template += ' </label>';
            template += '<div class="controls">';
            template += ' <input type="text" class="input-xlarge" id="address2" name="custrecord_tc_addr2" placeholder="optional" value="" data-rectype="field">';
            template += '  </div>';
            template += '  <span class="help-block">';
            template += 'Example: Apt. 3 or Suite #1516';
            template += ' </span>';
            template += '</div>';

            template += ' <div class="control-group" data-input="city">';
            template += '  <label class="control-label" for="city">';
            template += 'City';
            template += ' </label>';
            template += ' <div class="controls">';
            template += '  <input class="input-xlarge" id="country" name="custrecord_tc_country" data-rectype="field">';
            // template += Utils.cityOptions();
            // template += '</select>';
            template += '</div>';
            template += ' </div>';

            template += '<div class="control-group" data-input="country">';
            template += '  <label class="control-label" for="country">';
            template += 'Country';
            template += ' </label>';
            template += ' <div class="controls">';
            template += '<select class="input-xlarge" id="country" name="custrecord_tc_country" data-rectype="field">';
            template += Utils.countryOptions();
            template += '</select>';
            template += '</div>';
            template += ' </div>';

            // template += '<div class="control-group= quantity_countries <= 1 ?  hide : ' + ' " data-input="country">';
            // template += '  <label class="control-label" for="country">';
            // template += 'Country';
            // template += ' </label>';
            // template += '<div class="controls">';

            // template += ' </div>';
            // template += ' </div>';

            template += '<div class="control-group" data-input="state">';
            template += '<label class="control-label" for="state">';
            template += 'State/Province/Region';
            template += ' </label>';
            template += ' <div class="controls">';
            template += ' <input type="text" class="input-medium" id="state" name="custrecord_tc_state" value="" data-type="state" data-rectype="field">';
            template += ' </div>';
            template += ' </div>';

            template += '<div class="control-group"  data-input="zip">';
            template += '<label class="control-label" for="zipcode">';
            template += 'Zip Code';
            template += ' </label>';
            template += ' <div class="controls">';
            template += ' <input type="text" class="input-medium" id="zipcode" name="custrecord_tc_zip" value="" data-type="zip" data-rectype="field">';
            template += ' </div>';
            template += ' <span class="help-block">';
            template += 'Example: 94117';
            template += ' </span>';
            template += '</div>';

            template += '<div class="control-group control-group-big" data-input="notes">';
            template += '<label class="control-label" for="notes">';
            template += 'Client Notes';
            template += '  </label>';
            template += ' <div class="controls">';
            template += ' <textarea id="notes" name="custrecord_tc_notes" data-rectype="field" style="resize:none; width: 100% !important;"> </textarea>';
            template += '</div>';
            template += '</div>';

            template += ' </fieldset>';
            template += '</form>';



            return template;
        });


        ////////////// 25-04-19



        //Helper Set variable value
        Handlebars.registerHelper('setVariable', function (varName, varValue, options) {
            options.data.root[varName] = varValue;

        });

        Handlebars.registerHelper('formatCurrency', function (amount, symbol) {
            // Handlebars sets an object as the last arguement.
            // If formatCurrency was called with one argument, second argument won't be the expected string symbol
            if (typeof symbol === 'string') {
                return Utils.formatCurrency(amount, symbol);
            } else {
                return Utils.formatCurrency(amount);
            }
        });

        Handlebars.registerHelper('if_even', function (conditional, options) {
            if ((conditional % 2) === 0) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        });

        Handlebars.registerHelper('if_odd', function (conditional, options) {
            return (conditional % 2) !== 0 ?
                options.fn(this) : options.inverse(this);

        });
    });
