/**
 * Created by aviad on 9/1/2016.
 */


module.exports = {
	generateMenu:function(){
		return{
			"setting_type" : "call_to_actions",
			"thread_state" : "existing_thread",
			"call_to_actions":[
				{
					"type":"postback",
					"title":"Help",
					"payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_HELP"
				},
				{
					"type":"postback",
					"title":"Start a New Order",
					"payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_START_ORDER"
				},
				{
					"type":"web_url",
					"title":"View Website",
					"url":"http://petersapparel.parseapp.com/"
				}
			]
		}
	},
};