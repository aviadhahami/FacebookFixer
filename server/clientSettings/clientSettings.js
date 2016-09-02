/**
 * Created by aviad on 9/1/2016.
 */


module.exports = {
	generateMenu: function (id) {
		return {
			"setting_type" : "call_to_actions",
			"thread_state" : "existing_thread",
			"call_to_actions":[
				{
					"type":"postback",
					"title":"Report bug",
					"payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_HELP"
				},
				{
					"type":"web_url",
					"title":"Settings",
					"url":"https://serene-spire-62562.herokuapp.com/client?id="+id
				}
			]
		}
	},
	generateGreeting: function () {
		return {
			"setting_type": "greeting",
			"greeting": {
				"text": `Welcome to Fixer!
				It is recommended to check the available settings :D`
			}
		}
	}
};