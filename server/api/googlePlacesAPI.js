'use strict';

const https = require('https');

const key = "AIzaSyAIFZ0tjCUja5jsW9UYJ2DxyRnziLD2wtk";

// let location = '32.062102, 34.778758';
let radius = '500';
let query = 'italian restaurant in tel aviv';

https.get('https://maps.googleapis.com/maps/api/place/textsearch/json?' //location=' + location
	+ '&radius=' + radius + '&query=' + query + '&key=' + key + '&libraries=places&output=json', function(response) {
     var body ='';
    response.on('data', function(chunk) {
      body += chunk;
    });

    response.on('end', function() {
      var places = JSON.parse(body);
      var locations = places.results;
      var randLoc = locations[Math.floor(Math.random() * locations.length)];

      console.log(places.results);
    });
}).on('error', function(e) {
  console.log(`Got error: ${e.message}`);
});