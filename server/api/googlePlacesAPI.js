'use strict';

const https = require('https');
const q = require('q');
const key = require('./../secrets').placesKey;

// let location = '32.062102, 34.778758';
let radius = '500';
let query = 'italian restaurant in tel aviv';


function searchByQuery(query, location, radius) {
	let deferred = q.defer();
	https.get('https://maps.googleapis.com/maps/api/place/textsearch/json?' //location=' + location
		+ '&radius=' + radius + '&query=' + query + '&key=' + key + '&libraries=places&output=json', function (response) {
		let body = '';
		
		response.on('data', function (chunk) {
			body += chunk;
		});
		
		response.on('end', function () {
			let places = JSON.parse(body);
			console.log(places.results);
			deferred.resolve(places.results);
		});
		
	}).on('error', function (e) {
		deferred.reject(`Got error: ${e.message}`);
		console.log(`Got error: ${e.message}`);
	});
	return deferred.promise;
};

module.exports = {
	searchByQuery: searchByQuery
};