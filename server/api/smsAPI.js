/**
 * Created by aviad on 9/1/2016.
 */
"use strict";

const twilio = require('twilio');

// Find your account sid and auth token in your Twilio account Console.
const client = twilio('TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN');

// Send the text message.
client.sendMessage({
	to: 'YOUR_NUMBER',
	from: 'YOUR_TWILIO_NUMBER',
	body: 'Hello from Twilio!'
});