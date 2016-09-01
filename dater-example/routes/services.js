'use strict'
var mongoose = require('mongoose');
var User = require('../model/userSchema');
var express = require('express');
var request = require('request');
var AWS = require('aws-sdk');
var GoogleLocations = require('google-locations')
var places = new GoogleLocations('token')
var https = require('https')
AWS.config.region = 'eu-central-1';
AWS.config.accessKeyId='token'
AWS.config.secretAccessKey='token'
var s3 = new AWS.S3();
var fs = require('fs');
var _ = require('underscore');
var cron = require('node-cron');
const token = 'token'
/* GET home page. */

function retrieveUserData(sender)
{
    request({
            url: 'https://graph.facebook.com/v2.6/' + sender,
            qs: {access_token:token, fields:'first_name,last_name,profile_pic,locale,timezone,gender'},
            method: 'GET'
        }, function(error, response, body) {
            if (error) {
                console.log('Error sending messages: ', error)
            } else if (response.body.error) {
                console.log('crshed here: ', response.body.error)
            }
            else
            {
                console.log('user data', response.body);
                let jsonBody = JSON.parse(response.body);
                //let user = {
                //  facebook_id : sender,
                //  first_name: jsonBody.first_name,
                //  last_name: jsonBody.last_name,
                //  photo: jsonBody.profile_pic
                //
                //};
                //console.log('user', user)
                //User.create(user,  function(err, user) {
                //      console.log(err)
                //      if (err) {
                //        console.log(err);
                //        sendTextMessage(sender, "bye " + jsonBody.first_name);
                //
                //        //return reject(err);
                //      }
                //      else {
                //        console.log(user);
                //        sendTextMessage(sender, "hi " + jsonBody.first_name)
                //
                //      }
                //    }
                //  );
                User.findOne({ 'facebook_id' : sender }, function(err, user) {

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err)
                        console.log(err)

                    // if the user is found, then log them in
                    if (!user) {
                        // Call function that contains API call to post on Facebook (see facebook.js)
                        console.log('!user',jsonBody)

                        let  searchGender = jsonBody.gender == 'male' ? 'female' : 'male'
                        let photo =   jsonBody.profile_pic
                        https.request(jsonBody.profile_pic,function(response)
                        {
                            console.log('reponse')
                            var params = {
                                Bucket: 'somatix-redis',
                                Key: sender + ".gif",
                                Body: response,
                                ACL: 'public-read',
                                ContentType: 'image/jpeg'
                            };
                            s3.upload(params, function (err, data) {
                                console.log(err, data);
                                photo = data.Location
                                let cityString = "Tel Aviv"
                                let locationString = {
                                    type: "Point",
                                    coordinates: [34.7925013,31.9730015]
                                }
                                let newUser = new User({
                                    city: cityString,
                                    facebook_id : sender,
                                    first_name: jsonBody.first_name,
                                    last_name: jsonBody.last_name,
                                    photo: photo,
                                    gender: jsonBody.gender,
                                    timezone: jsonBody.timezone,
                                    searchGender: searchGender,
                                    locale: jsonBody.locale,
                                    location: locationString

                                });
                                newUser.save(function(err) {
                                    if (err) throw err;

                                    console.log('User saved successfully!');
                                    if(jsonBody.gender){
                                        //welcomeExplanation(newUser);
                                        //sendAdminMessageImpl(newUser.facebook_id,"Hi," + newUser.first_name + " where are you from?")
                                        //sendSettingsWithoutImages(newUser)
                                        //whereAreYouFrom(newUser)
                                        sendSettingsWithFindMatches(user)

                                    }
                                    else
                                    {
                                        sendGenderChoice(sender);

                                    }

                                });
                            });
                        }).end();


                    }
                    else if (user)
                    {
                        if(jsonBody.gender){
                            //welcomeExplanation(user);
                            //sendAdminMessageImpl(user.facebook_id,"Hi" + user.first_name + ", where are you from?")
                            //
                            //sendSettingsWithoutImages(user)
                            sendSettingsWithFindMatches(user)

                        }
                        else
                        {
                            sendGenderChoice(sender);

                        }
                    }
                });

                //sendTextMessage(sender, "hi " + jsonBody.first_name)

            }
        }
    )
}

module.exports.retrieveUserData = function(sender)
{
    retrieveUserData(sender)
}


