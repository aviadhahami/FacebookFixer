var mongoose = require('mongoose'),
    Schema = mongoose.Schema
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

var UserSchema = new Schema({
    first_name: String,
    last_name: String,
    photo: String,
    photos:[{url:String}],
    isDisabled: {
        type: Boolean,
        default: false
    },
    facebook_id: String,
    ageMin: String,
    ageMax: String,
    timezone: String,
    age: { type: Number, 'default': 30 },
    searchAgeMin: { type: Number, 'default': 18 },
    searchAgeMax:{ type: Number, 'default': 60 },
    searchGender: String,
    city: { type: String, 'default': "" },
    distance: { type: Number, 'default': 150 },
    description: { type: String, 'default': "" },
    lat: String,
    lng: String,
    locale: String,
    location: {
        type: { type: String }
        , coordinates: [SchemaTypes.Double,SchemaTypes.Double]
    },
    gender: String,
    suggestions: [{id:String}],
    agree: [{id:String}],
    decline: [{id:String}],
    current_id: String,
    inConversation: {
        type: Boolean,
        default: false
    },
    facebook: { },
    createdAt: { type: Date, 'default': Date.now }

});

 var User = mongoose.model('User', UserSchema);
module.exports = User;