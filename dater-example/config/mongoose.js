var config = require('./config'),
    mongoose = require('mongoose');

module.exports = function() {
    var db = mongoose.connect(config.db);

    require('../model/userSchema.js');
    //require('../app/models/patient.server.model');
    //require('../models/message.server.model');
    //require('../models/organization.server.model');
    ///require('../models/orgrequest.server.model');

    return db;
};