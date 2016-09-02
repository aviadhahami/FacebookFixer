'use strict';

const apiai = require('apiai');
const q = require('q');
const actionsAPI = require('./../api/actionsAPI');
const app = apiai("2a6a852971664db69c24d694a7050c57");

module.exports = {
    request: function (text, sessionId) {
        let deferred = q.defer();

        let request = app.textRequest(text, {sessionId: sessionId});

        request.on('response', function (response) {
            console.log(response);
            //
            let action = response.result.action;
            let parameters = response.result.parameters;

            parameters['sessionId'] = sessionId;

            if (action) {

                // TODO call actionApi here!

                actionsAPI(action, parameters).then(
                    function (actionRes) {
                        deferred.resolve(actionRes);
                    },
                    function (actionErr) {
                        deferred.reject(actionErr);
                    }
                )
            } else {
                deferred.resolve(response);
            }
        });

        request.on('error', function (error) {
            console.log(error);
            deferred.reject(error);
        });

        request.end();

        return deferred.promise;
    }
};