function sendTextMessage(sender, text) {
    let messageData = { text:text }

    User.findOne({'facebook_id': sender}, function(err,user)
    {
        if(err)
            console.log(err)

        if(user && user.inConversation)
        {
            request({
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {access_token:token},
                method: 'POST',
                json: {
                    recipient: {id:user.current_id},
                    message: messageData
                }
            }, function(error, response, body) {
                if (error) {
                    console.log('Error sending messages: ', error)
                } else if (response.body.error) {
                    console.log('Error: ', response.body.error)
                }
            })
        }
        else if (user)
        {
            console.log('message',user)
            if(text.toLowerCase().includes("menu") || text.toLowerCase().includes("settings" ))
                sendSettingsWithImages(user)
            else if(text.toLowerCase().includes("find") || text.toLowerCase().includes("search") )
                suggestUserImpl(user)
            else if (!user.city || user.city === "")
                findLocation(user,text)
            else
                yourCurrentPofile(user)
        }
        else
        {
            retrieveUserData(sender)
        }
    })

}

module.exports.sendTextMessage = function(sender,text)
{
    sendTextMessage(sender, text)
}






function sendPhotoSettings(user) {
    let attachmentProfile = {
        "title": "Profile",
        "image_url": user.photo

    }
    let elements = _.map(user.photos, function(photo)
    {
        return {
            "title": "Photo",
            "image_url": photo.url,
            "buttons": [
                {
                    "type": "postback",
                    "title": "Delete",
                    "payload": "delete_photo_" + photo.url

                },
                {
                    "type": "postback",
                    "title": "Make main",
                    "payload": "make_main_photo_" + photo.url

                }
            ]
        }
    })
    elements.unshift(attachmentProfile)
    console.log(elements)
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": elements
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:user.facebook_id},
            message: messageData
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

module.exports.sendPhotoSettings = function(user)
{
    sendAdminMessageImpl(user.facebook_id,"Send new photos to the chat")
    sendSettingsWithFindMatches(user)
    sendPhotoSettings(user)
}
function sendSettingsWithImages(user) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "BlazeBot settings",
                    "subtitle": "",
                    "buttons": [{
                        "type": "web_url",
                        "title": "Edit profile",
                        "url": 'https://pacific-savannah-78863.herokuapp.com/settings.html?id=' + user.facebook_id

                    },
                        {
                            "type": "postback",
                            "title": "Photos settings",
                            "payload":"photos_settings"

                        }]
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:user.facebook_id},
            message: messageData
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

module.exports.sendSettingsWithImages = function(user)
{
    sendSettingsWithImages(user)
}

function sendSettingsWithoutImages(user) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Where are you from?",
                    "subtitle": "Or go to Edit profile",
                    "buttons": [{
                        "type": "web_url",
                        "title": "Edit profile",
                        "url": 'https://pacific-savannah-78863.herokuapp.com/settings.html?id=' + user.facebook_id

                    }]
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:user.facebook_id},
            message: messageData
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

module.exports.sendSettingsWithoutImages = function(user)
{
    sendSettingsWithoutImages(user)
}

function sendSettingsWithFindMatches(user) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "BlazeBot",
                    "subtitle": "Click on edit profile or find matches",
                    "buttons": [{
                        "type": "web_url",
                        "title": "Edit profile",
                        "url": 'https://pacific-savannah-78863.herokuapp.com/settings.html?id=' + user.facebook_id

                    },
                        {
                            "type": "postback",
                            "title": "Find matches",
                            "payload":"Find_Matches_Payload"

                        }]
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:user.facebook_id},
            message: messageData
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

module.exports.sendSettingsWithFindMatches = function(user)
{
    sendSettingsWithFindMatches(user)
}


function sendImage(recepient, url, type) {
    let messageData = {
        "attachment": {
            "type": type,
            "payload": {
                "url": url

            }
        }
    }
    console.log(JSON.stringify(messageData))
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:recepient},
            message: messageData
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

module.exports.sendImage = function(recepient, url, type)
{
    sendImage(recepient, url, type)
}


function notifyOfNewChat(sender, user) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Welcome to a chat with " + user.first_name,
                    "subtitle": user.age,
                    "image_url": user.photo
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}
module.exports.notifyOfNewChat = function(sender,user)
{
    notifyOfNewChat(sender,user)
}

function notifyOfChatEnd(sender, user) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Chat with " + user.first_name + " has ended",
                    "subtitle": user.age, // + "-" + user.ageMax,
                    "image_url": user.photo
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}
module.exports.notifyOfChatEnd = function(sender,user)
{
    notifyOfChatEnd(sender,user)
}

