'use strict';


const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const sendApi = require('./api/sendAPI');
const clientSettingsProvider = require('./clientSettings/clientSettings');
const path = require('path')
const request = require('request');
const token = require('./secrets').token;


let PORT = 5000;
app.set('port', (process.env.PORT || PORT));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// Process application/json
app.use(bodyParser.json());


// Boostrap
// request("https://graph.facebook.com/v2.6/me/thread_settings?access_token=" + token, {
// 	method: 'DELETE',
// 	json: {
// 		"setting_type": "call_to_actions",
// 		"thread_state": "existing_thread"
// 	}
// }, function (res) {
// 	console.log('delte res', res);
// });
sendApi.callThreadAPI(clientSettingsProvider.generateGreeting());

app.use(express.static(path.join(__dirname, '..', 'client')));

// Bind routes
require('./routes')(app);

// Spin up the server
app.listen(app.get('port'), function () {
	console.log('running on port', app.get('port'))
});