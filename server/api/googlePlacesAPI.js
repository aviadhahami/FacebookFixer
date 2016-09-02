'use strict';

const https = require('https');
const q = require('q');
const geocoder = require('geocoder');
const key = require('./../secrets').placesKey;

// let location = '32.062102, 34.778758';
let radius = '500';
let query = 'italian restaurant in tel aviv';

function searchByQuery(query, location, radius) {
	let deferred = q.defer();
	let uri = 'https://maps.googleapis.com/maps/api/place/textsearch/json?location=' + location
		+ '&radius=' + radius + '&query=' + query + '&key=' + key + '&libraries=places&output=json';
	console.log('this is the query', uri);
	https.get(uri, function (response) {
		let body = '';
		
		response.on('data', function (chunk) {
			body += chunk;
		});
		
		response.on('end', function () {
			let places = JSON.parse(body);
			console.log('Resolved places, will return to caller');
			
			let response = {
				result: {
					fulfillment: {
						speech: getResultsString(places.results)
					}
				}
			};
			
			deferred.resolve(response);
		});
		
	}).on('error', function (e) {
		deferred.reject(`Got error: ${e.message}`);
		console.log(`Got error: ${e.message}`);
	});
	
	return deferred.promise;
};

function getResultsString(data) {
	let names = '';
	let length = Math.min(data.length, 5);
	for (let i = 0; i < length; i++) {
		names += data[i].name + '\n';
	}
	return names;
}

function decodeLocation(location) {
	let deferred = q.defer();
	geocoder.geocode(location, function (err, data) {
		if (err) {
			deferred.reject(err);
		} else { // TODO: verify this doesn't die here
			deferred.resolve(data.results[0].geometry.location);
		}
	});
	return deferred.promise;
};

module.exports = {
	searchByQuery: searchByQuery,
	decodeLocation: decodeLocation
};