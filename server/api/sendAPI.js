/**
 * Created by aviad on 9/1/2016.
 */
'use strict';

const request = require('request');
const token = require('./../secrets').token;

module.exports = {
	generateTextPayload:function(id,text){
		return{
			recipient: {
				id:id
			},
			message: {
				text:text
			},
		}
	},
	callSendAPI: function(messageData){
		request({
			uri: 'https://graph.facebook.com/v2.6/me/messages',
			qs: { access_token: token },
			method: 'POST',
			json: messageData
			
		}, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var recipientId = body.recipient_id;
				var messageId = body.message_id;
				
				console.log("Successfully sent generic message with id %s to recipient %s",
					messageId, recipientId);
			} else {
				console.error("Unable to send message.");
				console.error(response);
				console.error(error);
			}
		});
	}
};