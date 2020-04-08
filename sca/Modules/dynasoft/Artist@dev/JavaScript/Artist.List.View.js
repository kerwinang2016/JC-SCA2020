define('Artist.List.View', [
  'Backbone', 
  'artist_list.tpl',
  'Backbone.CollectionView',
  'Backbone.CompositeView',
  'Artist.Details.View',
  'GlobalViews.Confirmation.View',
  'jQuery'
], function (Backbone, artist_list_tpl,CollectionView,CompositeView,ArtistDetailsView,ConfirmationView,jQuery) {
  
  return Backbone.View.extend({

      template: artist_list_tpl,

      events: {
        'click button[data-action="remove"]': 'removeArtist'
      },
  
      removeModel: function(options) {
        var model = options.context.collection.get(options.id);
        model.destroy();
      },
  
      removeArtist: function(e) {
        e.preventDefault();
        var view = new ConfirmationView({
          title: 'Remove Artist',
          body: 'Are you sure you want to remove this artist?',
          callBack: this.removeModel,
          callBackParameters: {
            context: this,
            id: jQuery(e.target).data('id')
          },
          autohide: true
        });
        this.application.getLayout().showInModal(view);
      },

      getContext: function ()
    {
       return {
          //@property {String} myNewModuleContextVar
          myNewModuleContextVar: 'myVariable'
       };
    },

    initialize: function (options) {

      var self = this;
    this.collection.on('reset sync add remove change destroy', function() {
      self.render();
    });
      CompositeView.add(this);
      this.application = options.application;
    this.collection = options.collection;

    
    },

    childViews: {
      'Artist.Collection': function() {
        return new CollectionView({
          'childView': ArtistDetailsView,
          'collection': this.collection,
          'viewsPerRow': 1
        });
      }
    },

    getBreadcrumbPages: function() {
      return [{text: 'Artists', href: '/artists'}]
    },

    getSelectedMenu: function() {
      return 'artistslist'
    }

  });
});



