'use strict';

const apiai = require('apiai');
const q = require('q');

let app = apiai("2a6a852971664db69c24d694a7050c57");

module.exports = {
    request: function (text, sessionId) {
        let deferred = q.defer();

        let request = app.textRequest(text, {sessionId: sessionId});

        request.on('response', function (response) {
            console.log(response);

            console.log("\nContext0:\n");
            console.log(response.result.contexts[0]);

            deferred.resolve(response);
        });

        request.on('error', function (error) {
            console.log(error);
            deferred.reject(error);
        });

        request.end();

        return deferred.promise;
    }
};
