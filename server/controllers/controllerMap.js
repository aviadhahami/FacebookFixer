/**
 * Created by aviad on 9/1/2016.
 */

const indexController = require('./index/index.controller');
const webhookController = require('./webhook/webhook.controller');

module.exports = {
	'/':{
		get:indexController.get
	},
	'/webhook/':{
		get:webhookController.get,
		post: webhookController.post
	}
};