'use strict'
var mongoose = require('mongoose');
var User = require('../model/userSchema');
var express = require('express');
var request = require('request');
var AWS = require('aws-sdk');
AWS.config.region = 'eu-central-1';
AWS.config.accessKeyId='token'
AWS.config.secretAccessKey='token'
var s3 = new AWS.S3();
var fs = require('fs');
var https = require('https')
var router = express.Router();
var _ = require('underscore');
var cron = require('node-cron');
var services = require('./services');
var stripe = require('stripe')('token')
const token = 'token'
/* GET home page. */




router.post('/charge', function(req, res) {

    var stripeToken = req.body;
    console.log('charge' + JSON.stringify(stripeToken))
    var charge = stripe.charges.create({
        amount: 1000, // amount in cents, again
        currency: "usd",
        card: stripeToken,
        description: "payinguser@example.com"
    }, function(err, charge) {
        if (err && err.type === 'StripeCardError') {
            // The card has been declined
        } else {
            //Render a thank you page called "Charge"
            res.render('charge', { title: 'Charge' });
        }
    });

});

router.get('/webhook/', function(req, res )
{
  if (req.query['hub.verify_token'] === 'verify_token"') {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
});

router.get('/userdata/:uid', function(req, res )
{
    User.findOne({facebook_id:req.params.uid}, function(err,usr)
    {
        if(err)
            console.log('err',err)
        res.json({city:usr.city,age:usr.age,description:usr.description,distance:usr.distance,minAge:usr.searchAgeMin,maxAge:usr.searchAgeMax,gender:usr.searchGender})
    })
});



router.post('/settings/',function(req,res)
{
    console.log(req.body)
    let userBody = req.body
    console.log(userBody)
    User.findOne({'facebook_id' : userBody.id}, function(err,user) {
        if (err)
            console.log(err);

        // if the user is found, then log them in
        if (user) {
            user.searchAgeMin = userBody.minAge   ? userBody.minAge : user.searchAgeMin
            user.searchAgeMax =  userBody.maxAge  ? userBody.maxAge : user.searchAgeMax
            user.description =  userBody.description ? userBody.description : user.description
            user.city =  userBody.city ? userBody.city : user.city
            user.location = userBody.lng ? {type:"Point",coordinates:[parseFloat(userBody.lng),parseFloat(userBody.lat)]} : user.location
            //user.lng = userBody.lng
            user.age = userBody.age ? userBody.age : user.age
            //user.ageMax = userBody.age ? userBody.age : user.ageMax
            user.distance = userBody.distance ? userBody.distance : user.distance
            user.searchGender = userBody.gender ? userBody.gender : user.searchGender

            user.save(function (err) {
                if (err)
                    console.log(err)
            })
            services.sendAdminMessage(user.facebook_id,"Your settings were updated")
            services.yourCurrentProfile(user)

        }

        })
    res.sendStatus(200)

});

function moveFromDeclineToAgree(user,secondUserId) {
    if (!_.findWhere(user.agree,{id: secondUserId})) {
        if (_.findWhere(user.decline,{id: secondUserId})) {
            user.decline = _.without(user.decline, _.findWhere(user.decline, {id: secondUserId}))
            //let newAgree =  underscore.filter(user.agree, function(o)
            //{
            //    if(o !== user.current_id)
            //        return o
            //})
            //if(newAgree.length > 0)
            //  user.agree = newAgree
        }
        user.agree.push({id: secondUserId})
    }
}

function moveFromAgreeToDecline(user,secondUserId) {
    if (!_.findWhere(user.decline,{id: secondUserId})) {
        if (_.findWhere(user.agree,{id: secondUserId})) {
            user.agree = _.without(user.agree, _.findWhere(user.agree, {id: secondUserId}))
            //let newAgree =  underscore.filter(user.agree, function(o)
            //{
            //    if(o !== user.current_id)
            //        return o
            //})
            //if(newAgree.length > 0)
            //  user.agree = newAgree
        }
        user.decline.push({id: secondUserId})
    }
}
function fetchImageFromFB(fileName, image,cb) {
        var file = fs.createWriteStream(fileName);
        var request = https.get(image, function(response) {
            response.pipe(file);
            file.on('finish', function() {
                console.log('finish')
                file.close(cb);  // close() is async, call cb after close completes.
            });
        }).on('error', function(err) { // Handle errors
            fs.unlink(dest); // Delete the file async. (But we don't check the result)
            if (cb) cb(err.message);

        });

}
function uploadToS3(image,fileName,user)
{
    https.request(image,function(response)
    {
        console.log('reponse')
        var params = {
            Bucket: 'somatix-redis',
            Key: fileName,
            Body: response,
            ACL: 'public-read',
            ContentType: 'image/jpeg'
        };
        s3.upload(params, function (err, data) {
            console.log(err, data);
                user.photos.push({url: data.Location})

            user.save(function (err) {
                if (err)
                    console.log(err)
            })
            services.sendPhotoSettings(user)

        });;
    }).end();



    //stream.on('error', cb)
    //    .on('close', cb);
    //var options = {partSize: 10 * 1024 * 1024, queueSize: 1};
}

router.post('/webhook/', function (req, res) {
    //console.log('req',req)
    console.log('hello');
    console.log('req.body: ', JSON.stringify(req.body));
    //let body =  JSON.parse(req.body)
    let messaging_events = req.body.entry[0].messaging
  console.log('Error: ', messaging_events);
  for (let i = 0; i < messaging_events.length; i++) {
    let event = req.body.entry[0].messaging[i]
    //let event = JSON.parse(eventString)
    console.log('msg', event)
    let sender = event.sender.id
      //console.log('imattachmentsage', event.message.attachments);
      //
      //console.log('image', event.message.attachments[0].payload.image);

      if(event.message && event.message.attachments && event.message.attachments[0] && event.message.attachments[0].payload && event.message.attachments[0].payload.coordinates )
    {
      console.log('coordinates', event.message.attachments[0].payload.coordinates);

      let lat = event.message.attachments[0].payload.coordinates.lat;
      let lng = event.message.attachments[0].payload.coordinates.long;
      addLocationToUser(sender,lat,lng)
      services.sendAdminMessage(sender,"A location was added to your profile")

    }
     else if(event.message && event.message.attachments && event.message.attachments[0] && event.message.attachments[0].payload && event.message.attachments[0].payload.url && event.message.attachments[0].type)
      {
          console.log('image', event.message.attachments[0].payload.url);
          let type = event.message.attachments[0].type;
          let image = event.message.attachments[0].payload.url;
          User.findOne({'facebook_id': sender}, function (err, user) {

              // if there is an error, stop everything and return that
              // ie an error connecting to the database
              if (err)
                  console.log(err);

              // if the user is found, then log them in
              if (user) {

                  //s3.

                  //var file = fs.createWriteStream("file.jpg");
                  //s3.upload({Bucket: 'somatix-redis', Key: fileName, Body: file})
                  //https.get(image, function(response) {
                  //     response.pipe(file)
                  // })
                  //let cb
                  //let fileName = user.facebook_id + "2" + ".jpg"
                  //  uploadToS3(image,fileName)
                  /*
                  request({
                      url: image,
                      method: 'GET'
                  }, function(error, response, body) {
                      if (error) {
                          console.log('Error sending messages: ', error)
                      } else if (response.body.error) {
                          console.log('Error: ', response.body.error)
                      }
                      else {
                          //  console.log('body',body)
                          //console.log('body',body)

                          //var base64data = new Buffer(body, 'binary').toString('base64');
                          fs.writeFile(fileName, body, function(err) {
                              if (err) {
                                  console.log(err);
                              } else {
                                  console.log("JSON saved");
                              }
                          })
                          s3.upload(params, function (err, data) {

                              if (err)

                                  console.log(err)

                              else
                                  console.log("Successfully uploaded data to myBucket/myKey");


                          });
                      }

                  })*/

                  //fetchImageFromFB(fileName, image, function (val) {
                      //var fileName = val.fileName;
                      //var file = val.file;




                  //let lng = event.message.attachments[0].payload.coordinates.long;
                  handleAttachment(user, image, type)
              }
          })
      }
    else if(event.message && event.message.text && event.message.quick_reply)
    {
      let quick_reply = event.message.quick_reply
      console.log('quick_reply',quick_reply);
      console.log('quick_reply.text',event.message.text);
      console.log('quick_reply.payload',quick_reply.payload);
        if(quick_reply.payload === 'user_gender')
        {
            addGenderToUser(sender, event.message.text);
        }

    }
    else if (event.message && event.message.text) {
      let text = event.message.text;

          services.sendTextMessage(sender, text.substring(0, 300))

    }
    else if (event.postback && event.postback.payload)
    {
      console.log('payload', event.postback.payload);
        console.log('event', event)
      if( 'GETTING_STARTED_BUTTON' === event.postback.payload)
      {
        services.retrieveUserData(sender)
      }
      else if(event.postback.payload.includes('agree_to_chat_'))
      {
          User.findOne({'facebook_id' : sender}, function(err,user) {
              if (err)
                  console.log(err);
              let secondUsedId = event.postback.payload.substring(14)

              // if the user is found, then log them in
              if (user) {

                  User.findOne({'facebook_id': secondUsedId}, function (err2, secondUser) {
                      moveFromDeclineToAgree(user,secondUsedId);

                      if (err2)
                          console.log(err2);

                      if (secondUser) {
                          user.save(function (err) {
                              if (err)
                                  console.log(err)
                          })
                          console.log('second user', secondUser)
                          //underscore.find(secondUser.agree, function(res)

                          if (_.findWhere(secondUser.agree, {id: sender})) {
                              //console.log('res', res)
                              user.current_id=secondUsedId
                              user.inConversation = true
                              user.save(function (err) {
                                  if (err)
                                      console.log(err)
                              })
                              if (secondUser.inConversation == false) {
                                  secondUser.current_id = sender
                                  secondUser.inConversation = true
                                  secondUser.save(function (err) {
                                      if (err)
                                          console.log(err)
                                  })
                                  services.notifyOfNewChat(sender, secondUser)
                                  services.notifyOfNewChat(secondUser.facebook_id, user)

                              }
                              else {
                                  services.suggestUsers(user)
                              }


                          }
                          else {
                              services.suggestUsers(user)
                          }


                      }
                  })
              }
          })
      }
      else if(event.postback.payload.includes('more_images_'))
      {
          console.log('Entering more_images')
          User.findOne({'facebook_id' : sender}, function(err,user) {
              if (err)
                  console.log(err);
              let secondUsedId = event.postback.payload.substring(12)
              // if the user is found, then log them in
              if (user) {
                  User.findOne({'facebook_id' : secondUsedId}, function(err,secondUser) {
                      if (err)
                          console.log(err);
                      if(secondUser)
                      {
                          console.log('second user', secondUser)
                          services.sendImage(user.facebook_id,secondUser.photo,'image')
                          _.forEach(secondUser.photos,function(photo)
                          {
                              services.sendImage(user.facebook_id,photo.url,'image')

                          })
                      }
                      })
                  }
              })
      }
      else if(event.postback.payload.includes('refuse_to_chat_'))
      {
          User.findOne({'facebook_id' : sender}, function(err,user) {
              if (err)
                  console.log(err);

              // if the user is found, then log them in
              if (user) {
                  let secondUsedId = event.postback.payload.substring(15)
                  moveFromAgreeToDecline(user,secondUsedId);
                  services.suggestUsers(user)
              }
          });
      }
      else if('Find_Matches_Payload' === event.postback.payload)
      {
          console.log('Entering Find_Matches_Payload')
          User.findOne({'facebook_id' : sender}, function(err,user) {
              if (err)
                  console.log(err);

              // if the user is found, then log them in
              console.log('sender',sender)

              console.log('user',user)
              if (user && user.inConversation === false) {
                  services.suggestUsers(user)
              }
              else
              {
                  console.log('User was not found')
              }
          })
      }
      else if ('Change_Settings' === event.postback.payload)
      {
          console.log('Enter Change_Settings')
          User.findOne({'facebook_id' : sender}, function(err,user) {
              if (err)
                  console.log(err);

                if(user)
                {
                    services.sendSettingsWithImages(user)
                }
          })

          }
      else if('End_Chat_Payload' === event.postback.payload)
      {
          console.log('Enter End_Chat_Payload')

          User.findOne({'facebook_id' : sender}, function(err,user) {
              if (err)
                  console.log(err);
              if(user.inConversation == true)
              {
                  user.inConversation = false
                  while(_.findWhere(user.agree, {id: user.current_id}))
                  user.agree = _.without(user.agree, _.findWhere(user.agree, {id: user.current_id}))
                  user.decline.push({id: user.current_id})
                  let secondId = user.current_id
                  console.log('first', user)
                  user.save(function (err) {
                      if (err) throw err;
                  })
                  User.findOne({'facebook_id' : secondId}, function(err,secondUser) {
                      if (err)
                          console.log(err);
                      if(secondUser && secondUser.inConversation == true && secondUser.current_id === sender) {


                          secondUser.inConversation = false
                          console.log('second', secondUser)

                          secondUser.save(function (err) {
                              if (err) throw err;
                          })
                          services.notifyOfChatEnd(sender,secondUser)
                          services.notifyOfChatEnd(secondUser.facebook_id,user)
                          isANewChatAvailable(secondUser)


                      }
                  })
                  isANewChatAvailable(user)


              }


          })
      }
      else if ('photos_settings' === event.postback.payload)
      {
          console.log('Enter photos_settings')
          User.findOne({'facebook_id' : sender}, function(err,user) {
              if (err)
                  console.log(err);

              if(user)
              {
                  services.sendPhotoSettings(user)
              }
          })

      }
       else if(event.postback.payload.includes('make_main_photo_'))
      {
          console.log('Enter make_main_photo_')
          User.findOne({'facebook_id' : sender}, function(err,user) {
              if (err)
                  console.log(err);

              if(user)
              {
                  let url = event.postback.payload.substring(16)
                  user.photos = _.filter(user.photos, function(photo)
                  {
                      if (photo.url !== url)
                          return photo
                  })
                  user.photos.unshift({url:user.photo})
                  user.photo = url

                  user.save(function (err) {
                      if (err)
                          console.log(err)
                  })
                  services.sendPhotoSettings(user)


              }
          })
          services.sendAdminMessage(sender,"You've set a new main image")

      }
      else if(event.postback.payload.includes('delete_photo_'))
      {
          console.log('Enter delete_photo_')
          User.findOne({'facebook_id' : sender}, function(err,user) {
              if (err)
                  console.log(err);

              if(user)
              {
                  JSON.stringify(user)
                  let url = event.postback.payload.substring(13)

                  console.log('url', url)
                  //user.photos.push({url:user.photo})
                  //user.photo = url
                  user.photos = _.filter(user.photos, function(photo)
                  {
                      if (photo.url !== url)
                          return photo
                  })
                  user.save(function (err) {
                      if (err)
                          console.log(err)
                  })
                  services.sendPhotoSettings(user)


              }
          })
          services.sendAdminMessage(sender,"You've deleted an image from a profile")

      }

    }

  }
  res.sendStatus(200)

});
function isANewChatAvailable(user) {
    console.log('isANewChatAvailable', user)
    let ids = _.map(user.agree,function(u)
    {
        return u.id
    })
    User.find({'facebook_id': {$in : ids}, 'agree.id' :  user.facebook_id}, function(err, secondUsers)
    {
        console.log('isANewChatAvailable:secondUsers', secondUsers)

        if(err)
            throw err
        //let userWithMutualAgreement = underscore.filter(secondUsers.agree,function(u)
        //{
        //    if(u.id === user.facebook_id)
        //        return u
        //})
        //console.log('isANewChatAvailable:userWithMutualAgreement', userWithMutualAgreement)

        let secondUserArr = _.filter(secondUsers, function(o)
        {
          if(o.inConversation == false)
            return o
        })
        console.log('isANewChatAvailable:secondUser', secondUserArr)
        let secondUser = secondUserArr[0]
        if(secondUser)
        {
            console.log('isANewChatAvailable',secondUser)

            if(secondUser.inConversation == false) {
                user.current_id = secondUser.facebook_id
                user.inConversation = true
                user.save(function(err){
                    if(err)
                        console.log(err)
                })
                secondUser.current_id = user.facebook_id
                secondUser.inConversation = true
                secondUser.save(function (err) {
                    if (err)
                        console.log(err)
                })
                services.notifyOfNewChat(user.facebook_id,secondUser)
                services.notifyOfNewChat(secondUser.facebook_id, user)

            }

        }
        else
        {
            services.suggestUsers(user)
        }
    })
}
function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}


