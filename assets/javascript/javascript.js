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
//Sorry, I don't have a clue how to hide this key & make it work on github at the same time
var config = {
    apiKey: "AIzaSyDju-ufXCy5nHMPUefNuZu6EjGC5kdLd9I",
    authDomain: "authentication-43ba6.firebaseapp.com",
    databaseURL: "https://authentication-43ba6.firebaseio.com",
    storageBucket: "authentication-43ba6.appspot.com"
};

firebase.initializeApp(config); //starting database (jtsai)
//a couple of database variables that will be referenced (jtsai)
const database = firebase.database();
const dbAuth = database.ref('/authentication');

/* ====================================
 * Ajax queries
 * ==================================== */

function flightAPI(queryValues) {
    //base url for the API
    var queryBaseURL = "https://test.api.amadeus.com/v1/"; 

    var queryURL = 
        queryBaseURL + "shopping/flight-offers?" + queryValues;

    //So I'm using an API that requires an authentication token and it really doesn't want you to commit your key and stuff anywhere
    
    //referencing firebase in order to get keys from there (jtsai)
    //This is crap security, but still better than nothing. (jtsai)
    dbAuth.once("value", function(snapshot) {
        var cid, csec;  //creating variables for keys
        cid = snapshot.child('amadeusKey').val();
        csec = snapshot.child('amadeusSecret').val();
        //console.log(`cId: ${cid} cSec: ${csec}`);

        //using the keys from firebase to get a token (this token expires so I figured it'd be safer to make sure it's called whenever you need this flightAPI query) (jtsai)
        var auth = {
            "url": queryBaseURL + "security/oauth2/token",
            "method": "POST",
            "timeout": 0,
            "data": {
                "client_id": cid,
                "client_secret": csec,
                "grant_type": "client_credentials"
            }
        };

        $.ajax(auth).done(function (response) {
            token = response;
            console.log(token);
            console.log(token.access_token);

            //once authentication is done:
            // Finally starting the actual ajax query for flight data(jtsai)
            $.ajax({
                beforeSend: function (xhr) { 
                    console.log("Is this doing stuff?");
                    xhr.setRequestHeader (
                        'Authorization', "Bearer" + token.access_token
                    );
                    xhr.setRequestHeader(
                        "Access-Control-Allow-Origin", "*"
                    );
                    xhr.setRequestHeader(
                        "Accept", "application/vnd.amadeus+json"
                    );
                },
                "url" : queryURL,
                "method" : "GET",
                "crossDomain": true,
                "contentType": "text/json",
                "dataType": "jsonp", 
                "headers" : {
                    "Authorization" : "Bearer" + token.access_token,
                    "Accept": "application/vnd.amadeus+json"
                }
            }).then( function(response) {
                var queryResult = response;
                console.log("AJAX YOU BETTER WORK!");
            });
        });
    });
}