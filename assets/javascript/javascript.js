/* ====================================
 * Some documentation
 * ====================================
 *
 * API documentation
 * ----------------------------------
 *  flight API search:
 *  https://developers.amadeus.com/self-service/category/air/api-doc/flight-low-fare-search/api-reference
 *
 * hotel API search:
 * https://developers.amadeus.com/self-service/category/hotel/api-doc/hotel-search/api-reference
 *
 * resource for flight and hotel search:
 * https://documenter.getpostman.com/view/2672636/RWEcPfuJ?version=latest#8196c48f-30f9-4e3b-8590-e22f96da8326
 * */

/* ====================================
 * Database setup
 * ==================================== */

/* ----------------------------------------------
 * Sorry, I don't have a clue how to hide this key & make it work on github at the same time
 * ---------------------------------------------- */
var config = {
  apiKey: "AIzaSyDju-ufXCy5nHMPUefNuZu6EjGC5kdLd9I",
  authDomain: "authentication-43ba6.firebaseapp.com",
  databaseURL: "https://authentication-43ba6.firebaseio.com",
  storageBucket: "authentication-43ba6.appspot.com"
};

firebase.initializeApp(config); //starting database (jtsai)
//a couple of database variables that will be referenced (jtsai)
const database = firebase.database();
const dbAuth = database.ref("/authentication");

// var key = {  };
// dbAuth.push(key);

/* ====================================
 * Non-database Global Variables
 * ==================================== */

var restaurantNum = 6,
  restaurantCount = 0;

/* You can also use these values as examples and for testing */

/* Test Full URLS */
var testFlightURL =
  "https://test.api.amadeus.com/v1/shopping/flight-offers?origin=MAD&destination=PAR&departureDate=2019-12-01&returnDate=2019-12-28 &max10";
var testHotelURL =
  "https://test.api.amadeus.com/v2/shopping/hotel-offers?cityCode=LON";
var testRestaurantURL =
  "https://api.yelp.com/v3/businesses/search?term=delis&latitude=37.786882&longitude=-122.399972";

/* Test values */
var testFlightValue =
  "origin=MAD&destination=PAR&departureDate=2019-12-01&returnDate=2019-12-28 &max10";
var testHotelValue = "cityCode=LON";
var testRestaurantValue = "term=delis&latitude=37.786882&longitude=-122.399972";

/* ====================================
 * Initialization of document
 * ==================================== */

/* ====================================
 * On Clicks
 * ==================================== */
$("nav a").on("click", function() {
  /* making sure no other classes have the class of active; */
  $("nav a").removeClass("active");
  $("section").removeClass("active");

  /* setting this anchor tag to active  */
  $(this).addClass("active");

  /* getting the id of the related section */
  let section = $(this).attr("href");

  /* making sure we got the right thing */
  console.log("Section:" + section);

  /*make the relative section active (to show content) */
  $(section).addClass("active");
});

$("section").on("mouseenter", "figure", function() {
  $(this).children(".addCircle").hide();
  $(this).children(".addCircleOutline").show();
});

$("section").on("mouseleave", "figure", function() {
  $(this).children(".addCircle").show();
  $(this).children(".addCircleOutline").hide();
});

// < !-- /////// Hotel start -->

$("#hotel button").on("click", function() {
  /* Preventing page refresh on form button click */
  event.preventDefault();

  $(".loading").addClass("active");

  /* Getting form inputs */
  var hotelLocation = $("#hotel-location")
    .val()
    .trim();
  var hotelNights = $("#hotel-nights")
    .val()
    .trim();

  var queryHotelLocation = "cityCode=" + hotelLocation.replace(" ", "-"); //"DAL";

  queryHotelLocation += "&numberOfNights=" + hotelNights;

  var queryValue = queryHotelLocation;
  console.log(`Search: ${queryValue}`);

  /* passing search into API */
  hotelAPI(queryValue);

  /* Resetting form */
  $("#hotel form").trigger("reset");
});

$("#hotel-results").on("click", ".material-icons", function() {
  var fig = $(this).parent();
  //$(this).parent().css("background-color", "blue");
  var name = fig.find(".name").text();
  var phone = fig.find(".phone").text();
  var address = [fig.find(".add1").text(), fig.find(".add2").text()];
  var price = fig.find(".price").text();

  // console.log(fig);
  // console.log(img);

  var selection = {
      type: "hotel",
      name: name,
      address: address,
      phone: phone,
      price: price
  };
  console.log(selection);
});

