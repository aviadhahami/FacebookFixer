/**
 * Created by aviad on 9/1/2016.
 */
'use strict';
const messageProcessor = require('./../../messageProccessor/entry');
const sendApi = require("../../api/sendAPI");
const clientSettingsProvider = require("../../clientSettings/clientSettings");

function get(req, res) {
	if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
}

function post(req, res) {

	// Send menu to sever
	let messaging_events = req.body.entry[0].messaging;
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i];
		let sender = event.sender.id;
		
		if (event.message && event.message.text) {
			let text = event.message.text;
			messageProcessor(sender, text);
		}
	}
	res.sendStatus(200)
}

module.exports = {
	get: get,
	post: post
};