define('Artist.Model',
  [
  'Backbone',
  'underscore'
  ],
  function (Backbone, _) {
    return Backbone.Model.extend({
      urlRoot: 'services/CstmArtist.Service.ss',
      validation: {
        'name': {
          required: true,
          msg: 'Please enter an artist name'
        },
        'genre': {
          required: true,
          msg: 'Please enter a genre'
        }
      }
    });
  }
);