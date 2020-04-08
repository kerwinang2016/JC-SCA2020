define('Profile.View',
[
    'Backbone','profile.tpl', 'fit_profile.tpl', 'underscore', 'Utils', 'FitProfile.Model', 'Client.Collection', 'HandlebarsExtras', 'FProfile.Model', 'Profile.Collection'
],
function(Backbone,profiletpl, fit_profile_tpl, _, Utils, FitProfileModel, client_collection, HandlebarsExtras, ProfileModel, ProfileCollection){

    return Backbone.View.extend({
		template: profiletpl
		, events: {
			//  'change select#body-fit': 'rebuildMeasureForm'
			// , 'change .allowance-fld': 'updateFinalMeasure'
			// , 'change .body-measure-fld': 'updateFinalMeasure'
			// , 'change #fit': "updateAllowanceLookup"
			// , 'change .block-measurement-fld': 'disableCounterBlockField'
			'submit #profile-form': 'submitProfile'
			// , 'change [id="units"]':'changedUnits'
			// , 'change [id*="body-block"]': 'fitBlockChanged'
			// , 'change [id*="body-fit"]': 'fitBlockChanged'
		} 

		, initialize: function (options) {
			this.profile_collection = options.profile_collection;
			this.fitprofile = options.fitprofile;
			var self = this;
			jQuery.get(Utils.getAbsoluteUrl('javascript/presetsConfig.json')).done(function (data) {
				window.presetsConfig = data;
			});
			jQuery.get(Utils.getAbsoluteUrl('javascript/itemRangeConfig.json')).done(function (data) {
				window.cmConfig = data;
				window.itemRangeConfig = data;
			});
			jQuery.get(Utils.getAbsoluteUrl('javascript/itemRangeConfigInches.json')).done(function (data) {
				window.inchConfig = data;
			});
		}

		,changedUnits : function(el){
			var $ = jQuery;

			var productType = jQuery('#custrecord_fp_product_type').val();
			var unit = $('#units').val();

			var configUrl = unit ==='CM'?'javascript/itemRangeConfig.json':'javascript/itemRangeConfigInches.json';

			jQuery.get(_.getAbsoluteUrl(configUrl)).done(function (data) {
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

		, render: function (selectedProfile, measurement_config,paramEvent, clientid, tailorId) {
			var selectedUnit;
			var $ = jQuery;
			var self = this;
			if(selectedProfile){
				selectedUnit = selectedProfile.custrecord_fp_measure_value[0].value
			}
			if(selectedUnit === 'Inches' && (selectedUnit !== null || selectedUnit !== undefined)){
				window.itemRangeConfig = window.inchConfig;
			}

			this._render();
			$("#fit-profile-modal-body").html(Utils.profileForm(selectedProfile, measurement_config,paramEvent, clientid, tailorId));
			$("#fit-profile-modal").modal("toggle");
			jQuery('[id*="body-block"]').trigger('change');  //20/01/2020
			//_.toggleMobileNavButt();
			// setTimeout(function() {
			// 	if(jQuery('#custrecord_fp_measure_type').val() == 'Block'){
			// 		self.updateBlockAndFinished(jQuery('[id*="body-fit"]').val(),jQuery('[id*="body-block"]').val())
			// 	}
			// }, 1000);


		}

		
		// , disableCounterBlockField: function (e) {
		// 	jQuery('[class="fav-fit-tools-default"]').html('---'); //JHD-11
		// 	var currentField = jQuery(e.target)
		// 		, counterField = currentField.prop("id").indexOf('-max') > -1 ? currentField.prop("id").replace('-max', '-min') : currentField.prop("id").replace('-min', '-max');

		// 	if (counterField && currentField.val() != "0") {
		// 		jQuery("[id='"+counterField+"']").prop("disabled", true);
		// 	} else {
		// 		jQuery("[id='"+counterField+"']").removeProp("disabled");
		// 	}

		// 	if(jQuery('[id*="body-block"]').val() != 'Select' && jQuery('[id*="body-fit"]').val() != 'Select'){
		// 		this.updateBlockAndFinished(jQuery('[id*="body-fit"]').val(),jQuery('[id*="body-block"]').val())
		// 	}else{
		// 		this.clearBlockAndFinished();
		// 	}
		// }
		// ,   updateBlockAndFinished: function (fit, block) { // 6/19/2019 Saad    //01/08/2019 Saad
        //     var self = this;
        //     var producttype = jQuery('[name="custrecord_fp_product_type"]').val();
        //     var blockfields = jQuery('.block-measurement-fld');
        //     var checklayout='';
        //     var checklayout1='';
        //     if(window.location.pathname== "/fitprofile")  //01/08/2019 Saad
        //     {
                
        //         checklayout=self.options.application._layoutInstance.currentView.measurementdefaults;
        //     }
        //     else
        //     {
        //         checklayout=self.measurementdefaults;

        //     }
        //     _.each(blockfields, function (blockfield) {
        //         var a = _.find(checklayout, function (b) {
        //             return b.custrecord_md_blockmeasurement == block && b.custrecord_md_bodyparttext == blockfield.dataset.field && b.custrecord_md_fitoptionstext == fit && b.custrecord_md_producttypetext == producttype;
        //         });
        //         if (a) {
        //             var mdvalue = a.custrecord_md_value ? parseFloat(a.custrecord_md_value).toFixed(1) : '---';
        //             jQuery('[data-container="' + blockfield.dataset.field + '-block"]').html(mdvalue);
        //             jQuery('[data-container="' + blockfield.dataset.field + '-finished"]').html(mdvalue);
        //         }

        //     });
        //     _.each(blockfields, function (blockfield) {
        //         if (blockfield.value != '0') {
        //             if(window.location.pathname == "/fitprofile")  //01/08/2019 Saad
        //             {
                      
        //                 checklayout1=self.options.application._layoutInstance.currentView.influences;
        //             }
        //             else
        //             {
                        
        //                 checklayout1=self.influences;
        
        //             }
        //             var in_items = _.filter(checklayout1, function (c) {

        //                 return c.custrecord_in_producttypetext == producttype && c.custrecord_in_bodyparttext == blockfield.dataset.field;
        //             });

        //             if (in_items && in_items.length > 0) {
        //                 var blockval = parseFloat(blockfield.value);
        //                 for (var i = 0; i < in_items.length; i++) {
        //                     var finishedval = parseFloat(jQuery('[data-container="' + in_items[i].custrecord_in_in_parttext + '-finished"]').html());
        //                     var newval = parseFloat(blockval * (parseFloat(in_items[i].custrecord_in_influence) / 100) + finishedval).toFixed(1)
        //                     jQuery('[data-container="' + in_items[i].custrecord_in_in_parttext + '-finished"]').html(newval);
        //                 }
        //             }
        //         }
        //     });

        // }
		// , fitBlockChanged: function(e){
		// 	if((jQuery('[id*="body-block"]').val() != 'Select' && jQuery('[id*="body-fit"]').val() != 'Select') ){
		// 		this.updateBlockAndFinished(jQuery('[id*="body-fit"]').val(),jQuery('[id*="body-block"]').val())
		// 	}else{
		// 		this.clearBlockAndFinished();
		// 	}
		// }
		// , clearBlockAndFinished:function(){
		// 	jQuery('[data-container]').html('---');
		// }

		// , buildMesureForm: function (e) {

		// 	jQuery("[id='butt-modal-copy']").hide();
		// 	jQuery("[id='butt-modal-remove']").hide();
		// 	jQuery("[id='butt-modal-submit']").hide();

		// 	var measureType = jQuery(e.target).val()
		// 		, itemType = jQuery("#custrecord_fp_product_type").val()
		// 		, self = this
		// 		, fieldsForm = null;

		// 	 if (measureType && itemType) {
		// 	 	fieldsForm = _.where(self.fitprofile.measurement_config, { item_type: itemType })[0];
		// 	 	fieldsForm = _.where(fieldsForm.measurement, { type: measureType })[0];
		// 	 	self.processBlockFields(fieldsForm, 'Regular');
		// 	 	self.fitprofile.selected_measurement = fieldsForm;

		// 	 	jQuery("#measure-form").html(SC.macros.measureForm(fieldsForm));

		// 	 	jQuery("[id='butt-modal-submit']").show();
		// 		 if(measureType == 'Block'){
		// 			//JHD-11 Start
		// 			var data = self.options.application._layoutInstance.currentView.defaultfavfittools;
		// 			if(data){
		// 				var tempFavFitToolsData = JSON.parse(data); 
		// 				var favDefaultData = tempFavFitToolsData[0];
		// 					if (favDefaultData) {
		// 						jQuery("label").removeClass( "fav-fit-tools-default");
		// 						var defaultFields = '';
		// 						favDefaultData = JSON.parse(favDefaultData);
		// 						for(var j = 0; j < favDefaultData.length; j++){
		// 							if(favDefaultData[j].itemType == itemType){
		// 								defaultFields = favDefaultData[j].measurementValues;
		// 								if(defaultFields){
		// 									for(var i = 0; i < defaultFields.length; i++ ){
		// 										var name = defaultFields[i].name;
		// 										var value = defaultFields[i].value;
		// 										if(value != 'select' ){
		// 											var defaultId = name.replace('max', 'default').replace('min', 'default').replace('%', '/').replace('F2', '');
		// 											if(parseFloat(value) != 0){
		// 												var selectMaxMinId = name.replace('%', '/').replace('F2', '');
		// 												jQuery('[id="'+ defaultId + '"]').html(value);
		// 												jQuery('select[name="' + selectMaxMinId + '"]').val(value);
		// 												var tempFiledId =  selectMaxMinId.split('-');
		// 												var index = tempFiledId.length - 1;
		// 												if(tempFiledId[index] == 'max'){
		// 													tempFiledId[index] = 'min';
		// 													var disabledFiledId = tempFiledId.join('-');
		// 													jQuery('select[id="' + disabledFiledId + '"]').prop("disabled", true);
		// 												} else {
		// 													tempFiledId[index] = 'max';
		// 													var disabledFiledId = tempFiledId.join('-');
		// 													jQuery('select[id="' + disabledFiledId + '"]').prop("disabled", true);
		// 												}	
		// 											} else {
		// 												if(name.indexOf('min') != -1){
		// 													var defaultValue = jQuery('[id="'+ defaultId + '"]').text();
		// 													if(defaultValue.length == 0){
		// 														jQuery('[id="'+ defaultId + '"]').html('---');
		// 													}
		// 												}
		// 											}
		// 										}
		// 									}
		// 								}
		// 							}
		// 						}
		// 					}
		// 			}
		// 			//JHD-11 End				
		// 		}

		// 	 } else {
		// 	 	jQuery("#measure-form").html("");

		// 	 	jQuery("[id='butt-modal-copy']").hide();
		// 	 	jQuery("[id='butt-modal-remove']").hide();
		// 	 	jQuery("[id='butt-modal-submit']").hide();
		// 	 }
		// }

		// , rebuildMeasureForm: function (e) {

		// 	jQuery("[id='butt-modal-copy']").hide();
		// 	jQuery("[id='butt-modal-remove']").hide();
		// 	jQuery("[id='butt-modal-submit']").hide();

		// 	var fitType = jQuery(e.target).val()
		// 		, measureType = jQuery("#custrecord_fp_measure_type").val()
		// 		, itemType = jQuery("#custrecord_fp_product_type").val()
		// 		, self = this
		// 		, fieldsForm = null;

		// 	if (measureType && itemType && fitType) {
		// 		fieldsForm = _.where(self.fitprofile.measurement_config, { item_type: itemType })[0];
		// 		fieldsForm = _.where(fieldsForm.measurement, { type: measureType })[0];
		// 		self.processBlockFields(fieldsForm, fitType)
		// 		self.fitprofile.selected_measurement = fieldsForm;

		// 		//jQuery("#measure-form").html(SC.macros.measureForm(fieldsForm, [{ "name": "fit", "value": fitType }]));

		// 		jQuery("[id='butt-modal-submit']").show();

		// 	} else {
		// 		jQuery("#measure-form").html("");

		// 		jQuery("[id='butt-modal-copy']").hide();
		// 		jQuery("[id='butt-modal-remove']").hide();
		// 		jQuery("[id='butt-modal-submit']").hide();

		// 	}
		// }

		// , processBlockFields: function (form, fittype) {
		// 	if (form && form.fieldset && form.fieldset.length) {
		// 		_.each(form.fieldset, function (fieldset) {
		// 			if (fieldset && fieldset.name !== "main") {
		// 				if (fieldset.fields && fieldset.fields.length) {
		// 					_.each(fieldset.fields, function (field) {
		// 						fittype = fittype.toLowerCase().replace(/ /g, '-');

		// 						if (field[fittype] && field[fittype].max && field[fittype].min) {
		// 							field.max = field[fittype].max;
		// 							field.min = field[fittype].min;
		// 						}
		// 					});
		// 				}
		// 			}
		// 		});
		// 	}
		// }

		// , updateFinalMeasure: function (e) {
		// 	var field = jQuery(e.target)
		// 		, id = field.prop("id").indexOf("_") > -1 ? field.prop("id").split("_")[1] : field.prop("id")
		// 		, isAllowance = field.prop("id").indexOf("_") > -1 ? true : false
		// 		, finalMeasure = 0;

		// 	if (isAllowance) {
		// 		if (_.isNaN(jQuery("[id='allowance_" + id + "']").val()) || jQuery("[id='allowance_" + id + "']").val() === "") {
		// 			// finalMeasure =  (parseFloat(jQuery("#" + id).val()) * (parseFloat(field.data("baseval")) / 100)) + parseFloat(jQuery("#" + id).val());
		// 			finalMeasure = 0 + parseFloat(field.val());
		// 		} else {
		// 			//finalMeasure = parseFloat(jQuery("#" + id).val()) + parseFloat(field.val());
		// 			finalMeasure = parseFloat(jQuery("[id='" + id + "']").val())+ parseFloat(field.val());
		// 		}
		// 	} else {
		// 		if (_.isNaN(jQuery("[id='allowance_" + id + "']").val()) || jQuery("[id='allowance_" + id + "']").val() === "") {
		// 			// finalMeasure = (parseFloat(field.val()) * (parseFloat(jQuery("#allowance_" + id).data("baseval")) / 100)) + parseFloat(field.val());
		// 			finalMeasure = 0 + parseFloat(field.val());
		// 		} else if (jQuery("[id='allowance_" + id + "']").val() == 0) {
		// 			var value = jQuery("#fit").val()
		// 				, self = this
		// 				, lookUpTable = self.fitprofile.selected_measurement["lookup-value"][value]
		// 				, name = jQuery(e.target).attr('name')
		// 				, lookUpValue = _.where(lookUpTable, { field: name })
		// 				, finalMeasure = 0
		// 				, allowance = 0;

		// 			var selectedUnit = jQuery('#units').val();
		// 			if(selectedUnit === 'Inches'){
		// 				lookUpValue = (lookUpValue / 2.54);
		// 				if(lookUpValue>0){
		// 					lookUpValue = lookUpValue.toFixed(1);
		// 				}
		// 			}

		// 			if (lookUpValue && lookUpValue.length) { // Update allowance field if there is a lookup value provided that allowance is 0
		// 				//jQuery("#allowance_" + id).val(lookUpValue[0].value);
		// 				jQuery("[id='allowance_" + id + "']").val(lookUpValue[0].value)
		// 				allowance = jQuery("[id='allowance_" + id + "']").val();
		// 			}
		// 			finalMeasure = parseFloat(allowance) + parseFloat(jQuery("[id='" + id + "']").val());
		// 		} else {
		// 			//finalMeasure = parseFloat(jQuery("#allowance_" + id).val()) + parseFloat(field.val());
		// 			//finalMeasure = parseFloat(jQuery(idAllowancePrefix + id).val()) + parseFloat(jQuery(idPrefix + id).val());
		// 			finalMeasure = parseFloat(jQuery("[id='allowance_" + id + "']").val()) + parseFloat(jQuery("[id='" + id + "']").val())
		// 		}
		// 	}

		// 	if(_.isNaN(finalMeasure)){
		// 		finalMeasure = 0;
		// 	}
		// 	var finalMeasureEl = ("#finish_" + id).replace('#', '');
		// 	//jQuery("#finish_" + id).html(Math.round(finalMeasure * 10) / 10);
		// 	jQuery("[id='" + finalMeasureEl + "']").html(Math.round(finalMeasure * 10) / 10);
		// 	//Now that the final measure is set.. we need to check if there are presets to update the other measurement
		// 	var fit = jQuery('[name="fit"]').val();
		// 	var productType = jQuery('[name="custrecord_fp_product_type"]').val();
		// 	var presets = _.where(window.presetsConfig, { make: productType});
		// 	var selectedUnit = jQuery('[name="units"]').val();
		// 	for(var i=0;i< presets.length;i++){
		// 		if(presets[i].profile && presets[i].profile.indexOf(fit) != -1){
		// 			if(presets[i][id]){
		// 				//Check for the values
		// 				var setranges = presets[i][id];
		// 				var rangeindex = Math.floor(setranges.length/2);
		// 				var rangetop = setranges.length-1, rangebottom = 0,notfound = true;
		// 				do{
		// 					var toplower = selectedUnit === 'Inches'?parseFloat(setranges[rangetop].lower)/2.54:parseFloat(setranges[rangetop].lower),
		// 					topupper = selectedUnit === 'Inches'?parseFloat(setranges[rangetop].upper)/2.54:parseFloat(setranges[rangetop].upper),
		// 					bottomlower = selectedUnit === 'Inches'?parseFloat(setranges[rangebottom].lower)/2.54:parseFloat(setranges[rangebottom].lower),
		// 					bottomupper = selectedUnit === 'Inches'?parseFloat(setranges[rangebottom].upper)/2.54:parseFloat(setranges[rangebottom].upper),
		// 					indexlower = selectedUnit === 'Inches'?parseFloat(setranges[rangeindex].lower)/2.54:parseFloat(setranges[rangeindex].lower),
		// 					indexupper = selectedUnit === 'Inches'?parseFloat(setranges[rangeindex].upper)/2.54:parseFloat(setranges[rangeindex].upper);
		// 					if(toplower <= parseFloat(finalMeasure) && topupper > parseFloat(finalMeasure)){
		// 					 	notfound = false;
		// 						rangeindex = rangetop;
		// 					}
		// 					else if(bottomlower <= parseFloat(finalMeasure) && bottomupper > parseFloat(finalMeasure)){
		// 					 	notfound = false;
		// 						rangeindex = rangebottom;
		// 					}
		// 					else if(indexlower <= parseFloat(finalMeasure) && indexupper > parseFloat(finalMeasure)){
		// 					 	notfound = false;
		// 					}
		// 					else if(indexlower > parseFloat(finalMeasure)){
		// 						rangetop = rangeindex;
		// 						rangeindex = Math.floor((rangetop - rangebottom)/2)+rangebottom;
		// 					}
		// 					else{
		// 						rangebottom = rangeindex;
		// 						rangeindex = Math.floor((rangetop-rangebottom)/2)+rangebottom;
		// 					}
		// 				}while(notfound && (rangetop-rangebottom)>1);
		// 				if(!notfound){
		// 					var keys = Object.keys(setranges[rangeindex].set);
		// 					for(var l=0;l<= keys.length;l++){
		// 						if(selectedUnit === 'Inches'){
		// 							//if(jQuery("#"+keys[l]).val() == 0 || jQuery("#"+keys[l]).val() == '' ){
		// 							jQuery("#"+keys[l]).val((parseFloat(setranges[rangeindex].set[keys[l]])/2.54).toFixed(1));
		// 							jQuery("#"+keys[l]).trigger('change');
		// 							//}
		// 						}else{
		// 							//if(jQuery("#"+keys[l]).val() == 0 || jQuery("#"+keys[l]).val() == '' ){
		// 							jQuery("#"+keys[l]).val(setranges[rangeindex].set[keys[l]]);
		// 							jQuery("#"+keys[l]).trigger('change');
		// 							//}
		// 						}
		// 					}
		// 				}
		// 			}
		// 			//For Adjustment
		// 			if(presets[i].adjust && presets[i].adjust.length){
		// 					for(var j=0;j<presets[i].adjust.length; j++){
		// 						if(presets[i].adjust[j].part == id){
		// 							var partmeasure = parseFloat(jQuery("[id='" + id + "']").val());
		// 							if(partmeasure > 0){
		// 							if(selectedUnit === 'Inches'){
		// 								var adjustpart = presets[i].adjust[j].adjustpart;
		// 								var adjustval = parseFloat(presets[i].adjust[j].value)/2.54;
		// 								jQuery("[id='" + adjustpart+"']").val((partmeasure+adjustval));
		// 								jQuery("[id='" + adjustpart+"']").trigger('change');
		// 							}else{
		// 								var adjustpart = presets[i].adjust[j].adjustpart;
		// 								var adjustval = parseFloat(presets[i].adjust[j].value);
		// 								jQuery("[id='" + adjustpart+"']").val((partmeasure+adjustval));
		// 								jQuery("[id='" + adjustpart+"']").trigger('change');
		// 							}
		// 							}
		// 						}
		// 					}
		// 			}
		// 		}
		// 	}
		// }
		// , updateAllowanceLookup: function (e) {
		// 	var value = jQuery(e.target).val()
		// 		, self = this
		// 		, lookUpTable = JSON.parse(JSON.stringify(self.fitprofile.selected_measurement["lookup-value"][value]));

		// 	var selectedUnit = jQuery('#units').val();
		// 	_.each(lookUpTable,function(element,index,list){
		// 		if(selectedUnit==='Inches'){
		// 			list[index].value = (list[index].value * 0.39).toFixed(1);
		// 		}
		// 	});

		// 	jQuery(".allowance-fld").each(function () {
		// 		var id = jQuery(this).prop("id").split("_")[1]
		// 			, lookUpValue = _.where(lookUpTable, { field: id })
		// 			, finalMeasure = 0;

		// 		if (lookUpValue && lookUpValue.length) {
		// 			jQuery(this).data("baseval", lookUpValue[0].value);

		// 			if (jQuery("#" + id).val() !== "") {
		// 				jQuery(this).val(lookUpValue[0].value);
		// 			} else {
		// 				jQuery(this).val("0");
		// 			}
		// 		} else {
		// 			//jQuery(this).data("baseval", 0);
		// 			jQuery(this).val("0");
		// 		}

		// 		jQuery(this).trigger('change');
		// 	});
		// }
		// , lookupBlockValue: function(){

		// 	if(jQuery('[name="custrecord_fp_measure_type"]').val() == 'Block'){
		// 		return jQuery('[name="block"]').val();
		// 	}else{
		// 		//Should be a body
		// 		//3:Jacket, 4:Trouser, 6:Waistcoat, 7:Shirt, 8:Overcoat
		// 		var ptype = jQuery('[name="custrecord_fp_product_type"]').val(), result;
		// 		switch(ptype){
		// 			case 'Jacket':
		// 			case 'Shirt':
		// 			case 'Overcoat':
		// 				var partvalue = 0;
		// 				var partmeasure = jQuery('[id*="finish_Waist"]').html(), partvalue = 0;

		// 				if(partmeasure){
		// 				partvalue = jQuery('[name="units"]').val() == 'CM'?partmeasure:parseFloat(partmeasure)*2.54;
		// 				partvalue = parseFloat(partvalue)/2
		// 				var filtered = _.filter(window.bodyBlockMeasurements,function(data){
		// 				return parseFloat(data.custrecord_bbm_bodymeasurement) >= parseFloat(partvalue) && data.custrecord_bbm_producttypetext == ptype;
		// 				})
		// 				if(filtered && filtered.length>0)
		// 				result = filtered.reduce(function(prev, curr){
		// 		        return parseFloat(prev['custrecord_bbm_bodymeasurement']) < parseFloat(curr['custrecord_bbm_bodymeasurement']) ? prev : curr;
		// 		    });
		// 				}
		// 				break;
		// 			case 'Waistcoat':
		// 				var partvalue = 0;
		// 				var partmeasure = jQuery('[id*="finish_waist"]').html(), partvalue = 0;

		// 				if(partmeasure){
		// 				partvalue = jQuery('[name="units"]').val() == 'CM'?partmeasure:parseFloat(partmeasure)*2.54;
		// 				partvalue = parseFloat(partvalue)/2
		// 				var filtered = _.filter(window.bodyBlockMeasurements,function(data){
		// 				return parseFloat(data.custrecord_bbm_bodymeasurement) >= parseFloat(partvalue) && data.custrecord_bbm_producttypetext == ptype;
		// 				})
		// 				if(filtered && filtered.length>0)
		// 				result = filtered.reduce(function(prev, curr){
		// 						return parseFloat(prev['custrecord_bbm_bodymeasurement']) < parseFloat(curr['custrecord_bbm_bodymeasurement']) ? prev : curr;
		// 				});
		// 			}
		// 				break;
		// 			case 'Trouser':
		// 				var partvalue = 0;
		// 				var partmeasure = jQuery('[id*="finish_seat"]').html(), partvalue = 0;
		// 				if(partmeasure){
		// 				partvalue = jQuery('[name="units"]').val() == 'CM'?partmeasure:parseFloat(partmeasure)*2.54;
		// 				partvalue = parseFloat(partvalue)/2
		// 				var filtered = _.filter(window.bodyBlockMeasurements,function(data){
		// 				return parseFloat(data.custrecord_bbm_bodymeasurement) >= parseFloat(partvalue) && data.custrecord_bbm_producttypetext == ptype;
		// 				})
		// 				if(filtered && filtered.length>0)
		// 				result = filtered.reduce(function(prev, curr){
		// 						return parseFloat(prev['custrecord_bbm_bodymeasurement']) < parseFloat(curr['custrecord_bbm_bodymeasurement']) ? prev : curr;
		// 				});
		// 				}
		// 				break;
		// 			default:
		// 		}
		// 		return result?result.custrecord_bbm_block:0;
		// 	}
		// }

		, submitProfile: function (e) {
			e.preventDefault();
			var finishMeasurements = jQuery('#profile-form span[id*="finish_"]');
			var hasErrors = false;
			for (var i = 0; i < finishMeasurements.length; i++) {
				if (finishMeasurements[i].attributes['min-value'] && finishMeasurements[i].attributes['max-value']) {
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
			var measureTypeValue = jQuery("#in-modal-custrecord_fp_measure_type").val() ?
				jQuery("#in-modal-custrecord_fp_measure_type").val() : jQuery("#custrecord_fp_measure_type").val();
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
			var formValues = jQuery(e.target).serialize().split("&")
				, self = this
				, dataToSend = new Array()
				, measurementValues = new Array();

			this.profile_collection.name = jQuery("#name").val();
			this.profile_collection.custrecord_fp_product_type = jQuery("#custrecord_fp_product_type").val();
			this.profile_collection.custrecord_fp_measure_type = jQuery("#custrecord_fp_measure_type").val();

			if (!this.profile_collection) {
				_.each(formValues, function (formValue) {
					var field = formValue.split("=")[0]
						, value = formValue.split("=")[1]
						, formData = new Object()
						, param = new Object();

					if (field == "custrecord_fp_client" || field == "name" || field == "custrecord_fp_product_type"
					|| field == "custrecord_fp_measure_type") {
						formData.name = field;
						if (field == "custrecord_fp_client" || field == "name") {
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
								measureData.value = value.replace(regex, " ");

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
				var bvalue = this.lookupBlockValue();
				if(bvalue){
					dataToSend.push({"name":"custrecord_fp_block_value","value":bvalue,"type":"field","sublist":""});
				}
				dataToSend.push({ "name": "custrecord_fp_measure_value", "value": JSON.stringify(measurementValues), "type": "field", "sublist": "" })
				param.type = self.fitprofile.get("current_profile") ? "update_profile" : "create_profile";
				if (self.fitprofile.get("current_profile")) {
					param.id = self.fitprofile.get("current_profile");
				}

				param.data = JSON.stringify(dataToSend);

				_.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "POST", param).always(function (data) {
					var newRec = JSON.parse(data.responseText);
					if (data.status) {
						self.fitprofile.set("current_profile", null);
						self.fitprofile.set("current_client", null);
						//self.options.application.getLayout().currentView.showContent()

						// Test issue #88
						self.options.application.getLayout().currentView.displayProfiles(JSON.parse(data.responseText), self.id, false);
					}
				});
			}
		}
	});

});