/**
 * Created by aviad on 9/1/2016.
 */
'use strict';

const routesMap = require('./controllers/controllerMap');

module.exports = app=>{
	
	// Index route
	app.get('/', routesMap['/'].get);
	
	// for Facebook verification
	app.get('/webhook/', routesMap['/webhook/'].get);
	app.post('/webhook/', routesMap['/webhook/'].post);
};