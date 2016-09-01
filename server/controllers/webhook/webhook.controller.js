/**
 * Created by aviad on 9/1/2016.
 */
'use strict';

const botApi = require('./../../api/botApi');
const sendApi = require('./../../api/sendAPI');

function get(req,res){
	if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
}

function post(req, res) {
	let messaging_events = req.body.entry[0].messaging;
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i];
		
		console.log('event', event);
		console.log('sender',event.sender);
		
		let sender = event.sender.id;
		if (event.message && event.message.text) {
			let text = event.message.text;
			sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
		}
	}
	res.sendStatus(200)
}

function sendTextMessage(sender, text) {
	let messageData = { text:text };
	sendApi.callSendAPI(botApi.loadingIndicator(sender));
	setTimeout(
		function () {
			sendApi.callSendAPI(sendApi.generateTextPayload(sender, text));
		}
		, 3000);
}

module.exports = {
	get: get,
	post:post
};