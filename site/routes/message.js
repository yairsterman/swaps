var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User.js');
var Q = require('q');

var error = {
	error: true,
	message: ''
};

router.post('/sendMessage', function(req, res, next) {
	var recipientId = req.body.recipientId;
	var sender = req.body.user;
	var message = req.body.message;
	var now = Date.now();
	var newMessage = {
				date: now,
				read: false,
				isRequest: false,
				message: message
			}

	saveMessage(sender._id, recipientId, sender._id, newMessage).then(function(){
		return saveMessage(recipientId, sender._id, sender._id, newMessage);
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

router.post('/sendRequest', function(req, res, next) {
	var recipientId = req.body.recipientId;
	var sender = req.body.user;
	var now = Date.now();
	var departure;
	var returnDate;
	var message;
	console.log(req.body.dates);
	if(req.body.dates){
		message = 'Requested to swap on ' + req.body.dates;
		var dates = req.body.dates.split('-');
		departure = Date.parse(dates[0].trim());
		returnDate = Date.parse(dates[1].trim());
		request = true;
		console.log(message);
		console.log(departure);
		console.log(returnDate);
	}
	var newMessage = {
				id: sender._id,
				date: now,
				read: false,
				isRequest: true,
				message: message
			}

    saveRequest(sender._id, recipientId, departure, returnDate, 'Confirm')
	.then(function(){
		return saveRequest(recipientId, sender._id, departure, returnDate, 'Pending');
	})
	.then( function(){
		return saveMessage(sender._id, recipientId, sender._id, newMessage);
	})
	.then( function(){
		return saveMessage(recipientId, sender._id, sender._id, newMessage);
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

router.post('/confirmRequest', function(req, res, next) {
	var recipientId = req.body.recipientId;
	var sender = req.body.user;
});

function saveMessage(senderId, recipientId, messageId, message){
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
						if(user._id){
							var messages = user.messages;
							var index = -1;
							// find messages by sender
							for(var i = 0; i < messages.length; i++){
								if(messages[i].id.toString() === sender._id.toString()){
									messages[i].messages.push(message);
									index = i;
									break;
								}
							}
							// no messages found by that user, create new chat
							if(index == -1){
								messages.unshift({
									id: sender._id,
									image: sender.image,
									name: sender.firstName + ' ' + sender.lastName,
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
									defferd.resolve();
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

function saveRequest(senderId, recipientId, departure, returnDate, status){
	var defferd = Q.defer();
	User.findOne({_id: senderId}, function (err, sender) {
		if (err){
			error.message = "Request not sent";
			defferd.reject(error);
		}
		else{
			if(sender._id){
				User.findOne({_id: recipientId}, function (err, user) {
					if (err){
						error.message = "Request not sent";
						defferd.reject(error);
					}
					else{
						if(user._id){
							var requests = user.requests;
							var index = -1;

							requests.unshift({
								id: sender._id,
								image: sender.image,
								name: sender.firstName + ' ' + sender.lastName,
								city: sender.city,
								departure: departure,
								returnDate : returnDate,
								status: status
							});

							User.update({_id: recipientId}, { $set: { requests: requests}}, function (err, updated) {
								if (err){
									console.log("Request not sent" + err);
									error.message = "Request not sent";
									defferd.reject(error);
								}
								else{
									console.log("updated DB");
									defferd.resolve();
								}
							});
						}
						else{
							error.message = "Request not sent";
							defferd.reject(error);
						}
					}
				});
			}
		}
	});
	return defferd.promise;
}

module.exports = router;