// < !-- /////// Hotel end -->

$("#restaurants button").on("click", function() {
  /* Preventing page refresh on form button click */
  event.preventDefault();

  $(".loading").addClass("active");

  /* Getting form inputs */
  var foodSearch = $("#food-search").val().trim();
  var foodLocation = $("#food-location").val().trim();
  //console.log(` search food: ${foodSearch}, search location ${foodLocation} `);

  /* Getting rid of all spaces */
  var queryFoodSearch = "term=" + foodSearch.replace(" ", "-");
  var queryFoodLocation = "location=" + foodLocation.replace(" ", "-");
  //console.log(` search food: ${queryFoodSearch}, search location ${queryFoodLocation} `);

  var queryValue = queryFoodSearch + "&" + queryFoodLocation;
  console.log(`Search: ${queryValue}`);

  /* passing search into API */
  restaurantAPI(queryValue);

  /* Resetting form */
  $("#restaurants form").trigger("reset");
});

$("#restaurant-results").on("click", ".material-icons", function() {
    var fig = $(this).parent();
    //$(this).parent().css("background-color", "blue");
    var img = fig.find("img").attr("style");
    var url = fig.find("a").attr("href");
    var name = fig.find(".name").text();
    var phone = fig.find(".phone").text();
    var address = [fig.find(".add1").text(), fig.find(".add2").text()];
    // console.log(fig);
    // console.log(img);
    var selection = {
        type: "restaurant",
        name: name,
        address: address,
        img: img,
        phone: phone,
        url: url
    };
    console.log(selection);
});

/* ====================================
 * Other functions
 * ==================================== */
function printRestaurant(business) {
  $(".loading").removeClass("active");
  /* Printing out all the content in the query */
  for (let i = 0; i < business.length; i++) {
    /* shortening some stuff */
    var picture = "url(" + business[i].image_url + ")";
    var address = business[i].location.display_address;
    /* Creating a figure html element */
    var figure = $("<figure>").append(
      /* Creating an image in a link tag */
      $("<a class='img' rel='noopener noreferrer'>")
        .attr("href", business[i].url)
        .append($("<img>").css("background-image", picture)),
      /* Adding a caption with restaurant info */
      $("<figcaption>").append(
        $("<p class='restaurant-name'>").append(
          $("<a rel='noopener noreferrer'>")
            .attr("href", business[i].url)
            .text(business[i].name)
        ),
        $("<p>").html(
          "<em>" + address[0] + "<br />" + address[address.length - 1] + "</em>"
        ),
        $("<p>").html("<strong>Phone:</strong> " + business[i].display_phone)
      )
    );

    /* attaching it all to the results page */
    $("#restaurant-results").prepend($("<div class='result'>").append(figure));
  }
}

// < !-- /////// Hotel start -->

function printHotel(hotel) {
  $(".loading").removeClass("active");
  var hotel = hotel.data;

  /* Printing out all the content in the query */
  for (let i = 0; i < hotel.length; i++) {
    /* shortening some stuff */

    // console.log(hotel[i].hotel.media);

    var address = hotel[i].hotel.address.lines[0];

    var hotelName = hotel[i].hotel.name;

    var hotelAddress = hotel[i].hotel.address.cityName;

    var hotelPhone = hotel[i].hotel.contact.phone;

    var hotelPrice = hotel[i].offers[0].price.total;

    var figure = $("<figure>").append(
      $("<i>").addClass("material-icons addCircle").text("add_circle"),
      $("<i>").addClass("material-icons addCircleOutline").text("add_circle_outline"),
      //Caption
      $("<figcaption>").append(
        //Name
        $("<p class='name'>").text(hotelName),
        //Address
        $("<p>").append(
          $("<em class='add1'>").text(address),
          $("<em class='add2'>").text(hotelAddress)
        ),
        //Phone
        $("<p>").append(
          $("<strong>").text("Phone: "),
          $("<span class='phone'>").text(hotelPhone)
        ),
        //Price
        $("<p>").append(
          $("<strong>").text("Price: "),
          $("<span class='price'>").text(hotelPrice)
        )
      )
    );

    $("#hotel-results").prepend($("<div class='result'>").append(figure));
  }
}

