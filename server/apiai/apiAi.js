'use strict'

let apiai = require('apiai');

let app = apiai("2a6a852971664db69c24d694a7050c57");

module.exports = {
    request: function(text, sessionId) {
        let request = app.textRequest(text, {sessionId: sessionId});

        request.on('response', function(response) {
            console.log(response);

            console.log("\nContext0:\n");
            console.log(response.result.contexts[0]);
        });

        request.on('error', function(error) {
            console.log(error);
        });

        request.end();
    }
};
