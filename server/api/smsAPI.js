/**
 * Created by aviad on 9/1/2016.
 */
"use strict";

const twillio_tokens = require('./../secrets').twilio;

// Find your account sid and auth token in your Twilio account Console.
let client = require('twilio')(twillio_tokens.SID, twillio_tokens.token);

module.exports= {
	sendText: function (number, msg) {
		// Send the text message.
		client.messages.create({
			to: number,
			from: twillio_tokens.self_number,
			body: msg
		}, function (err, message) {
			console.log('twilio', message, err);
		});
	}
};