// < !-- /////// Hotel end -->

/* ====================================
 * Ajax queries
 * ==================================== */
/* You guys will have to create the search queries in your function and pass it here */
function flightAPI(queryValues) {
  /* base url for the API */
  var queryBaseURL = "https://test.api.amadeus.com/";

  /*the final URL that has the query terms added to the end */
  var queryURL = queryBaseURL + "v1/shopping/flight-offers?" + queryValues;

  /* ----------------------------------------------
   * So I'm using an API that requires an authentication token and it really doesn't want you to commit your key and stuff anywhere
   *
   * referencing firebase in order to get keys from there (jtsai)
   * This is crap security, but still better than nothing. (jtsai)
   * ---------------------------------------------- */
  dbAuth.once("value", function(snapshot) {
    var cid, csec; //creating variables for keys
    cid = snapshot.child("amadeusKey").val();
    csec = snapshot.child("amadeusSecret").val();
    //console.log(`cId: ${cid} cSec: ${csec}`);

    /* using the keys from firebase to get a token (this token expires so I figured it'd be safer to make sure it's called whenever you need this flightAPI query) (jtsai) */
    var auth = {
      url: queryBaseURL + "v1/security/oauth2/token",
      method: "POST",
      timeout: 0,
      data: {
        client_id: cid,
        client_secret: csec,
        grant_type: "client_credentials"
      }
    };

    $.ajax(auth).done(function(response) {
      token = response;
      //console.log(token);
      //console.log("Access token:" + token.access_token);
      var tokenBearer = "Bearer " + token.access_token;
      //console.log(tokenBearer);

      /* once authentication is done:
       * Finally starting the actual ajax query for flight data(jtsai)
       * ---------------------------------------------- */
      var settings = {
        async: true,
        crossDomain: true,
        url: queryURL,
        method: "GET",
        headers: {
          Accept: "application/vnd.amadeus+json",
          Authorization: tokenBearer
        }
      };

      $.ajax(settings).then(function(response) {
        var queryResult = response;
        // console.log("AJAX YOU BETTER WORK!");
        // console.log(queryResult);

        /** ----------------------------------------------
         *  variables for stuff you want to get from the API query go here
         *
         *  Example for getting data you want
         *      var flightName = queryResult.name;
         *
         *  Example for printing out data multiple times
         *      for(let i=0; i < queryResult.data[i]) {
         *
         *      //Getting the data we wanted
         *          //(getting the source url of the image from the queryResults Object)
         *          imgSrc = queryResult.data[i].url;
         *          flightDescription = queryResult.data[i].description //(getting the description data from the queryResults Object)
         *          <more data and variables here>
         *
         *          //Printing the data we wanted here
         *          $('img').attr('src') = imgSrc; //setting the image source url for an image in the html
         *          $('p').text(flightDescription); //making a paragraph with flightDescription content as its text
         *      }
         * ---------------------------------------------- */
      });
    });
  });
}

/* You guys will have to create the search queries in your function and pass it here */

// < !-- /////// Hotel start -->

