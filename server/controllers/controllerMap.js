/**
 * Created by aviad on 9/1/2016.
 */
'use strict';

const indexController = require('./index/index.controller');
const webhookController = require('./webhook/webhook.controller');
const clientController = require("./client/client.controller");
const userSettingsController = require('./userSettings/userSettings.controller');

module.exports = {
	'/':{
		get:indexController.get
	},
	'/webhook/':{
		get:webhookController.get,
		post: webhookController.post
	},
	'/client':{
		get:clientController.get
	},
	'/updateUserSettings':{
		post:userSettingsController.post
	}
};