let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  if (self.restaurant) {
    return loadMap();
  }
  setTimeout(initMap,50);
}

window.loadMap = () => {
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 16,
    center: self.restaurant.latlng,
    scrollwheel: false
  });
  DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = () => {
  return new Promise((resolve, reject) => {

    if (self.restaurant) { // restaurant already fetched!
      return resolve(self.restaurant)
    }
    const id = getParameterByName('id');
    if (!id) { // no id found in URL
      error = 'No restaurant id in URL'
      return reject(error);
    } else {
      DBHelper.fetchRestaurantById(id, (error, restaurant) => {
        self.restaurant = restaurant;
        if (!restaurant) {
          console.error(error);
          return reject(error);
        }
        console.log('Fetching reviews');
        DBHelper.getReviews(self.restaurant.id)
        .then((reviews) => {
          console.log('Reviews: ', reviews);
          self.restaurant.reviews = reviews;
          return resolve(self.restaurant);
        }).catch(e => {
          console.error('Could not fetch reviews',e);
          return reject(e);
        })
      });
    }
  });
}

submitReviewForm = () => {

  var review = {};
  var formEl = document.getElementById('add-review-form');
  for (var i = 0; i < formEl.length; ++i) {
    var fieldName = formEl[i].name;
    var value = formEl[i].value;
    if (fieldName === "" || value === "") continue;
    if (fieldName === "restaurant_id" || fieldName === "rating") {
      value = parseInt(value);
    }
    review[formEl[i].name] = value;
  }
  formEl.reset();

  // 2. Make the request
  // ================================
  postReview(review);
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.setAttribute('alt', 'Picture of ' + restaurant.name);
  DBHelper.getSourcesForRestaurant(restaurant).map(el => {
    el.setAttribute('srcset',el.getAttribute('data-srcset'));
    el.setAttribute('src',el.getAttribute('data-src'));
    el.setAttribute('alt', 'Picture of ' + restaurant.name + 'restaurant');

    image.append(el);
  });

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
  mapObserver.observe(document.getElementById('map-container'));
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');

  if (!reviews || !reviews.length) {
    const noReviews = document.createElement('p');
    noReviews.setAttribute('tabindex','0');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  ul.innerHTML = '';
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const section = document.createElement("section");
  const name = document.createElement('span');
  name.innerHTML = review.name;
  name.classList.add("reviewer-name");
  name.setAttribute('tabindex','0');
  section.appendChild(name);

  const date = document.createElement('span');
  date.innerHTML = new Date(review.updatedAt).toLocaleDateString();
  date.classList.add("date");
  date.setAttribute('tabindex','0');
  section.appendChild(date);
  li.appendChild(section);

  const rating = document.createElement('span');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.classList.add("rating");
  rating.setAttribute('tabindex','0');
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.setAttribute('tabindex','0');
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.setAttribute('aria-current','page');
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

toggleFavorite = (isFavorite) => {
  self.restaurant.is_favorite = isFavorite;
  const url = "http://localhost:1337/restaurants/" + self.restaurant.id + "/?is_favorite=" + isFavorite;

  var headers = new Headers();
  headers.set('Accept', 'application/json');
  var fetchOptions = {
    method: 'PUT',
    headers
  };
  fetch(url, fetchOptions)
  .then(DBHelper.updateRestaurants);
}

(()=> {
  fetchRestaurantFromURL()
  .then((restaurant) => {
    DBHelper.getReviews(restaurant.id);
    document.getElementById("restaurant_id").value = restaurant.id;
    fillBreadcrumb();
    var form = document.getElementById('add-review-form');
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      submitReviewForm();
    })

    var favorite = document.getElementById('chkFavorite');
    if (restaurant.is_favorite) {
      favorite.checked = true;
    }

    favorite.addEventListener('change',e => {
      toggleFavorite(e.target.checked);
    });

    document.addEventListener("reviews_updated", e => {
      console.log("Got reviews updated event",e);
      console.log("current restaurant",self.restaurant);
      if (e.detail.restaurant_id === self.restaurant.id) {
        console.log("Updating review list");
        DBHelper.getReviews(self.restaurant.id).then(reviews => {
          self.restaurant.reviews = reviews;
          fillReviewsHTML(reviews);
        })
      }
    });
  })
  .then(fillRestaurantHTML)
  .catch((error) => {
    console.error('Init Error: ', error);
  });
})();
