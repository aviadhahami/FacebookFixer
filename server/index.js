'use strict';


const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const sendApi = require('./api/sendAPI');
const clientSettingsProvider = require('./clientSettings/clientSettings');



let PORT = 5000;
app.set('port', (process.env.PORT || PORT));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// Process application/json
app.use(bodyParser.json());

sendApi.callThreadAPI(clientSettingsProvider.generateMenu()).then(function(res){
	console.log('res from menu', res);
	sendApi.callThreadAPI(clientSettingsProvider.generateGreeting());
},function(err,response, body){
	console.log('err from menu', err,response,body);
});



// Bind routes
require('./routes')(app);

// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
});