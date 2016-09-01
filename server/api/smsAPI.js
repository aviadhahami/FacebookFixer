/**
 * Created by aviad on 9/1/2016.
 */
"use strict";

const twillio_tokens = require('./../secrets').twilio;
const twilio = require('twilio');

// Find your account sid and auth token in your Twilio account Console.
const client = twilio(twillio_tokens.SID, twillio_tokens.token);

module.exports={
	sendText:function (number,msg) {
		// Send the text message.
		client.sendMessage({
			to: number,
			from: twillio_tokens.self_number,
			body: msg
		});
	}
};
