"use strict";

let activeUsers = require('./../../activeUsers/activeUsers');

function handlePost(req, res) {
	let id = req.body.user.id;
	let user = req.body.user;
	console.log(id,user);
	if(!!id){
		activeUsers[id] = user;
	}
	res.send(200);
};


module.exports = {
	post: handlePost
}