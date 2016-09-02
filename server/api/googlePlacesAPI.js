'use strict';

const https = require('https');

const key = require('./../secrets').placesKey;

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
		let places = JSON.parse(body);
		console.log(places.results);
		
	});
}).on('error', function (e) {
	console.log(`Got error: ${e.message}`);
});