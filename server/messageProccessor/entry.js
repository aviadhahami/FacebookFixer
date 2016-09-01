"use strict";

const sendApi = require('./../api/sendAPI');
const botApi = require('./../api/botApi');
const menuProvider = require('./../persistantMenu/menu');

function isNew(sender) {
	return true;
}
function isNotActive(sender) {
	return true;
}

function greetByTime(timeDiff) {
	let res;
	let now = new Date();
	let currentTime = now.getUTCHours() + timeDiff;
	if (currentTime > 6 && currentTime < 12) {
		res = 'Good morning'
	} else if (currentTime >= 12 && currentTime < 18) {
		res = 'Good afternoon'
	} else if (currentTime >= 18 && currentTime < 21) {
		res = 'Good evening'
	} else {
		res = 'Good night'
	}
	return res;
}

const entry = function (sender, text) {
	sendApi.callThreadAPI(menuProvider.generateMenu(sender)).then(
		function(res){
			console.log('res from menu',res);
		},
		function(err){
			console.log('err from menu',err);
		}
	);
	
	
	if (isNew(sender) && isNotActive(sender)) {
		// TODO: Register user to db
		// TODO: Set user to active
		
		let messageData = {text: text};
		sendApi.callSendAPI(botApi.loadingIndicator(sender)).then(function (res_first) {
			sendApi.getUserData(sender).then(function (res) {
				let parsed = JSON.parse(res);
				
				let firstName = parsed.first_name;
				let timeDiff = parseInt(parsed.timezone);
				let greeting = greetByTime(timeDiff) || ' Hi';
				let text = `${greeting} ${firstName}, how may I help you?`;
				
				sendApi.callSendAPI(sendApi.generateTextPayload(sender, text));
			}, function (err) {
				console.log('err from prome', err)
			});
			
		}, function (err) {
			
		});
		
		
	} else {
		// TODO: Check context etcc
	}
	
	
};
module.exports = entry;