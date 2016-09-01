/**
 * Created by aviad on 9/1/2016.
 */

module.exports = {
	loadingIndicator: function (id) {
		return {
			recipient: {id: id},
			sender_action: "typing_on"
		}
	}
};