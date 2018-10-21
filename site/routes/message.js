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
var messageService = require('../services/messageService.js');

var error = {
	error: true,
	message: ''
};

const DAY = 1000*60*60*24;

const USER_UNAVAILABLE = {code:409, msg:'You have already booked these dates'};
const REQUEST_UNAVAILABLE = {code:411, msg:'The dates you requested have already been booked by the user'};

router.post('/sendMessage', function(req, res, next) {
	let recipientId = req.body.recipientId;
    let sender = req.user;
    let message = req.body.message;
    let now = Date.now();
    let newMessage = {
				date: now,
				isRequest: false,
				message: message
			}

	saveMessage(sender._id, recipientId, sender._id, newMessage, false).then(function(recipient){
        email.sendMail([recipient.email],'New Message', emailMessages.message(recipient, sender));
        return saveMessage(recipientId, sender._id, sender._id, newMessage, true);
	})
	.then(function(){
		User.findOne({_id: sender._id})
            .populate({
                path: 'community',
                select: 'name _id',
            })
            .populate({
                path: 'requests',
                match: {status: {$ne: Data.getRequestStatus().canceled}},
                select: Data.getRequestData(),
                populate: [{path: 'user1', select: Data.getRequestUserData(), match: {_id: {$ne: sender._id}} },{path: 'user2', select: Data.getRequestUserData(), match: {_id: {$ne: sender._id}} }]
            })
            .exec(function (err, user) {
                if (err){
                    console.log("couldn't find user but Message was sent" + err);
                    error.message = "couldn't find user but Message was sent";
                    res.json(error);
                }
                else{
                    res.json(user);
                }
		});
	},function(err){
		res.json(err);
	});
});

router.post('/sendRequest', function(req, res) {
	req.body.user1 = req.user._id;
	let id = req.user._id;
    requestsService.sendRequest(req.body).then(function(){
        User.findOne({_id: req.user._id}, Data.getVisibleUserData().restricted)
            .populate({
                path: 'community',
                select: 'name _id',
            })
            .populate({
                path: 'requests',
                match: {status: {$ne: Data.getRequestStatus().canceled}},
                select: Data.getRequestData(),
                populate: [{path: 'user1', select: Data.getRequestUserData(), match: {_id: {$ne: id}} },{path: 'user2', select: Data.getRequestUserData(), match: {_id: {$ne: id}} }]
            })
            .exec(function (err, user) {
                if (err){
                    error.message = err;
                    return res.json(error);
                }
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
        User.findOne({_id: req.user._id}, Data.getVisibleUserData().restricted)
            .populate({
                path: 'community',
                select: 'name _id',
            })
            .populate({
                path: 'requests',
                match: {status: {$ne: Data.getRequestStatus().canceled}},
                select: Data.getRequestData(),
                populate: [{path: 'user1', select: Data.getRequestUserData(), match: {_id: {$ne: userId}} },{path: 'user2', select: Data.getRequestUserData(), match: {_id: {$ne: userId}} }]
            })
            .exec(function (err, user) {
                if (err){
                    error.message = err;
                    return res.json(error);
                }
                res.json(user);
            });
        },
        function(err){
            error.message = err;
            res.json(error);
        });
});

router.post('/readMessage', function(req, res) {
    let recipientId = req.body.recipientId;
    let senderId = req.user._id;
    markedMessageRead(senderId, recipientId).then(function(){
            res.json({status: 'success', message: 'read'});
        },
        function(err){
            res.json(err);
        });
});

function saveMessage(senderId, recipientId, messageId, message, markedRead){
   return messageService.saveMessage(senderId, recipientId, messageId, message, markedRead);
}

function markedMessageRead(senderId, recipientId){
    let deferd = Q.defer();
    User.findOne({_id: senderId})
        .then(function (sender) {
            if (!sender._id){
                error.message = "Request not sent";
                throw new Error(error.message);
            }
            else {
                let messageIndex = findMessage(sender.messages, recipientId);
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
                let messageIndex = findMessage(recipient.messages, senderId);
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
	for(let i = 0; i < messages.length; i++){
        let message = messages[i];
		if(message.id == id){
			return i;
		}
	}
	return -1;
}


module.exports = router;
