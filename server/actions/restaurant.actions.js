"use strict";

const googleAPI = require('./../api/googlePlacesAPI');
const q = require('q');

function fetchRemote(params) {
	let deferred = q.defer();
	let location = params.location;
	googleAPI.decodeLocation(location).then(function(parsedLocation){
		googleAPI.searchByQuery(`${params.type} restaurant`,parsedLocation,1000).then(function(res){
			deferred.resolve(res);
		}, function(err){
			deferred.reject(err);
		})
	},function(err){
		// Don't care
		deferred.reject(err);
	});
	return deferred.promise;
}


function fetchNearby(params){
	
}

module.exports = {
	fetchRemote:fetchRemote, // location given as text (need to parse)
	fetchNearby: fetchNearby // location isn't given
};
