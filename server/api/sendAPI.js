/**
 * Created by aviad on 9/1/2016.
 */
'use strict';

const request = require('request');
const token = require('./../secrets').token;
const q = require('q');

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
				console.error(error);
			}
		});
	},
	getUserData: function(id){
		let deferred = q.defer();
		console.log('received id', id);
		console.log('url is','https://graph.facebook.com/v2.6/'+id+'?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token='+token)
		request({
			method:'GET',
			url:'https://graph.facebook.com/v2.6/'+id+'?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token='+token
		},function (error, response, body) {
			console.log('body',body);
			if (!error && response.statusCode == 200) {
				deferred.resolve(body);
			} else {
				console.error("Unable to send message.");
				console.error(error);
				deferred.reject(error);
			}
		});
		return deferred.promise;
	}
};