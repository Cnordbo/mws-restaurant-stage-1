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
    return `http://localhost:${port}`;
  }

  static openDatabase() {
    return idb.open("MWS", 3, function(upgradeDb) {
      switch(upgradeDb.oldVersion) {
        case 0:
        case 1:
          var restaurants = upgradeDb.createObjectStore('restaurants', {
            keyPath: 'id'
          });
          restaurants.createIndex('cuisine','cuisine_type');
          restaurants.createIndex('neighborhood','neighborhood');
        case 2:
          console.log("Upgrading to DB v2.0");
          var reviews = upgradeDb.createObjectStore('reviews', {
            keyPath: 'id'
          });
          reviews.createIndex('restaurant','restaurant_id');
        case 3:
          console.log("Upgrading to DB v3.0");
          var offline_reviews = upgradeDb.createObjectStore('offline_reviews', {keyPath: 'id'});
      }
    });
  }

  /**
   * Fetch all restaurants.
   */
  static getRestaurants() {
    return new Promise((resolve,reject) => {

      DBHelper.openDatabase().then(db => {
        let tx = db.transaction('restaurants');
        let store = tx.objectStore('restaurants');
        store.getAll().then(restaurants => {
          if (restaurants && restaurants.length > 0) {
            resolve(restaurants);
          } else {
            DBHelper.updateRestaurants().then(listFromWeb => {
              resolve(listFromWeb);
            }).catch(reject);
          }
        });
      }).catch(reject);
    });
  }

  /**
   * Fetch all reviews.
   */
  static getReviews(restaurantId) {
    return new Promise((resolve,reject) => {

      DBHelper.openDatabase().then(db => {
        let tx = db.transaction('reviews');
        let store = tx.objectStore('reviews').index('restaurant');
        store.getAll(restaurantId).then(result => {
          if (result && result.length > 0) {
            resolve(result);
          } else {
            DBHelper.updateReviews(restaurantId).then(listFromWeb => {
              resolve(listFromWeb);
            }).catch(reject);
          }
        });
      }).catch(reject);
    });
  }

  static updateReviews(restaurantId) {
    return new Promise((resolve,reject) => {

      fetch(DBHelper.DATABASE_URL + '/reviews?restaurant_id=' + restaurantId)
      .then(response => {
        response.json()
        .then(data => {
          DBHelper.openDatabase()
          .then(db => {
            var tx = db.transaction("reviews", "readwrite");
            var store = tx.objectStore("reviews");
            data.forEach(element => {
              element.restaurant_id = parseInt(element.restaurant_id);
              element.rating = parseInt(element.rating);
              store.put(element);
            });
          });
          var event = new CustomEvent("reviews_updated", {detail: {restaurant_id: restaurantId}});
          document.dispatchEvent(event);
          return resolve(data);
        });
      });

    })
  }

  static storeOfflineReview(review) {
    DBHelper.openDatabase().then(db => {
      var tx = db.transaction("offline_reviews","readwrite");
      var store = tx.objectStore("offline_reviews");
      store.add({id: Date.now(), data: review});
    })
  }

  static getOfflineReviews() {
    console.log("Getting offline reviews");
    return new Promise((resolve,reject) => {
      DBHelper.openDatabase().then(db => {
        var tx = db.transaction("offline_reviews");
        var store = tx.objectStore("offline_reviews");
        store.getAll().then(data => {
          return resolve(data);
        }).catch(e => {
          reject(e);
        });
      })
    })
  }

  static clearOfflineReviews() {
    console.log("Clearing offline reviews");
    return new Promise((resolve, reject) => {
      DBHelper.openDatabase().then(db => {
        var tx = db.transaction("offline_reviews", "readwrite");
        tx.objectStore("offline_reviews").clear();
        return resolve();
      }).catch(reject);
    });
  }

  static updateRestaurants() {
    return new Promise((resolve,reject) => {

      fetch(DBHelper.DATABASE_URL + '/restaurants')
      .then(response => {
        response.json()
        .then(restaurants => {
          DBHelper.openDatabase()
          .then(db => {
            var tx = db.transaction("restaurants", "readwrite");
            var store = tx.objectStore("restaurants");
            restaurants.forEach(element => {
              element.is_favorite = element.is_favorite ? (element.is_favorite.toString() == "true" ? true : false) : false;
              store.put(element);
            });
          });
          DBHelper.updateReviews();
          return resolve(restaurants);
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

  static fetchReviewsForRestaurantId(id) {
    return new Promise((resolve, reject) => {
      DBHelper.openDatabase()
      .then(db => {
        let tx = db.transaction('reviews');
        let store = tx.objectStore('reviews').index('restaurant');
        return store.getAll(parseInt(id))
      .then(resolve)
      .catch((e) => {
        console.error('Could not get reviews for Restaurant', e);
        resolve([]);
      });
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

    DBHelper.getRestaurants().then(results => {
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
    DBHelper.getRestaurants().then(result => {
      const neighborhoods = result.map((v, i) => result[i].neighborhood)
      callback(null,neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i));
    })
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.getRestaurants().then(result => {
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
    return (`/img/${filename}-original.${ext}`);
  }

  static srcsetForRestaurant(filename,ext) {
    let src = '';
    src += `/img/${filename}-320px.${ext} 320w, `;
    src += `/img/${filename}-640px.${ext} 640w, `;
    src += `/img/${filename}-640px.${ext} 2x`;
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

    let webp = document.createElement('SOURCE');
    webp.setAttribute('data-srcset',DBHelper.srcsetForRestaurant(filename,'webp'));
    webp.setAttribute('type','image/webp');

    let fallback = document.createElement('img');
    fallback.setAttribute('data-srcset',DBHelper.srcsetForRestaurant(filename,ext));

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
