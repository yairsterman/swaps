var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User.js');

var error = {
	error: true,
	message: ''
};

router.post('/send-message', function(req, res, next) {
	var recipientId = req.body.recipientId;
	var sender = req.body.user;
	var message = req.body.message;
	var now = Date.now();
	var departure;
	var returnDate;
	var request = false;
	console.log(message);
	console.log(req.body.dates);
	if(message === '##!REQUEST!##' && req.body.dates){
		message = 'Requested to swap on ' + req.body.dates;
		var dates = req.body.dates.split('-');
		departure = Date.parse(dates[0].trim());
		returnDate = Date.parse(dates[1].trim());
		request = true;
		console.log(message);
		console.log(departure);
		console.log(returnDate);
	}
    User.findOne({_id: recipientId}, function (err, user) {
        if (err){
        	error.message = "Message not sent";
            res.json(error);
        }
        else{
            if(user._id){
            	var messages = user.messages;
				var requests = user.requests;
                var index = -1;
                var newMessage = {
            				id: sender._id,
            				date: now,
            				read: false,
							isRequest: request,
            				message: message
            			}
            	for(i = 0; i < messages.length; i++){
            		if(messages[i].id == sender._id){
            			messages[i].messages.push(newMessage);
            			index = i;
            			break;
            		}
            	}
            	if(index == -1){
            		messages.unshift({
            			id: sender._id,
            			image: sender.image,
            			name: sender.firstName + ' ' + sender.lastName,
						travelInfo: sender.travelingInfo,
            			messages: [newMessage]
            		});
            	}
				if(request){
					requests.unshift({
            			id: sender._id,
            			image: sender.image,
            			name: sender.firstName + ' ' + sender.lastName,
						city: sender.city,
						departure: departure,
						returnDate : returnDate,
						status: 'Confirm'
            		});
					console.log(requests);
				}
            	User.update({_id: recipientId}, { $set: { messages: messages, requests: requests}}, function (err, updated) {
                    if (err){
                    	console.log("Message not sent" + err);
                        error.message = "Message not sent";
            			res.json(error);
                    }
                    else{
                        console.log("updated DB");
                        User.findOne({_id: sender._id}, function (err, sender) {
					        if (err){
					        	console.log("Message not sent" + err);
					        	error.message = "Message not sent";
					            res.json(error);
					        }
					        else{
					        	var senderMessages = sender.messages;
								var senderRequests = sender.requests;
					        	index = -1;
					        	for(i = 0; i < senderMessages.length; i++){
				            		if(senderMessages[i].id == recipientId){
				            			senderMessages[i].messages.push(newMessage);
				            			index = i;
				            			break;
				            		}
				            	}
					        	if(index == -1){
				            		senderMessages.unshift({
				            			id: user._id,
				            			image: user.image,
				            			name: user.firstName + ' ' + user.lastName,
										travelInfo: user.travelingInfo,
				            			messages: [newMessage]
				            		});
				            	}
								if(request){
									senderRequests.unshift({
				            			id: user._id,
				            			image: user.image,
				            			name: user.firstName + ' ' + user.lastName,
										city: user.city,
										departure: departure,
										returnDate : returnDate,
										status: 'Pending'
				            		});
									console.log(senderRequests);
								}
				            	User.update({_id: sender._id}, { $set: { messages: senderMessages, requests: senderRequests}}, function (err, updated) {
				                    if (err){
				                    	console.log("Message sender not updated" + err);
				                        error.message = "Message not saved at sender";
				            			res.json(error);
				                    }
				                    else{
				                        console.log("updated DB");
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
				                    }
				                });
				            }
					    });
                    }
                });
            }
            else{
            	error.message = "Message not sent";
            	res.json(error);
            }
        }
	});
});

router.post('/confirm-request', function(req, res, next) {
	var recipientId = req.body.recipientId;
	var sender = req.body.user;
});

module.exports = router;
