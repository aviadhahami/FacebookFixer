'use strict';

const https = require('https');

const key = "AIzaSyAIFZ0tjCUja5jsW9UYJ2DxyRnziLD2wtk";

// let location = '32.062102, 34.778758';
let radius = '500';
let query = 'italian restaurant in tel aviv';

https.get('https://maps.googleapis.com/maps/api/place/textsearch/json?' //location=' + location
    + '&radius=' + radius + '&query=' + query + '&key=' + key + '&libraries=places&output=json', function (response) {
    var body = '';
    response.on('data', function (chunk) {
        body += chunk;
    });

    response.on('end', function () {
        var places = JSON.parse(body);

        var resArr = [];

        for (var i = 0; i < places.results.length; i++) {
            resArr.push(parsePlace(places.results[i]));
        }
        console.log(resArr);

    });
}).on('error', function (e) {
    console.log(`Got error: ${e.message}`);
});

function parsePlace(place) {
    var obj = {};
    obj.name = place.name;
    obj.website = place.website;
    obj.adress = place.formatted_address;
    obj.rating = place.rating;
    if (typeof obj.rating === "undefined") {
        obj.rating = "Not Rated Yet";
    }
    obj.opening_hours = place.opening_hours;
    obj.phone_number = place.international_phone_number;
    obj.types = place.types;

    return obj;
}
