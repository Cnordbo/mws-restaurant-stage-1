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
  static imageUrlForFile(filename,ext) {
    return (`/img/dist/${filename}-original.${ext}`);
  }

  static srcsetForRestaurant(filename,ext) {
    let src = '';
    src += `/img/dist/${filename}-320px.${ext} 320w, `;
    src += `/img/dist/${filename}-640px.${ext} 640w, `;
    src += `/img/dist/${filename}-640px.${ext} 2x`;
    return src;
  }

  static getSourcesForRestaurant(restaurant) {
    let filename = restaurant.photograph || 'logo';
    let ext = 'jpg';
    if (filename === 'logo') {
      ext = 'png';
    }
    let jpeg = document.createElement('SOURCE');
    jpeg.setAttribute('data-srcset',DBHelper.srcsetForRestaurant(filename,ext));
    jpeg.setAttribute('data-src',DBHelper.imageUrlForFile(filename,ext));

    let webp = document.createElement('SOURCE');
    webp.setAttribute('data-srcset',DBHelper.srcsetForRestaurant(filename,'webp'));
    webp.setAttribute('data-src',DBHelper.imageUrlForFile(filename,'webp'));
    webp.setAttribute('type','image/webp');

    let fallback = document.createElement('img');
    fallback.setAttribute('data-srcset',DBHelper.srcsetForRestaurant(filename,ext));
    fallback.setAttribute('data-src', DBHelper.imageUrlForFile(filename,ext));

    return [webp,jpeg,fallback];
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
