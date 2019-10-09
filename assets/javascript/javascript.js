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
  "https://test.api.amadeus.com/v1/shopping/flight-offers?origin=MAD&destination=PAR&departureDate=2019-12-01&returnDate=2019-12-28&max10";
var testHotelURL =
  "https://test.api.amadeus.com/v2/shopping/hotel-offers?cityCode=LON";
var testRestaurantURL =
  "https://api.yelp.com/v3/businesses/search?term=delis&latitude=37.786882&longitude=-122.399972";

/* Test values */
var testFlightValue =
  "origin=MAD&destination=PAR&departureDate=2019-12-01&returnDate=2019-12-28&max10";
var testHotelValue = "cityCode=LON";
var testRestaurantValue = "term=delis&latitude=37.786882&longitude=-122.399972";

/* ====================================
 * Initialization of document
 * ==================================== */
$("#flight-dates").daterangepicker();

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

  if(section === "#summary") {
    var sum = 0;
    $('#summary .result span.price').each(function(){
        sum += parseFloat($(this).text());  // Or this.innerHTML, this.innerText
        console.log($(this).text());
    });
    $("#total").text(sum);
  }

  /*make the relative section active (to show content) */
  $(section).addClass("active");
});

$("section").on("mouseenter", ".result", function() {
  $(this).children(".addCircle").hide();
  $(this).children(".addCircleOutline").show();
});

$("section").on("mouseleave", ".result", function() {
  $(this).children(".addCircle").show();
  $(this).children(".addCircleOutline").hide();
});



$("#flight button").on("click", function() {
  event.preventDefault();
  $(".loading").addClass("active");

  var flightOrigin = $("#flight-origin").val().trim();
  var flightDestination = $("#flight-destination").val().trim();

  /* Getting dates */
  var startFlight = $("#flight-dates").data('daterangepicker').startDate.format('YYYY-MM-DD');

  var endFlight = $("#flight-dates").data('daterangepicker').endDate.format('YYYY-MM-DD');

  console.log(`Loc From: ${flightOrigin}, To: ${flightDestination}`);
  console.log(`Dates From: ${startFlight}, To: ${endFlight}`);

  var queryValue = 
    "origin=" + flightOrigin + 
    "&destination=" + flightDestination +
    "&departureDate=" + startFlight +
    "&returnDate=" + endFlight;

    /* Clearing previous results */
    $("#restaurant-results").find(".result").remove();

    //flightAPI(queryValue);
    printFlight(flightExample); //workaround for server migration
});

$("#flight-results").on("click", ".material-icons", function() {
  var result = $(this).parent();
  console.log(result);

  $("#flight-results .result").addClass("dim");
  result.removeClass("dim");


  $("#flight-choice").empty();
  $("#flight-choice").append(result.clone());
  $("#flight-choice .result").prepend(
    $("<p class='title'>").text("flight")
  );
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

  //clearing results
  $("#hotel-results").find(".result").remove();

  /* passing search into API */
  hotelAPI(queryValue);

  /* Resetting form */
  $("#hotel form").trigger("reset");
});

$("#hotel-results").on("click", ".material-icons", function() {
  var result = $(this).parent();
  console.log(result);

  $("#hotel-results .result").addClass("dim");
  result.removeClass("dim");


  $("#hotel-choice").empty();
  $("#hotel-choice").append(result.clone());
  $("#hotel-choice .result").prepend(
    $("<p class='title'>").text("hotel")
  );
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

  /* Clearing previous results */
  $("#restaurant-results").find(".result").remove();

  /* passing search into API */
  restaurantAPI(queryValue);

  /* Resetting form */
  $("#restaurants form").trigger("reset");
});

$("#restaurant-results").on("click", ".material-icons", function() {
  var result = $(this).parent();
  console.log(result);

  $("#restaurant-results .result").addClass("dim");
  result.removeClass("dim");


  $("#restaurant-choice").empty();
  $("#restaurant-choice").append(result.clone());
  $("#restaurant-choice .result").prepend(
    $("<p class='title'>").text("restaurant")
  );
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
    $("#restaurant-results").prepend($(`<div id='restaurant-${i}'class='result'>`).append(figure));
  }
}

// < !-- /////// Hotel start -->

