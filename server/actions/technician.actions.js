"use strict";

const googleAPI = require('./../api/googlePlacesAPI');
const q = require('q');

function fetchRemote(params) {
	let deferred = q.defer();
	let location = params.location;
	googleAPI.decodeLocation(location).then(function (parsedLocation) {
		googleAPI.searchByQuery(`${params.type} technician`, parsedLocation, 1000).then(function (res) {
			deferred.resolve(res);
		}, function (err) {
			deferred.reject(err);
		})
	}, function (err) {
		// Don't care
		deferred.reject(err);
	});
	return deferred.promise;
}


function fetchNearby(params) {
	console.log('Fetching nerbby');
	let deferred = q.defer();
	let id = params.sessionId;
	
	console.log('this is user', activeUsers);
	let hardCords = {lat: '32.061983', lng: '34.778873'};
	let hardRadius = 1000;
	if ((!!id && activeUsers.hasOwnProperty(id)) || true) {
		let user = activeUsers[id];
		googleAPI.searchByQuery(`${params.type} technician`, hardCords, hardRadius).then(function (res) {
			deferred.resolve(res);
		}, function (err) {
			deferred.reject(err);
		});
	} else {
		deferred.reject('No user');
	}
	return deferred.promise;
}

module.exports = {
	fetchRemote: fetchRemote,
	fetchNearby: fetchNearby
};
