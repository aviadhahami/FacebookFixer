/**
 * Created by aviad on 9/1/2016.
 */
'use strict';
const request = require('request');
const token = require('./../../secrets').token;

const botApi = require('./../../api/botApi');


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
	request(botApi.sendLoadingIndicator(sender,token), function(err){
		console.log('err',err);
	});
	// request({
	// 	url: 'https://graph.facebook.com/v2.6/me/messages',
	// 	qs: {access_token:token},
	// 	method: 'POST',
	// 	json: {
	// 		recipient: {id:sender},
	// 		message: messageData,
	// 	}
	// }, function(error, response, body) {
	// 	if (error) {
	// 		console.log('Error sending messages: ', error)
	// 	} else if (response.body.error) {
	// 		console.log('Error: ', response.body.error)
	// 	}
	// })
}

module.exports = {
	get: get,
	post:post
};