// Fit Profile.Model.js
// -----------------------
// Model for fit profile functionality (CRUD)
define('FitProfile.Model', ['Client.Model', 'Client.Collection', 'Profile.Model', 'Profile.Collection', 'Utils'], function (ClientModel, ClientCollection, ProfileModel, ProfileCollection, Utils)
{
	'use strict';

	return Backbone.Model.extend(
	{
		client_collection : new ClientCollection()
	,	profile_collection: null
	,	measurement_config: null
	,	selected_measurement: null
	,	orderhistory_collection: null
	,	alteration_collection: null  //02/09/2019 Saad SAAD

	,	initialize: function(userID){
			var self = this;
			this.set({current_client: null, current_profile: null, current_user: userID});
			//Initialize Clients Collection
			this.profileModel = ProfileModel.getInstance();
			var tailor = this.profileModel.get('parent');
			var param = new Object();
			param.type = "get_client";
			param.data = JSON.stringify({filters: ["custrecord_tc_tailor||anyof|list|" + tailor], columns: ["internalid", "created", "custrecord_tc_first_name", "custrecord_tc_last_name", "custrecord_tc_dob", "custrecord_tc_company", "custrecord_tc_email", "custrecord_tc_addr1", "custrecord_tc_addr2", "custrecord_tc_country", "custrecord_tc_city", "custrecord_tc_state", "custrecord_tc_zip", "custrecord_tc_phone", "custrecord_tc_notes"]});
			Utils.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "GET", param).always(function(data){
				if(data){
					self.client_collection.add(JSON.parse(data));
					self.trigger("afterInitialize");
				}
			});

			jQuery.get(Utils.getAbsoluteUrl('javascript/FitProfile_Config.json')).done(function(data){
				self.measurement_config = data;
			});

			this.on("change:current_client", this.fetchProfile);
			this.on("change:current_profile", this.fetchMeasure);
			this.on("change:current_client", this.fetchalterations);   //02/09/2019 Saad SAAD
		}
		, refreshCollection: function(){
			var self = this;
			var tailor = this.profileModel.get('parent');
			var param = new Object();
			param.type = "get_client";
			param.data = JSON.stringify({filters: ["custrecord_tc_tailor||anyof|list|" + tailor], columns: ["internalid", "created", "custrecord_tc_first_name", "custrecord_tc_last_name", "custrecord_tc_dob", "custrecord_tc_company", "custrecord_tc_email", "custrecord_tc_addr1", "custrecord_tc_addr2", "custrecord_tc_country", "custrecord_tc_city", "custrecord_tc_state", "custrecord_tc_zip", "custrecord_tc_phone", "custrecord_tc_notes"]});
			_.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "GET", param).always(function(data){
				if(data){
					self.client_collection.add(JSON.parse(data));
					//self.trigger("afterInitialize");
				}
			});
		}
	,	fetchProfile : function(){
			var clientID = this.get("current_client");
			var self = this;
			if(clientID){
				//var currentUser = this.application.getUser().get("internalid");
				var currentUser = this.get("current_user");

				var param = new Object();
				param.type = "get_profile";
				param.data = JSON.stringify({filters: ["custrecord_fp_client||anyof|list|" + clientID], columns: ["internalid", "name", "created", "lastmodified", "custrecord_fp_product_type", "custrecord_fp_measure_type", "custrecord_fp_measure_value"]});
				Utils.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "GET", param).always(function(data){
					if(data){
						self.profile_collection = new ProfileCollection().add(JSON.parse(data));
						self.trigger("afterProfileFetch");
					}
				});
			}
		}

	,	fetchalterations : function(){  //02/09/2019 Saad SAAD
			var clientID = this.get("current_client");
			var self = this;
			if(clientID){
				//var currentUser = this.application.getUser().get("internalid");
				var currentUser = this.get("current_user");

				var param = new Object();
				param.type = "get_alterations";
				param.data = JSON.stringify({filters: ["custrecord_alterations_client||anyof|list|" + clientID], columns: ["internalid", "name", "lastmodified", "custrecord_alterations_measure_values"]});
				_.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "GET", param).always(function(data){
					if(data){
						self.alteration_collection = new ProfileCollection().add(JSON.parse(data));
						self.trigger("afterProfileFetch");
					}
				});
			}
		}

	});
});
