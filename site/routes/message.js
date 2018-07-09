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

router.post('/sendMessage', function(req, res) {
	var recipientId = req.body.recipientId;
	var sender = req.user;
	var message = req.body.message;
	var now = Date.now();
	var newMessage = {
				date: now,
				isRequest: false,
				message: message
			};

	saveMessage(sender._id, recipientId, sender._id, newMessage, false).then(function(recipient){
        // email.sendMail(["stermaneran@gmail.com"],'New Message', emailMessages.message(recipient, sender));
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

function cancelRequest(senderId, recipientId, departure, returnDate, message){
    var deferd = Q.defer();
    let declined = false;
    let sender = {};
    let recipient = {};
    User.findOne({_id: senderId})
        .then(function (_sender) {
            sender = _sender;
            if (!sender._id){
                error.message = "Request not sent";
                throw new Error(error.message);
            }
            else {
                var requestIndex = findRequest(sender.requests, recipientId, departure, returnDate);
                if(requestIndex == -1){
                    error.message = "no request found";
                    throw new Error(error.message);
                }
                else{
                	if(sender.requests[requestIndex].status === Data.getRequestStatus().pending){
						declined = true;
					}
                    sender.requests[requestIndex].status = Data.getRequestStatus().canceled;
                    return User.update({_id: sender._id}, {$set: {requests: sender.requests}});
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
        .then(function(_recipient){
            recipient = _recipient;
            if (!recipient._id){
                error.message = "Request not sent";
                throw new Error(error.message);
            }
            else{
                var requestIndex = findRequest(recipient.requests, senderId, departure, returnDate);
                if(requestIndex == -1){
                    error.message = "no request found";
                    throw new Error(error.message);
                }
                else{
                    recipient.requests[requestIndex].status = Data.getRequestStatus().canceled;
                    return User.update({_id: recipient._id}, {$set: {requests: recipient.requests}});
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
                if(declined){
                    email.sendMail([recipient.email],'Swap Declined', emailMessages.declined(recipient, sender, message));
				}
				else{
                    email.sendMail([recipient.email],'Swap Canceled', emailMessages.canceled(recipient, sender, message));
                    email.sendMail([sender.email],'Swap Canceled', emailMessages.canceledSent(sender, recipient));
                }
                deferd.resolve();
            }
        },function(err){
            deferd.reject(err);
		});
    return deferd.promise;
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

function checkAvailability(senderId, recipientId, departure, returnDate){
	var dfr = Q.defer();
    User.findOne({_id: senderId})
	.then(function (sender){
		if(checkConfirmationDates(sender.requests, departure, returnDate)){
			return User.findOne({_id: recipientId})
		}
		else{
            throw USER_UNAVAILABLE;
		}
	})
	.then(function(recipient){
        if(checkConfirmationDates(recipient.requests, departure, returnDate)){
            dfr.resolve();
        }
        else{
            throw REQUEST_UNAVAILABLE;
        }
	},function(err){
        dfr.reject(err);
	});
	return dfr.promise;
}

function checkConfirmationDates(requests, departure, returnDate){
	var confirmations = requests.filter(function(request){
		return request.status == Data.getRequestStatus().confirmed;
	});
	var available = true;
    confirmations.every(function(confirmation){
    	if((confirmation.departure >= departure && confirmation.departure <= returnDate)
            || (confirmation.returnDate >= departure && confirmation.returnDate <= returnDate)
		       || (returnDate >= confirmation.departure && returnDate <= confirmation.returnDate)){
            available = false;
    		return false;
		}
		else{
    		return true;
		}
	});
    return available;
}

function updateDates(travelingInfo, travelingDest, departure, returnDate){
	var _travelingInfo = travelingInfo;
    _travelingInfo.forEach(function(info, index){
    	if(departure <= info.departure && info.returnDate <= returnDate){
            travelingInfo.splice(index, 1);
            if (travelingDest.indexOf(info.destination) != -1) {
                travelingDest.splice(travelingDest.indexOf(info.destination), 1);
            }
            return;
		}
		if(departure <= info.departure && returnDate <= info.returnDate){
            travelingInfo[index].departure = returnDate + 1000*60*60*24; // set the new departure date to a day after the end of the confirmed dates
            travelingInfo[index].dates = dateFormat(travelingInfo[index].departure, 'mmm dd') + ' - ' + dateFormat(travelingInfo[index].returnDate, 'mmm dd');
            return;
		}
		if(departure >= info.departure && departure <= info.returnDate){
            travelingInfo[index].returnDate = departure - 1000*60*60*24; // set the new return date to a day before the first confirmed date
            travelingInfo[index].dates = dateFormat(travelingInfo[index].departure, 'mmm dd') + ' - ' + dateFormat(travelingInfo[index].returnDate, 'mmm dd');
            return;
        }
	});
    return {_travelingInfo, travelingDest};
}

function calculateNightsBetween(date1, date2) {
    var DAYS = 1000 * 60 * 60 * 24;
    var date1_ms = date1;
    var date2_ms = date2;
    var difference_ms = Math.abs(date1_ms - date2_ms);
    return Math.ceil(difference_ms / DAYS);
}

module.exports = router;
