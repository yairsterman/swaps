let User = require('../models/User.js');
let Request = require('../models/Request.js');
let Q = require('q');
let dateFormat = require('dateformat');
let email = require('../services/email.js');
let emailMessages = require('../services/email-messages.js');
let MessageService = require('../services/messageService.js');
let Data = require('../user_data/data.js');


const DAY = 1000*60*60*24;

const USER_UNAVAILABLE = {code:409, msg:'You have already booked these dates'};
const REQUEST_UNAVAILABLE = {code:411, msg:'The dates you requested have already been booked by the user'};

let error = {
    error: true,
    message: ''
};

/**
 * Send and save a new swap request on both of the users
 *
 * @param params - all relevant information for the request
 */
module.exports.sendRequest = function(params) {
    let senderId = params.user1;
    let recipientId = params.user2;
    let guests = params.guests;
    let recipient ={};
    let now = Date.now();
    let departure;
    let returnDate;
    let message;
    let newMessage;
    let dates;
    let nights;

    let dfr = Q.defer();
    if(params.dates){
        dates = params.dates.split('-'); // dates are in format '11/11/2011-12/12/2012'
        departure = Date.parse(dates[0].trim());
        returnDate = Date.parse(dates[1].trim());
        nights = calculateNightsBetween(departure, returnDate);
    }
    else{
        error.message = "No dates specified";
        return dfr.reject(error);
    }
    checkAvailability(senderId, recipientId, departure, returnDate)
    .then(function() {
        return saveRequest(senderId, recipientId, departure, returnDate, Data.getRequestStatus().pending, params.transactionId);
    })
    .then( function({sender, recipient}){
        email.sendMail([recipient.email],'New Swap Request!', emailMessages.request(recipient, sender, {departure:departure,returnDate:returnDate}, nights, params.message));

        email.sendMail([sender.email],'Swap Request Sent', emailMessages.requestSent(sender, recipient));

        message = 'SWAP REQUEST:<br>' + sender.firstName+ ' Requested to swap for ' + nights + (nights >1?' Nights':' Night') + '<br>' +
            'Check in: ' + dates[0] +'<br>' +
            'Check out: ' + dates[1] +'<br>' +
            (params.message?sender.firstName + ' Says: ' + params.message:'') + '<br>';
        newMessage = {
            id: sender._id,
            date: now,
            isRequest: true,
            message: message
        };
        return MessageService.saveMessage(senderId, recipientId, senderId, newMessage, false);
    })
    .then( function(){
        return MessageService.saveMessage(recipientId, senderId, senderId, newMessage, true);
    })
    .then(function(){
        dfr.resolve();
    },function(err){
        dfr.reject();
    });
    return dfr.promise;
};

module.exports.confirm = function(params) {
    var recipientId = req.body.recipientId;
    var sender = req.user;
    var departure = req.body.departure;
    var returnDate = req.body.returnDate;
    var now = Date.now();
    var newMessage = {
        date: now,
        isRequest: false,
        message: 'Request Confirmed'
    }
    checkAvailability(sender._id, recipientId, departure, returnDate).then(function(){
        return confirmRequest(sender._id, recipientId, departure, returnDate);
    }).then(function(){
        return saveMessage(sender._id, recipientId, sender._id, newMessage, false);
    })
        .then(function(){
            return saveMessage(recipientId, sender._id, sender._id, newMessage, true);
        })
        .then(function(){
            User.findOne({_id: sender._id}, function (err, updatedUser) {
                if (err){
                    console.log("couldn't find user but Confirm was sent" + err);
                    error.message = "couldn't find user but Confirm was sent";
                    res.json(error);
                }
                else{
                    res.json(updatedUser);
                }
            });
        },function(err){
            res.json(err);
        });
};

module.exports.cancel = function(params) {
    var recipientId = req.body.recipientId;
    var sender = req.user;
    var departure = req.body.departure;
    var returnDate = req.body.returnDate;
    var message = req.body.message;
    cancelRequest(sender._id, recipientId, departure, returnDate, message).then(function(){
            res.json({status: 'success', message: 'canceled'});
        },
        function(err){
            res.json(err);
        });
};

/**
 * Save request to DB then add the request id to both of the users
 *
 * @param senderId - id of user sending the request
 * @param recipientId - id of user recieving the request
 * @param departure - departue date
 * @param returnDate - return date
 * @param status - request status
 * @param transaction - transaction id of the sender
 */
