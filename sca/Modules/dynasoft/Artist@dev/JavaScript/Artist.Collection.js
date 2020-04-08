define('Artist.Collection',
  [
  'Backbone',
  'Artist.Model'
  ],
  function (Backbone, Model) {
    return Backbone.Collection.extend({
      model: Model,
      url: 'services/Artist.Service.ss'
    });
  }
);