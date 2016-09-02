"use strict";


function handlePost(req, res) {
	let id = req.body.user.id;
	let user = req.body.user;
	console.log(req);
	res.send(200);
};


module.exports = {
	post: handlePost
}