/**
 * Created by aviad on 9/1/2016.
 */

module.exports = {
	sendLoadingIndicator: function (id, token) {
		return {
			url: 'https://graph.facebook.com/v2.6/me/messages',
			method: 'POST',
			qs: {access_token: token},
			recipient: {id: id},
			sender_action: "typing_on"
		}
	}
};
// 	{
// 		"recipient":{
// 		"id":"USER_ID"
// 	},
//
// 	}' "https://graph.facebook.com/v2.6/me/messages?access_token=PAGE_ACCESS_TOKEN
// }
// };
// return {
// 	url: 'https://graph.facebook.com/v2.6/me/messages',
// 		qs: {access_token:token},
// 	method: 'POST',
// 		json: {
// 	recipient: {id:sender},
// 	message: messageData,
// }