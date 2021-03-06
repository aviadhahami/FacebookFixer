"use strict";

const sendApi = require('./../api/sendAPI');
const botApi = require('./../api/botApi');
const apiAi = require('./../apiai/apiAi');
const clientSettingsProvider = require('./../clientSettings/clientSettings');

const apology = "I'm really sorry but I couldn't find anything for you...";

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
	
	sendApi.callThreadAPI(clientSettingsProvider.generateMenu(sender));
	
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
				// let text = `${greeting} ${firstName}, how may I help you?`;
                apiAi.request(text, sender).then(
                    function(response) {
						console.log('entry.js resolved',response);
						let text = response.result.fulfillment.speech ? response.result.fulfillment.speech : apology;
						sendApi.callSendAPI(sendApi.generateTextPayload(sender, text));
                    },
                    function(error) {
                        console.log(error);
                    }
                );


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