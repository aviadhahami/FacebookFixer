/**
 * Created by aviad on 9/1/2016.
 */
const restaurantActions = require('./../actions/restaurant.actions');
const technicianActions = require('./../actions/technician.actions');

const actions = {
	'fetch-technician-remote': restaurantActions.fetchRemote,
	'fetch-technician-nearby': restaurantActions.fetchNearby,
	'fetch-restaurant-remote': technicianActions.fetchRemote,
	'fetch-restaurant-nearby': technicianActions.fetchNearby
};


// MUST RETURN PROMISE!
const actionsGateway = function (action, params) {
	return actions[action](params);
};

module.exports = actionsGateway;

