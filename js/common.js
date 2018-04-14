if (navigator.serviceWorker) {
  navigator.serviceWorker.register("/sw.js").then(function(sw) {
  }).catch(function(err) {
    console.error("Failed to register serviceworker", err);
  })
}

onOnline = () => {
  console.log("Just went online");
  DBHelper.getOfflineReviews().then(reviews => {
    DBHelper.clearOfflineReviews().then(() => {
      console.log("Posting Reviews loop", reviews);
      reviews.forEach((review) => postReview(review.data));
    })
  });
}

onOffline = () => {
  console.log("Just went offline");
}

postReview = (pReview) => {
  console.log("Posting review");

  var headers = new Headers();
  // Tell the server we want JSON back
  headers.set('Accept', 'application/json');
  var data = new FormData();

  for (var k in pReview){
    if (pReview.hasOwnProperty(k)) {
      data.append(k,pReview[k]);
    }
  }

  var url = 'http://localhost:1337/reviews/';
  var fetchOptions = {
    method: 'POST',
    headers,
    body: data
  };

  var responsePromise = fetch(url, fetchOptions);
  responsePromise.then((response) => response.json())
  .then(review => {
    console.log("Reviews successfully posted", review);
    review.restaurant_id = parseInt(review.restaurant_id);
    review.rating = parseInt(review.rating);
    console.log("Post-Review submit", review);
    DBHelper.updateReviews(review.restaurant_id)
  }).catch(e => {
    console.error(e);
    console.log("Storing offline", pReview);
    DBHelper.storeOfflineReview(pReview);
  })
}

window.addEventListener('online',  onOnline);
window.addEventListener('offline', onOffline);
