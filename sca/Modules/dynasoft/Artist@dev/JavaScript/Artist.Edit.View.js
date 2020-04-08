define('Artist.Edit.View',
  [
  'Backbone',
  'artist_edit.tpl',
  'Backbone.FormView'
  ],
  function (Backbone, artist_edit_template,FormView) {
      
    return Backbone.View.extend({
      template: artist_edit_template,
      events: {
        'submit form': 'saveForm'
      },

      initialize: function(options) {
        this.application = options.application;
        this.model = options.model;
        FormView.add(this);
      },


      getContext: function() {
        return {
          isNew: this.model.isNew(),
          id: this.model.get('internalid'),
          name: this.model.get('name'),
          genre: this.model.get('genre')
        }
      },

      getBreadcrumbPages: function() {
        if (this.model.isNew()) {
          return [
            {text: 'Artists', href: '/artists'},
            {text: 'New', href: '/artists/new'}
          ]
        } else {
          return [
            {text: 'Artists', href: '/artists'},
            {text: 'Edit', href: '/artists/' + this.model.get('internalid')}
          ]
        }
      },

      getSelectedMenu: function() {
        return 'artistslist'
      }
    });
  }
)