function printHotel(hotel) {
  $(".loading").removeClass("active");

  var hotel = hotel.data;

  if(hotel.length === 0 ) {
    var textSorry = "Sorry, it seems like we cannot find any availabilities in this area";
    var result = 
      $("<div class='result'>").append(
        $("<figure>").append(
          $("<figcaption>").text(textSorry)));
    $("#hotel-results").append(result);
  } else {
    /* Printing out all the content in the query */
    for (let i = 0; i < hotel.length; i++) {
      /* shortening some stuff */

      // console.log(hotel[i].hotel.media);

      var address = hotel[i].hotel.address.lines[0];

      var hotelName = hotel[i].hotel.name;

      var hotelAddress = hotel[i].hotel.address.cityName;

      var hotelPhone = ("contact" in hotel[i].hotel) ? hotel[i].hotel.contact.phone : "N/A";

      var hotelPrice = hotel[i].offers[0].price.total;

      var figure = $("<figure>").append(
        //Caption
        $("<figcaption>").append(
          //Name
          $("<p class='name'>").text(hotelName),
          //Address
          $("<p>").append(
            $("<em class='add1'>").text(address + " "),
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

      $("#hotel-results").prepend(
        $(`<div id='hotel-${i}' class='result'>`).append(
          $("<i>").addClass("material-icons addCircle").text("add_circle"),
          $("<i>").addClass("material-icons addCircleOutline").text("add_circle_outline"),
          figure
        )
      );
    }
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
        var queryResult = response.data;
        // console.log("AJAX YOU BETTER WORK!");
        // console.log(queryResult);

        printFlight(queryResult);
      });
    });
  });
}

function printFlight(flight) {
  $(".loading").removeClass("active");

  console.log(flight.data);

  for( let i = 0; i < flight.data.length; i++ ) {
    var price = flight.data[i].offerItems[0].price.total;
    var offer = flight.data[i].offerItems[0].services[0].segments;
    var offerOne = offer[0].flightSegment;

    if(offer.length > 1 ) {
      var offerTwo = offer[1].flightSegment;

      var flightTwo =
      $("<div class='flight flight-from'>").append(
        $("<p>").append(
          $("<strong>").text("Flight Number: "),
          $("<span class='airline'>").text(offerTwo.carrierCode + " "),
          $("<span class='number'>").text(offerTwo.number)
        ),
        $("<p class='departure'>").append(
          $("<strong>").text("Departs from: "),
          $("<span class='location'>").append(
            $("<span class='airport'>").text(offerTwo.departure.iataCode),
            $("<span class='terminal'>").text(` Terminal ${offerTwo.departure.terminal}`)
          ),
          $("<em>").text(" " + offerTwo.departure.at.replace("T", " ").replace(":00+", ":00 +").replace(":00-", ":00 -"))
        ),
        $("<p class='arrival'>").append(
          $("<strong>").text("Arrives at: "),
          $("<span class='location'>").append(
            $("<span class='airport'>").text(offerTwo.arrival.iataCode),
            $("<span class='terminal'>").text(` Terminal ${offerTwo.arrival.terminal}`)
          ),
          $("<em>").text(" " + offerTwo.arrival.at.replace("T", " ").replace(":00+", ":00 +").replace(":00-", ":00 -"))
        )
      );
    } else {
      flightTwo = "";
    }
    
    var flightOne =
      $("<div class='flight flight-one'>").append(
        $("<p>").append(
          $("<strong>").text("Flight Number: "),
          $("<span class='airline'>").text(offerOne.carrierCode + " "),
          $("<span class='number'>").text(offerOne.number)
        ),
        $("<p class='departure'>").append(
          $("<strong>").text("Departs from: "),
          $("<span class='location'>").append(
            $("<span class='airport'>").text(offerOne.departure.iataCode),
            $("<span class='terminal'>").text(` Terminal ${offerOne.departure.terminal}`)
          ),
          $("<em>").text(" " + offerOne.departure.at.replace("T", " ").replace(":00+", ":00 +").replace(":00-", ":00 -"))
        ),
        $("<p class='arrival'>").append(
          $("<strong>").text("Arrives at: "),
          $("<span class='location'>").append(
            $("<span class='airport'>").text(offerOne.arrival.iataCode),
            $("<span class='terminal'>").text(` Terminal ${offerOne.arrival.terminal}`)
          ),
          $("<em>").text(" " + offerOne.arrival.at.replace("T", " ").replace(":00+", ":00 +").replace(":00-", ":00 -"))
        )
      );

    $("#flight-results").append(
      $(`<div id='flight-${i}' class='result'>`).append(
        $("<i>").addClass("material-icons addCircle").text("add_circle"),
        $("<i>").addClass("material-icons addCircleOutline").text("add_circle_outline"),
        $("<p>").append(
          $("<strong>").text("Price: "),
          $("<span class='price'>").text(price),
          $("<span class='currency'>").text(" " + flight.meta.currency)
        ),
        flightOne, flightTwo
      )
    )
  }

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
          $("<em class='add1'>").text(address[0] + " "),
          $("<em class='add2'>").text(address[address.length-1])
        ),
        $("<p>").append(
          $("<strong>").text("Phone: "),
          $("<span class='phone'>").text(business[i].display_phone)
        )
      )
    );

    $("#restaurant-results").prepend(
        $("<div class='result'>").append(
          $("<i>").addClass("material-icons addCircle").text("add_circle"),
          $("<i>").addClass("material-icons addCircleOutline").text("add_circle_outline"),
          figure
        )
    )
  }
}

