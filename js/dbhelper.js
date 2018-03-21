/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  static openDatabase() {
    return idb.open("MWS", 1, function(upgradeDb) {
      var store = upgradeDb.createObjectStore('restaurants', {
        keyPath: 'id'
      });
      store.createIndex('cuisine','cuisine_type');
      store.createIndex('neighborhood','neighborhood');
    });
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants() {
    return new Promise((resolve,reject) => {

      DBHelper.openDatabase().then(db => {
        let tx = db.transaction('restaurants');
        let store = tx.objectStore('restaurants');
        store.getAll().then(result => {
          if (result && result.length > 0) {
            resolve(result);
          } else {
            DBHelper.fetchFromWebAndSaveToDb().then(listFromWeb => {
              resolve(listFromWeb);
            }).catch(reject);
          }
        });
      }).catch(reject);
    });
  }

  static fetchFromWebAndSaveToDb() {
    return new Promise((resolve,reject) => {

      fetch(DBHelper.DATABASE_URL)
      .then(response => {
        response.json()
        .then(data => {
          DBHelper.openDatabase()
          .then(db => {
            var tx = db.transaction("restaurants", "readwrite");
            var store = tx.objectStore("restaurants");
            data.forEach(element => {
              store.put(element);
            });
          });
          return resolve(data);
        });
      });

    })

  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.openDatabase()
    .then(db => {
      let tx = db.transaction('restaurants');
      let store = tx.objectStore('restaurants');
      store.get(parseInt(id))
      .then(result => {
        callback(null,result);
      }).catch((e) => {
        callback(e,null)
      });
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    DBHelper.openDatabase().then(db => {
      let tx = db.transaction('restaurants');
      let store = tx.objectStore('restaurants').index('cuisine');
      return store.get(cuisine);
    }).then(result => {
      callback(null,result);
    }).catch((e) => {
      callback(e,null)
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.openDatabase().then(db => {
      let tx = db.transaction('restaurants');
      let store = tx.objectStore('restaurants').index('neighborhood');
      return store.get(neighborhood);
    }).then(result => {
      callback(null,result);
    }).catch((e) => {
      callback(e,null)
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants

    DBHelper.fetchRestaurants().then(results => {
      if (cuisine != 'all') { // filter by cuisine
        results = results.filter(r => r.cuisine_type == cuisine);
      }
      if (neighborhood != 'all') { // filter by neighborhood
        results = results.filter(r => r.neighborhood == neighborhood);
      }
      callback(null,results);
    }).catch((e) => {
      callback(e,null)
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    DBHelper.fetchRestaurants().then(result => {
      const neighborhoods = result.map((v, i) => result[i].neighborhood)
      callback(null,neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i));
    })
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants().then(result => {
      const cuisines = result.map((v, i) => result[i].cuisine_type)
      callback(null,cuisines.filter((v, i) => cuisines.indexOf(v) == i));
    })
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    var imageinfo = DBHelper.getImageDetails(restaurant);
    return (`/img/dist/${imageinfo.name}-original.${imageinfo.filetype}`);
  }

  static srcsetForRestaurant(restaurant) {
    var imageinfo = DBHelper.getImageDetails(restaurant);
    let src = '';
    src += `/img/dist/${imageinfo.name}-320px.${imageinfo.filetype} 320w, `;
    src += `/img/dist/${imageinfo.name}-640px.${imageinfo.filetype} 640w, `;
    src += `/img/dist/${imageinfo.name}-640px.${imageinfo.filetype} 2x`;
    return src;
  }

  static getImageDetails(restaurant) {
    var response = {
      name: '',
      filetype: ''
    };
    var details = [];
    if (restaurant.photograph) {
      details = restaurant.photograph.split('.') || [];
      response.filetype = "jpg";
      response.name = restaurant.photograph;
    } else {
      response.name = "logo";
      response.filetype = "png";
    }

    // We use details.length-2 to get rid of the trailing punctuation as well from the name
    return response;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
