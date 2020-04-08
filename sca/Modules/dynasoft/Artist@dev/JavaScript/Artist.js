define('Artist',
  [
  'Artist.Router'
  ],
  function (Router) { 
    'use strict';
    return {
      MenuItems: {
        // parent: 'settings',
        // id: 'artistslist',
        // name: 'Artists List',
        // url: 'artists',
        // index: 0
      },
      mountToApp: function(application) {
          //console.log("Artist");
        return new Router(application);
      }
    }
  }
);