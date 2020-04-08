/* define('Artist.Router', [
    'Backbone',
    'Artist.List.View'
    ], function(Backbone, ListView)  {
    return Backbone.Router.extend({
 
        initialize: function(application) {
            this.application = application;
          },
      routes: {
        'artists': 'artistList',
        'artists/new': 'newArtist',
        'artists/:id': 'artistDetails'
      },
      artistList: function() {
        var view = new ListView ({application: this.application});
        view.showContent();
      
      }
    });
  }); */


  define('Artist.Router', [
    'Backbone',
    'Artist.List.View',
    'Artist.Model',
    'Artist.Collection',
    'Artist.Edit.View',
    'jQuery'
    ], function (Backbone, ListView, Model, Collection,EditView,jQuery) {
  
    return Backbone.Router.extend ({
  
      initialize: function(application) {
        this.application = application;
      },
  
      routes: {
        'artists': 'artistList',
        'artists/new': 'artistDetails',
        'artists/:id': 'artistDetails'
      },
  
      artistList: function () {
        var collection = new Collection();
        var view = new ListView({collection: collection, application: this.application});
        collection.fetch().done(function() {
          view.showContent();
        });
      },

      /* newArtist: function () {
        var view = new EditView({model: new Model(), application: this.application})
        view.showContent();
      }, */
      artistDetails: function (id) {
        var model = new Model();
        var promise = jQuery.Deferred();
        var self = this;
  
        if (!id) {
          promise.resolve();
        } else {
          model.fetch({
            data: {
              internalid: id
            }
          }).done(function () {
            promise.resolve();
          });
        }
        promise.done(function () {
          var view = new EditView({model: model, application: self.application});
          view.showContent();
          view.model.on('sync', function (model) {
              Backbone.history.navigate('artists', {trigger: true});
          });
        });
      }
      
    });
  });