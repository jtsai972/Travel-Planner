/* ====================================
 * Some documentation
 * ==================================== 
 * 
 * API documentation
 * ----------------------------------
 *  flight API search: 
 *  https://developers.amadeus.com/self-service/category/air/api-doc/flight-low-fare-search/api-reference
 * 
 * */

/* ====================================
 * Database setup
 * ==================================== */
//Sorry, I don't have a clue how to hide this key & make it work on github at the same time
var config = {
    apiKey: "AIzaSyCGLo6YNDxMpesuapo0S00z9B5Na7x5Qvg",
    authDomain: "fir-project-25203.firebaseapp.com",
    databaseURL: "https://fir-project-25203.firebaseio.com",
    storageBucket: "fir-project-25203.appspot.com",
};

firebase.initializeApp(config); //starting database (jtsai)
//a couple of database variables that will be referenced (jtsai)
const database = firebase.database();
const dbAuth = database.ref('/authentication');

/* ====================================
 * Non-database Global Variables
 * ==================================== */


/* ====================================
 * Initialization of document
 * ==================================== */
//Default hiding all the sections
$("section").hide();


/* ====================================
 * Other functions
 * ==================================== */
//not sure where these should go, guess it depends on what's the most convenient


/* ====================================
 * Ajax queries
 * ==================================== */

 // You guys will have to create the search queries in your function and pass it here
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
            //console.log(token);

            //once authentication is done:
            // Finally starting the actual ajax query for flight data(jtsai)
            $.ajax({
                url : queryURL,
                method : "GET"
            }).then( function(response) {
                var queryResult = response;
                //variables you want will go here
                //Example for printing out multiple 
                // for(let i=0; i < queryResult.data[i]) {
                //     imgSrc = queryResult.data[i].<more path here>
                //     <more data and variables here>
                //     print();
                // }
            });
        });
    });
}

