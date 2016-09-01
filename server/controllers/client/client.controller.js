/**
 * Created by aviad on 9/1/2016.
 */

'use strict';
const path = require('path');

function get(req,res){
	res.sendFile(path.join(__dirname,'..','client/index.html'))
}

module.exports= {
	get:get,
	post:''
};