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
	sendApi.getUserData(sender).then(function(res){
		console.log('my res',res);
		let firstName = res.first_name || '';
		let text =`Hi ${firstName}, how may I help you today?`;
		console.log(sendApi.generateTextPayload(sender, text));
		// sendApi.callSendAPI();
	},function(err){
		console.log('err from prome',err)
	});
	
	
	
}

module.exports = {
	get: get,
	post:post
};