function hotelAPI(queryValues) {
  /* base url for the API */
  var queryBaseURL = "https://test.api.amadeus.com/";
  /* the final URL that has the query terms added to the end */
  //?cityName=dallas
  var queryURL =
    "https://test.api.amadeus.com/v2/shopping/hotel-offers?" + queryValues;
  //https://test.api.amadeus.com/v2/shopping/hotel-offers/by-hotel?
  /* referencing firebase in order to get keys from there (jtsai) */
  dbAuth.once("value", function(snapshot) {
    var cid, csec; /* creating variables for keys */
    cid = snapshot.child("amadeusKey").val();
    csec = snapshot.child("amadeusSecret").val();
    //console.log(`cId: ${cid} cSec: ${csec}`);

    //using the keys from firebase to get a token (this token expires so I figured it'd be safer to make sure it's called whenever you need this hotelAPI query) (jtsai)
    var auth = {
      url: queryBaseURL + "v1/security/oauth2/token",
      method: "POST",
      timeout: 0,
      data: {
        client_id: cid,
        client_secret: csec,
        grant_type: "client_credentials"
      }
    };

    $.ajax(auth).done(function(response) {
      token = response;
      //console.log(token);
      //console.log("Access token:" + token.access_token);
      var tokenBearer = "Bearer " + token.access_token;
      //console.log(tokenBearer);

      /* ----------------------------------------------
       * once authentication is done:
       * Finally starting the actual ajax query for hotel data(jtsai)
       * ---------------------------------------------- */
      var settings = {
        async: true,
        crossDomain: true,
        url: queryURL,
        method: "GET",
        headers: {
          Accept: "application/vnd.amadeus+json",
          Authorization: tokenBearer
        }
      };

      $.ajax(settings).then(function(response) {
        var queryResult = response;
        // console.log("AJAX YOU BETTER WORK!");
        console.log(queryResult);

        printHotel(queryResult);

        /** ----------------------------------------------
         *  variables for stuff you want to get from the API query go here
         *
         *  Example for getting data you want
         *      var hotelName = queryResult.name;
         *
         *  Example for printing out data multiple times
         *      for(let i=0; i < queryResult.data[i]) {
         *
         *      //Getting the data we wanted
         *          //(getting the source url of the image from the queryResults Object)
         *          imgSrc = queryResult.data[i].url;
         *          hotelDescription = queryResult.data[i].description //(getting the description data from the queryResults Object)
         *          <more data and variables here>
         *
         *          //Printing the data we wanted here
         *          $('img').attr('src') = imgSrc; //setting the image source url for an image in the html
         *          $('p').text(hotelDescription); //making a paragraph with hotelDescription content as its text
         *      }
         * ---------------------------------------------- */
      });
    });
  });
}

// < !-- /////// Hotel end -->

function restaurantAPI(queryValues) {
  /* base url for the API */
  var queryBaseURL = "https://api.yelp.com/v3/"; 

  //final yelp query
  var queryURL = 
      "https://cors-anywhere.herokuapp.com/" + 
      queryBaseURL + "businesses/search?" +  queryValues + 
      "&limit=" + restaurantNum + 
      "&offset=" + restaurantCount;

  //referencing firebase in order to get keys from there (jtsai)
  dbAuth.once("value", function(snapshot) {
      var cid; //creating variables for keys
      cid = snapshot.child('yelpKey').val();
      //console.log(`cId: ${cid} cSec: ${csec}`);

      var tokenBearer = "Bearer " + cid; 

      //using the keys from firebase to get a token (jtsai)

      var settings = {
          "async": true,
          "crossDomain": true,
          "url": queryURL,
          "method": "GET",
          "headers": {
              "Accept": "*/*",
              "Access-Control-Allow-Origin" : "*",
              "Authorization": tokenBearer
          }
      }

      $.ajax(settings).then( function(response) {
          var queryResult = response;
          //console.log(response);
          var business = queryResult.businesses;
          console.log(business);
          printRestaurant(business);

          restaurantCount++;
      });
  })
}

function printRestaurant(business) {
    $(".loading").removeClass("active");
    for( let i = 0; i < business.length; i++ ) {
        var picture = "url(" + business[i].image_url + ")";
        var address = business[i].location.display_address;

        var figure = 
        $("<figure>").append(
            $("<i>").addClass("material-icons addCircle").text("add_circle"),
            $("<i>").addClass("material-icons addCircleOutline").text("add_circle_outline"),
            $("<a class='img' rel='noopener noreferrer'>")
                .attr("href", business[i].url)
                .append(
                    $("<img>").css("background-image", picture)
                ),
            $("<figcaption>").append(
                $("<p class='name'>").append(
                    $("<a rel='noopener noreferrer'>")
                        .attr("href", business[i].url)
                        .text(business[i].name)
                ),
                $("<p>").append(
                    $("<em class='add1'>").text(address[0]),
                    $("<em class='add2'>").text(address[address.length-1])
                ),
                $("<p>").append(
                    $("<strong>").text("Phone: "),
                    $("<span class='phone'>").text(business[i].display_phone)
                )
            )
        );

        $("#restaurant-results").prepend(
            $("<div class='result'>").append(figure)
        )
    }
}

// calendar