// calendar
var flightExample = {
  meta: {
    links: {
      self:
        "http://test.api.amadeus.com/v1/shopping/flight-offers?origin=NYC&destination=MAD&departureDate=2019-08-01&adults=1&nonStop=false&max=2"
    },
    currency: "EUR",
    defaults: {
      nonStop: false,
      adults: 1
    }
  },
  data: [
    {
      type: "flight-offer",
      id: "1539956390004--540268760",
      offerItems: [
        {
          services: [
            {
              segments: [
                {
                  flightSegment: {
                    departure: {
                      iataCode: "EWR",
                      terminal: "B",
                      at: "2019-08-01T17:45:00-04:00"
                    },
                    arrival: {
                      iataCode: "LIS",
                      terminal: "1",
                      at: "2019-08-02T05:35:00+01:00"
                    },
                    carrierCode: "TP",
                    number: "202",
                    aircraft: {
                      code: "332"
                    },
                    operating: {
                      carrierCode: "TP",
                      number: "202"
                    },
                    duration: "0DT6H50M"
                  },
                  pricingDetailPerAdult: {
                    travelClass: "ECONOMY",
                    fareClass: "U",
                    availability: 1,
                    fareBasis: "UUSDSI0E"
                  }
                },
                {
                  flightSegment: {
                    departure: {
                      iataCode: "LIS",
                      terminal: "1",
                      at: "2019-08-02T06:55:00+01:00"
                    },
                    arrival: {
                      iataCode: "MAD",
                      terminal: "2",
                      at: "2019-08-02T09:10:00+02:00"
                    },
                    carrierCode: "TP",
                    number: "1026",
                    aircraft: {
                      code: "319"
                    },
                    operating: {
                      carrierCode: "TP",
                      number: "1026"
                    },
                    duration: "0DT1H15M"
                  },
                  pricingDetailPerAdult: {
                    travelClass: "ECONOMY",
                    fareClass: "U",
                    availability: 5,
                    fareBasis: "UUSDSI0E"
                  }
                }
              ]
            }
          ],
          price: {
            total: "259.91",
            totalTaxes: "185.91"
          },
          pricePerAdult: {
            total: "259.91",
            totalTaxes: "185.91"
          }
        }
      ]
    },
    {
      type: "flight-offer",
      id: "1539956390004-765796655",
      offerItems: [
        {
          services: [
            {
              segments: [
                {
                  flightSegment: {
                    departure: {
                      iataCode: "JFK",
                      at: "2019-08-01T22:05:00-04:00",
                      terminal: "4"
                    },
                    arrival: {
                      iataCode: "MAD",
                      at: "2019-08-02T11:30:00+02:00",
                      terminal: "1"
                    },
                    carrierCode: "UX",
                    number: "92",
                    aircraft: {
                      code: "332"
                    },
                    operating: {
                      carrierCode: "UX",
                      number: "92"
                    },
                    duration: "0DT7H25M"
                  },
                  pricingDetailPerAdult: {
                    travelClass: "ECONOMY",
                    fareClass: "M",
                    availability: 9,
                    fareBasis: "MYYOAE"
                  }
                }
              ]
            }
          ],
          price: {
            total: "1670.89",
            totalTaxes: "162.89"
          },
          pricePerAdult: {
            total: "1670.89",
            totalTaxes: "162.89"
          }
        }
      ]
    }
  ],
  dictionaries: {
    locations: {
      JFK: {
        subType: "AIRPORT",
        detailedName: "JOHN F KENNEDY INTL"
      },
      EWR: {
        subType: "AIRPORT",
        detailedName: "NEWARK LIBERTY INTL"
      },
      MAD: {
        subType: "AIRPORT",
        detailedName: "ADOLFO SUAREZ BARAJAS"
      },
      LIS: {
        subType: "AIRPORT",
        detailedName: "AIRPORT"
      }
    },
    carriers: {
      UX: "AIR EUROPA",
      TP: "TAP PORTUGAL"
    },
    currencies: {
      EUR: "EURO"
    },
    aircraft: {
      "319": "AIRBUS INDUSTRIE A319",
      "332": "AIRBUS INDUSTRIE A330-200"
    }
  }
};