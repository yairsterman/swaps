var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User.js');
var Q = require('q');
var dateFormat = require('dateformat');
var email = require('../services/email.js');
var emailMessages = require('../services/email-messages.js');
var Data = require('../user_data/data.js');
var requestsService = require('../services/requestsService.js');

var error = {
	error: true,
	message: ''
};

const DAY = 1000*60*60*24;

const USER_UNAVAILABLE = {code:409, msg:'You have already booked these dates'};
const REQUEST_UNAVAILABLE = {code:411, msg:'The dates you requested have already been booked by the user'};

router.post('/sendMessage', function(req, res, next) {
	var recipientId = req.body.recipientId;
	var sender = req.user;
	var message = req.body.message;
	var now = Date.now();
	var newMessage = {
				date: now,
				isRequest: false,
				message: message
			}

	saveMessage(sender._id, recipientId, sender._id, newMessage, false).then(function(recipient){
        email.sendMail([recipient.email],'New Message', emailMessages.message(recipient, sender));
        return saveMessage(recipientId, sender._id, sender._id, newMessage, true);
	})
	.then(function(){
		User.findOne({_id: sender._id}, function (err, updatedUser) {
			if (err){
				console.log("couldn't find user but Message was sent" + err);
				error.message = "couldn't find user but Message was sent";
				res.json(error);
			}
			else{
				res.json(updatedUser);
			}
		});
	},function(err){
		res.json(err);
	});
});

router.post('/sendRequest', function(req, res) {
    requestsService.sendRequest(req.body).then(function(){
        User.findOne({_id: req.user._id}, Data.getVisibleUserData().restricted)
            .populate({
                path: 'community',
                select: 'name _id',
            })
            .exec(function (err, user) {
                if (err) return next(err);
                res.json(user);
            });
        },
        function(err){
            error.message = err;
            res.json(error);
        });
});

router.post('/cancelRequest', function(req, res) {
    let requestId = req.body.requestId;
    let message = req.body.message;
    let userId = req.user._id;
    requestsService.cancelRequest(requestId, userId, message).then(function(){
		res.json({status: 'success', message: 'canceled'});
	},
	function(err){
		res.json(err);
	});
});

router.post('/readMessage', function(req, res) {
    var recipientId = req.body.recipientId;
    var senderId = req.user._id;
    markedMessageRead(senderId, recipientId).then(function(){
            res.json({status: 'success', message: 'read'});
        },
        function(err){
            res.json(err);
        });
});

function saveMessage(senderId, recipientId, messageId, message, markedRead){
	var defferd = Q.defer();
	message.id = messageId;
	User.findOne({_id: senderId}, function (err, sender) {
		if (err){
			error.message = "Message not sent";
			defferd.reject(error);
		}
		else{
			if(sender._id){
				User.findOne({_id: recipientId}, function (err, user) {
					if (err){
						error.message = "Message not sent";
						defferd.reject(error);
					}
					else{
						if(user){
							var messages = user.messages;
							var index = -1;
							// find messages by sender
							for(var i = 0; i < messages.length; i++){
								if(messages[i].id.toString() === sender._id.toString()){
									messages[i].messages.push(message);
									messages[i].read = markedRead;
									index = i;
									break;
								}
							}
							// no messages found by that user, create new chat
							if(index == -1){
								messages.unshift({
									id: sender._id,
									image: sender.image,
									name: sender.firstName,
									read: markedRead,
									messages: [message]
								});
							}
							User.update({_id: recipientId}, { $set: { messages: messages}}, function (err, updated) {
								if (err){
									console.log("Message not sent" + err);
									error.message = "Message not sent";
									defferd.reject(error);
								}
								else{
									console.log("updated DB");
									defferd.resolve(user);
								}
							});
						}
						else{
							error.message = "Message not sent";
							defferd.reject(error);
						}
					}
				});
			}
		}
	});
	return defferd.promise;
}

function markedMessageRead(senderId, recipientId){
    var deferd = Q.defer();
    User.findOne({_id: senderId})
        .then(function (sender) {
            if (!sender._id){
                error.message = "Request not sent";
                throw new Error(error.message);
            }
            else {
                var messageIndex = findMessage(sender.messages, recipientId);
                if(messageIndex == -1){
                    error.message = "no request found";
                    throw new Error(error.message);
                }
                else{
                    sender.messages[messageIndex].read = true;
                    return User.update({_id: sender._id}, {$set: {messages: sender.messages}});
                }
            }
        })
        .then(function (updated) {
            if (!updated.ok) {
                error.message = "Request not sent";
                throw new Error(error.message);
            }
            else {
                return User.findOne({_id: recipientId});
            }
        })
        .then(function(recipient){
            if (!recipient._id){
                error.message = "Request not sent";
                throw new Error(error.message);
            }
            else{
                var messageIndex = findMessage(recipient.messages, senderId);
                if(messageIndex == -1){
                    error.message = "no request found";
                    throw new Error(error.message);
                }
                else{
                    recipient.messages[messageIndex].read = true;
                    return User.update({_id: recipient._id}, {$set: {messages: recipient.messages}});
                }
            }
        })
        .then(function (updated) {
            if (!updated.ok){
                console.log("Request not sent" + err);
                error.message = "Request not sent";
                throw new Error(error.message);
            }
            else{
                console.log("updated DB");
                deferd.resolve();
            }
        },function(err){
            deferd.reject(err);
		});
    return deferd.promise;
}

function findMessage(messages, id){
	for(var i = 0; i < messages.length; i++){
		var message = messages[i];
		if(message.id == id){
			return i;
		}
	}
	return -1;
}

function findRequest(requests, id, departure, returnDate){
    for(var i = 0; i < requests.length; i++){
        var request = requests[i];
        if(request.userId == id.toString() && request.departure == departure && request.returnDate == returnDate){
            return i;
        }
    }
    return -1;
}


module.exports = router;
