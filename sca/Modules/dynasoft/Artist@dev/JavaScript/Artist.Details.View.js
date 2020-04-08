define('Artist.Details.View',
  [
  'Backbone',
  'artist_details.tpl'
  ],
  function (Backbone, artist_details_template) {
    return Backbone.View.extend({
      getContext: function () {
        return {
          'name': this.model.get('name'),
          'genre': this.model.get('genre'),
          'internalid': this.model.get('internalid')
        }
      },

      template: artist_details_template

    });
  }
)