function saveRequest(senderId, recipientId, departure, returnDate, status, transaction){
    let defferd = Q.defer();

    let request = new Request({
        user1: senderId,
        user2: recipientId,
        checkin: departure,
        checkout : returnDate - DAY, // book only the nights, without checkout date
        transactionUser1: transaction,
        status: status
    });
    let requestObj = {};
    let sender = {};
    let recipient = {};
    let requestId;
    request.save(function (err, request) {
        if (err)
            return defferd.reject(err);
        requestId = request._id;
        // save request to first user
        User.findOneAndUpdate({_id: senderId}, { $push: { requests: requestId}})
        .then(function(_sender){
            if (!_sender)
                return defferd.reject(err);
            sender = _sender;
            return User.findOneAndUpdate({_id: recipientId}, { $push: { requests: requestId}});
        })
        .then(function(_recipient){
            if (!_recipient)
                return defferd.reject(err);
            recipient = _recipient;
            defferd.resolve({sender, recipient});
        },function(err){
            defferd.reject(err);
        });
    })
    return defferd.promise;
}

function confirmRequest(senderId, recipientId, departure, returnDate){
    var deferd = Q.defer();
    let sender = {};
    let recipient = {};
    let dates = {
        departure: departure,
        returnDate: returnDate
    };
    User.findOne({_id: senderId})
        .then(function (_sender) {
            sender = _sender;
            if (!sender){
                error.message = "confirmation not sent";
                throw new Error(error.message);
            }
            else {

                var requestIndex = findRequest(sender.requests, recipientId, departure, returnDate);
                if(requestIndex == -1){
                    error.message = "no request found";
                    throw new Error(error.message);
                }
                else{
                    sender.requests[requestIndex].status = Data.getRequestStatus().confirmed;
                    var updatedInfo = updateDates(sender.travelingInfo, sender.travelingDest, departure, returnDate);
                    return User.update({_id: sender._id}, {$set: {requests: sender.requests, travelingInfo: updatedInfo._travelingInfo, travelingDest: updatedInfo.travelingDest}});
                }
            }
        })
        .then(function (updated) {
            if (!updated.ok) {
                error.message = "confirmation not sent";
                throw new Error(error.message);
            }
            else {
                return User.findOne({_id: recipientId});
            }
        })
        .then(function(_recipient){
            recipient = _recipient;
            if (!recipient){
                error.message = "confirmation not sent";
                throw new Error(error.message);
            }
            else{
                var requestIndex = findRequest(recipient.requests, senderId, departure, returnDate);
                if(requestIndex == -1){
                    error.message = "no request found";
                    throw new Error(error.message);
                }
                else{
                    recipient.requests[requestIndex].status = Data.getRequestStatus().confirmed;
                    var updatedInfo = updateDates(recipient.travelingInfo, recipient.travelingDest, departure, returnDate);
                    return User.update({_id: recipient._id}, {$set: {requests: recipient.requests, travelingInfo: updatedInfo._travelingInfo, travelingDest: updatedInfo.travelingDest}});                }
            }
        })
        .then(function (updated) {
            if (!updated.ok){
                console.log("confirmation not sent" + err);
                error.message = "confirmation not sent";
                deferd.reject(error);
            }
            else{
                console.log("updated DB");
                email.sendMail([sender.email],'Swap Confirmation', emailMessages.confirmation(sender, recipient, dates));
                email.sendMail([recipient.email],'Swap Confirmation', emailMessages.confirmation(recipient, sender, dates));
                deferd.resolve();
            }
        },function(err){
            deferd.reject(err);
        });
    return deferd.promise;
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
    for(let i = 0; i < requests.length; i++){
        let request = requests[i];
        if(request.userId == id.toString() && request.departure == departure && request.returnDate == returnDate){
            return i;
        }
    }
    return -1;
}

/**
 * Check if given dates are available for anyone of the users
 *
 * @param senderId - Id of request sender
 * @param recipientId - Id of request recepient
 * @param departure - departure date in ms
 * @param returnDate - return date in ms
 */
function checkAvailability(senderId, recipientId, departure, returnDate){
    let dfr = Q.defer();
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

/**
 * Checks all confirmed swap dates of a user to see if given time
 * frame is available
 *
 * @param requests - the user's requests
 * @param departure - departure date being examined
 * @param returnDate - return date being examined
 * @return {boolean} - true if dates are available
 */
function checkConfirmationDates(requests, departure, returnDate){
    let confirmations = requests.filter(function(request){
        return request.status == Data.getRequestStatus().confirmed;
    });
    let available = true;
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

/**
 * calculate how many nights are between the two dates
 * @param date1 - first date
 * @param date2 - second date
 * @return {number} number of nights
 */
function calculateNightsBetween(date1, date2) {
    var DAYS = 1000 * 60 * 60 * 24;
    var date1_ms = date1;
    var date2_ms = date2;
    var difference_ms = Math.abs(date1_ms - date2_ms);
    return Math.ceil(difference_ms / DAYS);
}