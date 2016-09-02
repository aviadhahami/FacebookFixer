'use strict';

const Yelp = require('yelp');
const key = require('./../secrets').yelpData;

let yelp = new Yelp(key);

// Could integrate this lil bonus as well, but it only works with locations in the US

// See http://www.yelp.com/developers/documentation/v2/search_api
yelp.search({term: 'ac technician', location: 'New York', limit:5})
    .then(function (data) {
        console.log(data);
    })
    .catch(function (err) {
        console.error(err);
    });