/*function sendAgeChoice(sender) {
 let messageData = {
 "text": "Pick your age please",
 "quick_replies": [
 {
 "content_type":"text",
 "title":"18-22",
 "payload":"user_age"
 },
 {
 "content_type":"text",
 "title":"22-25",
 "payload":"user_age"
 },
 {
 "content_type":"text",
 "title":"25-28",
 "payload":"user_age"
 },
 {
 "content_type":"text",
 "title":"28-31",
 "payload":"user_age"
 },
 {
 "content_type":"text",
 "title":"31-35",
 "payload":"user_age"
 },
 {
 "content_type":"text",
 "title":"35-39",
 "payload":"user_age"
 },
 {
 "content_type":"text",
 "title":"39-44",
 "payload":"user_age"
 },
 {
 "content_type":"text",
 "title":"44-48",
 "payload":"user_age"
 }
 ,
 {
 "content_type":"text",
 "title":"48-52",
 "payload":"user_age"
 }
 ]
 }
 request({
 url: 'https://graph.facebook.com/v2.6/me/messages',
 qs: {access_token:token},
 method: 'POST',
 json: {
 recipient: {id:sender},
 message: messageData
 }
 }, function(error, response, body) {
 if (error) {
 console.log('Error sending messages: ', error)
 } else if (response.body.error) {
 console.log('Error: ', response.body.error)
 }
 })
 }
 */
function sendGenderChoice(sender) {
    let messageData = {
        "text": "Choose your gender",
        "quick_replies": [
            {
                "content_type":"text",
                "title":"male",
                "payload":"user_gender"
            },
            {
                "content_type":"text",
                "title":"female",
                "payload":"user_gender"
            }
        ]
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

module.exports.sendGenderChoice = function(sender)
{
    sendGenderChoice(sender)
}



function welcomeExplanation(user) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Help",
                    "subtitle": "Where are you from?\n" +
                    "City,country"

                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:user.facebook_id},
            message: messageData
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendAdminMessageImpl(sender, text) {
    let messageData = { text:text }



    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })



}

module.exports.yourCurrentProfile = function(user)
{
    yourCurrentPofile(user)
}

