'use strict';


const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const token = require('./secrets').token;
const app = express();


let PORT = 5000;
app.set('port', (process.env.PORT || PORT));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// Process application/json
app.use(bodyParser.json());


// Bind routes
require('./routes')(app);

// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
});