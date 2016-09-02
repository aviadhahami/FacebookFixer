"use strict";
/**
 * Created by aviad on 9/1/2016.
 */
const restaurantActions = require('./../actions/restaurant.actions');
const technicianActions = require('./../actions/technician.actions');

const actions = {
	
	'fetch-technician-remote': technicianActions.fetchRemote,
	'fetch-technician-nearby': technicianActions.fetchNearby,
	'fetch-restaurants-remote': restaurantActions.fetchRemote,
	'fetch-restaurants-nearby': restaurantActions.fetchNearby,
};


// MUST RETURN PROMISE!
const actionsGateway = function (action, params) {
	return actions[action](params);
};

module.exports = actionsGateway;


