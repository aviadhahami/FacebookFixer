/**
 * Created by aviad on 9/1/2016.
 */

module.exports = {
	sendLoadingIndicator: function (id, token) {
		return {
			url: 'https://graph.facebook.com/v2.6/me/messages',
			method: 'POST',
			qs: {access_token: token},
			json: {
				recipient: {id: id},
				sender_action: "typing_on"
			}
		}
	}
};