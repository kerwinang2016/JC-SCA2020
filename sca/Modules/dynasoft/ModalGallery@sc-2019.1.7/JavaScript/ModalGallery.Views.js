

define('ModalGallery.Views',
[
'Backbone'
,'modal_gallery.tpl'
,'Utils'
],function(Backbone,modal_gallery_tpl,Utils){   //05/07/2019 Saad


     return Backbone.View.extend({
        template: modal_gallery_tpl
	,	title: ''
	,	events: {} 
	,	initialize: function (options)
		{ 
			this.title = options.key == jQuery("#" + options.title) ? jQuery("#" + options.title).find("option:selected").attr("name"): _(options.title).translate();
			this.application = options.application;
			this.key = options.key;
		}
	, 	getImageArray: function () {

	}
	,	render: function() {	
			var self = this
			,	imageArray = new Array()
			,	key = this.key
			,	domain = SC.ENVIRONMENT.embEndpointUrl.data.domain
			,	baseUrl = "http://"+domain+"/SSP%20Applications/NetSuite%20Inc.%20-%20SCA%202019.1/Development/img/";  //16/12/2019 saad

			jQuery.get(Utils.getAbsoluteUrl('javascript/DesignOptionsImages_Config.json')).done(function(data){

					var optionsConfig = data;
					if (optionsConfig) {
						if(optionsConfig[0][key]) {

							for (var i = optionsConfig[0][key].length - 1; i >= 0; i--) {
								imageArray.push(baseUrl + optionsConfig[0][key][i]);
							};
							//var imagePath = baseUrl + optionsConfig[0][key];
							self.renderImages(imageArray);
						}
					};
				});

			this._render();
		}
	, 	renderImages: function (img) { //28/08/2019 Saad
			var self = this;
		
			jQuery('#in-modal-display-option-gallery').html(Utils.galleryPanel(img, this));
			var slider = jQuery('.bxslider').bxSlider({
				buildPager: function (slideIndex) {
					return "<img src=" + self.application.resizeImage(img[slideIndex], 'tinythumb') + ">";
				}
			});
		
			setTimeout(function () {
				if (img.length != 1) {
					slider.reloadSlider();
				}
			}, 200);
		}

	,	getContext: function ()
		{
			return {
					
					title: this.title
				}
		}

});

});