function yourCurrentPofile(user) {
    let description = user.description ?  user.description  : ""
    let age = user.age ? " " + user.age + " years old" : ""
    let city = user.city ? " from " + user.city : ""
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Your profile:" + user.first_name,
                    "subtitle": description + age + city,
                    "image_url": user.photo,
                    "buttons": [{
                        "type": "web_url",
                        "title": "Edit profile",
                        "url": 'https://pacific-savannah-78863.herokuapp.com/settings.html?id=' + user.facebook_id

                    },
                        {
                            "type": "postback",
                            "title": "Photos settings",
                            "payload":"photos_settings"

                        }
                        ,
                        {
                            "type": "postback",
                            "title": "Find matches",
                            "payload":"Find_Matches_Payload"

                        }]
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:user.facebook_id},
            message: messageData
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendGenericMessageImpl(sender, user) {
    let description = user.description ?  user.description  : ""
    let age = user.age ? " " + user.age + " years old" : ""
    let city = user.city ? " from " + user.city : ""
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": user.first_name ? user.first_name : " ",
                    "subtitle": description + age + city,
                    "image_url": user.photo,
                    "buttons": [{
                        "type": "postback",
                        "title": "Like",
                        "payload": "agree_to_chat_" + user.facebook_id

                    }, {
                        "type": "postback",
                        "title": "No",
                        "payload": "refuse_to_chat_" + user.facebook_id
                    },
                        {
                            "type": "postback",
                            "title": "Pictures",
                            "payload": "more_pictures_" + user.facebook_id

                        }]
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function suggestUserImpl(user) {
    console.log('suggestUsers')
    //if (user.suggestions.length === 0) {
        User.find({
            'gender': user.searchGender,
            'age': {$gte: user.searchAgeMin, $lte: user.searchAgeMax},
            'location': {$geoWithin: {$centerSphere: [[user.location.coordinates[0], user.location.coordinates[1]], user.distance / 3963.2]}}
        }, function (err, users) {
            if (err)
                console.log(err);
            if (!users || users.length == 0) {
                sendAdminMessageImpl(user.facebook_id, "No matches were found")
                console.log('no users were found')
            }
            else if (users.length > 0) {
                console.log('users', users)
                var filteredUsers = _.filter(users, function (u) {
                    if (!_.findWhere(user.agree, {id: u.facebook_id}) && !_.findWhere(user.decline, {id: u.facebook_id}))
                        return u

                })
                console.log('filteredUsers', filteredUsers)
                let interestedUsers = _.map(filteredUsers, function (u) {
                    if (_.findWhere(u.agree, {id: user.facebook_id}))
                        return u
                })
                //let filteredFirstTen = _.first(filteredUsers, 10)
                //let interestedUsersFirstTen = _.first(interestedUsers, 10)
                //let unionUsers = _.shuffle(_.difference(filteredFirstTen, interestedUsersFirstTen))
                //console.log('unionUsers', unionUsers)
                filteredUsers = _.shuffle(filteredUsers)
                if (filteredUsers.length > 0) {
                    console.log('suggestedUser',filteredUsers[0])
                    user.current_id = filteredUsers[0].facebook_id;
                    //filteredUsers.shift()
                    //user.suggestions = filteredUsers//_.forEach(filteredUsers,function(u)
                    //{
                    //    return u.facebook_id
                    //})

                    user.save(function (err) {
                        if (err)
                            console.log(err)
                    })
                    sendGenericMessageImpl(user.facebook_id, filteredUsers[0])

                }
                else {
                    sendAdminMessageImpl(user.facebook_id, "No matches were found")
                }
            }
        })
    //}
    //else if(user.suggestions.length > 0){
    //    console.log('else if(user.suggestions')
    //    let filteredUsers = user.suggestions
    //    User.find({_id:filteredUsers[0]},function(err,seconUser)
    //    {
    //        //filteredUsers.shift()
    //        user.suggestions = user.suggestions.slice(1,user.suggestions.length)
    //        user.current_id = seconUser[0].facebook_id;
    //        user.save(function (err) {
    //            if (err)
    //                console.log(err)
    //        })
    //        console.log(seconUser)
    //        sendGenericMessageImpl(user.facebook_id, seconUser[0])
    //
    //    })
    //
    //}else{
    //    sendAdminMessageImpl(user.facebook_id, "No matches were found")
    //
    //}
}
module.exports.suggestUsers = function(user)
{
    suggestUserImpl(user);
}

module.exports.sendAdminMessage = function(sender,text)
{
    sendAdminMessageImpl(sender,text);
}

function findLocation(user,text) {
    console.log('findLocation', user)
    places.autocomplete({input: text, types: "(cities)"}, function (err, res) {
        if (err)
            console.log('err', err)
        console.log('response prediction', JSON.stringify(res.predictions[0]))
        if (res.predictions && res.predictions[0]) {
            let city = res.predictions[0].place_id
            console.log('city', city)
            places.details({placeid: city}, function (err, res) {
                if (err)
                    console.log(err)
                //sendAdminMessageImpl(user.facebook_id,JSON.stringify(res))
                console.log('placeid',JSON.stringify(res))
                console.log('user',user)
                user.city = res.result.address_components[0].long_name
                user.location = {
                    type: "Point",
                    coordinates: [parseFloat(res.result.geometry.location.lng), parseFloat(res.result.geometry.location.lat)]
                }
                user.save(function (err) {
                    if (err)
                        console.log(err)
                })
                sendAdminMessageImpl(user.facebook_id,"Want to update profile pictures?\nsend them here")
                yourCurrentPofile(user)

            })
        }
        else {
            sendAdminMessageImpl(user.facebook_id,"Want to update profile pictures?\nsend them here")
            yourCurrentPofile(user)
        }
    })
}
module.exports.findLocation = function(user,text) {
    //places.textSearch({keyword`:text}).then(res => {
    //    console.log('response',JSON.str]ingify(res))
    //})
    findLocation(user, text);
}

module.exports.welcomeExplanation = function(user)
{
    welcomeExplanation(user)
}

module.exports.cron = function() {
    cron.schedule('0 * * * *', function ()
    {
        console.log('execute cron')
        let currtime = new Date();
        let hours = currtime.getHours()
        let checkTime = 14 - hours
        let checkTime2 = (6 + hours) * -1
        User.find({timezone:checkTime}, function (err, res) {
            if (err)
                console.log(err);
            _.forEach(res, function (user) {
                    if(user.inConversation === false)
                        suggestUserImpl(user)

            })
        })
        User.find({timezone:checkTime2}, function (err, res) {
            if (err)
                console.log(err);
            _.forEach(res, function (user) {
                if(user.inConversation === false)
                    suggestUserImpl(user)

            })
        })
    })
}