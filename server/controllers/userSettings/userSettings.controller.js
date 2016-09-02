"use strict";

let activeUsers = require('./../../activeUsers/activeUsers');

function handlePost(req, res) {
	let id = req.body.user.id;
	let user = req.body.user;
	console.log(id,user);
	if(!!id){
		console.log('injecting to DB');
		activeUsers[id] = user;
	}
	res.json({status:'ok'});
};


module.exports = {
	post: handlePost
};