'use strict';


const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const sendApi = require('./api/sendAPI');
const menuProvider = require('./persistantMenu/menu');



let PORT = 5000;
app.set('port', (process.env.PORT || PORT));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// Process application/json
app.use(bodyParser.json());

// Send menu to sever
sendApi.callThreadAPI(menuProvider.generateMenu());

// Bind routes
require('./routes')(app);

// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
});