function handleAttachment(user, file, type) {

            console.log('enter handleAttachment')
            if(user.inConversation == false)
            {
                console.log('enter handleAttachment not in conversation',file)

                let filename = user.facebook_id + randomString(4, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') + ".gif"
                uploadToS3(file,filename,user)
              /*  https.request(file,function(response) {
                    console.log('reponse')
                    var params = {
                        Bucket: 'somatix-redis',
                        Key: filename,
                        Body: response,
                        ACL: 'public-read'
                    };
                    s3.upload(params, function (err, data) {
                        console.log(err, data);
                        if (type === 'image') {
                            user.photos.push({url: data.Location})
                        }
                        user.save(function (err) {
                            if (err)
                                console.log(err)
                        })
                    });
                });*/
                services.sendAdminMessage(user.facebook_id, "A new image was uploaded to your profile")

            }
            else if(user.inConversation == true) {
                User.findOne({'facebook_id':user.current_id},function(err,usr)
                {
                    if(err)
                        console.log(err)
                    if(usr)
                    {
                        services.sendImage(usr.facebook_id,file, type)
                    }
                })
            }
            //s3bucket.upload({Key: sender, Body: file}, function(err, data) {
            //    if (err) {
            //        console.log("Error uploading data: ", err);
            //    } else {
            //        console.log("Successfully uploaded data to myBucket/myKey");
            //    }
            //})


}

function addGenderToUser(sender, text) {
    User.findOne({ 'facebook_id' : sender }, function(err, user) {

        // if there is an error, stop everything and return that
        // ie an error connecting to the database
        if (err)
            console.log(err);

        // if the user is found, then log them in
        if (user) {
            let  searchGender = text === 'male' ? 'female' : 'male'

            user.gender = text
            user.searchGender = searchGender
            //ervices.welcomeExplanation(user)
            services.sendAdminMessage(user.facebook_id,"Hi," + user.first_name + " where are you from?")

            services.sendSettingsWithoutImages(user)

            user.save(function(err) {
                if (err) throw err;

                console.log('User updated successfully!');
                //sendTextMessage(sender, "To improve matches, please send your location via the location button");
                //
            });
        }
    });
}

function addLocationToUser(sender, lat, lng) {
  User.findOne({ 'facebook_id' : sender }, function(err, user) {

    // if there is an error, stop everything and return that
    // ie an error connecting to the database
    if (err)
      console.log(err);

    // if the user is found, then log them in
    if (user) {
      //user.lat = lat
      ////console.log(user);
      //user.lng = lng
      user.location = {type:"Point",coordinates:[parseFloat(lng),parseFloat(lat)]}
      console.log(user);
      user.save(function(err) {
        if (err) throw err;

        console.log('User updated successfully!');
          services.suggestUsers(user);

        //sendAgeChoice(sender);

      });
    }
  });
}





module.exports = router;
