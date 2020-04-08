// Profile.Router.js
// -----------------------
// Router for handling profile view/update
define('ModalGallery.Router',  ['Backbone', 'ModalGallery.Views'], function (Backbone,ModalGalleryViews)
{
	'use strict';

	return Backbone.Router.extend({
		 
		routes: {                            //05/07/2019 Saad
			'img/:key': 'renderGallery'
		}
				 
	,	initialize: function (application)
		{

			this.application = application;
		}
		
	,	renderGallery: function(key){
			
			var	view = new ModalGalleryViews({
					application: this.application
				,	key: unescape(key).split("|")[0]
				,	title: unescape(key).split("|")[1]
				});
				view.showContent();
		}
	});
});