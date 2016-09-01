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
					"title":"Search Settings",
					"payload":"Sreach_Settings_Payload"
				},
				{
					"type":"postback",
					"title":"History",
					"payload":"History_Payload"
				},
				{
					"type":"postback",
					"title":"Report A Bug",
					"payload":"Report_A_Bug_Payload"
				}
			]
		}
	},
	generateGreeting:function(){
		return {
			"setting_type":"greeting",
			"greeting":{
				"text":"Welcome to Fixer!"
			}
		}
	}
};