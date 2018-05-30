let User = require('../models/User.js');
let Request = require('../models/Request.js');
let Q = require('q');
let dateFormat = require('dateformat');
let email = require('../services/email.js');
let emailMessages = require('../services/email-messages.js');
let MessageService = require('../services/messageService.js');
let transactionService = require('../services/transactionsService.js');
let Data = require('../user_data/data.js');
let util = require('../utils/util.js');
let moment = require('moment');

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
        departure = moment.utc(dates[0].trim(), "MM/DD/YYYY").valueOf();
        returnDate = moment.utc(dates[1].trim(), "MM/DD/YYYY").valueOf();
        nights = util.calculateNightsBetween(departure, returnDate);
    }
    else{
        error.message = "No dates specified";
        return dfr.reject(error);
    }
    checkAvailability(senderId, recipientId, departure, returnDate)
    .then(function() {
        let requestDetails = {
            senderId: senderId,
            recipientId: recipientId,
            departure: departure,
            returnDate: returnDate,
            status: Data.getRequestStatus().pending,
            guests: guests,
            nights: nights,
            plan: params.plan,
            transactionId: params.transactionId,
        };
        return saveRequest(requestDetails);
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
        dfr.reject(err);
    });
    return dfr.promise;
};

module.exports.confirm = function(params) {

    let dfr = Q.defer();
    let recipient = {};
    let sender = {};
    let dates = {};

    let now = Date.now();
    let newMessage = {
        date: now,
        isRequest: false,
        message: 'Request Confirmed'
    };

    chargeUsers(params).then(function(results){
        return confirmRequest(results);
    }).then(function(result){
        sender = result.sender;
        recipient = result.recipient;
        dates = result.dates;
        return updateUserTravelInfo(sender, dates);
    })
    .then(function(){
        return updateUserTravelInfo(recipient, dates);
    })
    .then(function(){
        return MessageService.saveMessage(sender._id, recipient._id, sender._id, newMessage, false);
    })
    .then(function(){
        return MessageService.saveMessage(recipient._id, sender._id, sender._id, newMessage, true);
    })
    .then(function(){
        dfr.resolve();
    },function(err){
        dfr.reject(err);
    });

    return dfr.promise;
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
function saveRequest(requestDetails){
    let defferd = Q.defer();

    let request = new Request({
        user1: requestDetails.senderId,
        user2: requestDetails.recipientId,
        checkin: requestDetails.departure,
        checkout : requestDetails.returnDate,
        verifyTransactionUser1: requestDetails.transactionId,
        guests1: requestDetails.guests,
        nights: requestDetails.nights,
        plan: requestDetails.plan,
        status: requestDetails.status
    });
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
            // save request to second user
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

/**
 * Confirm the request and save the new data on the request model
 *
 * @param info - verifyTransactionUser2, transactionUser1, transactionUser2, requestId
 */
function confirmRequest(info){
    let deferd = Q.defer();

    let set = {
        verifyTransactionUser2: info.verifyTransactionUser2,
        transactionUser1: info.transactionUser1,
        transactionUser2: info.transactionUser2,
        status: Data.getRequestStatus().confirmed
    };

    Request.findOneAndUpdate({_id: info.requestId}, {$set: set})
        // populate both users to get their information
        .populate({
            path: 'user1'
        })
        .populate({
            path: 'user2'
        })
        .exec(function (err, request) {
            if (err || !request) {
                let msg = err;
                if(!request){
                    msg = 'No relevant request found';
                }
                deferd.reject(msg);
            }
            else {
                let sender = request.user1;
                let recipient = request.user2;
                let dates = {
                    departure: request.checkin,
                    returnDate: request.checkout,
                };
                let result = {
                    sender: sender,
                    recipient: recipient,
                    dates: dates,
                };

                email.sendMail([sender.email],'Swap Confirmation', emailMessages.confirmation(sender, recipient, dates));
                email.sendMail([recipient.email],'Swap Confirmation', emailMessages.confirmation(recipient, sender, dates));

                deferd.resolve(result);
            }
        });

    return deferd.promise;
}

/**
 * Update the travel information of the user according to the confirmed
 * travel dates
 *
 * @param user - user to update
 * @param dates - confirmed dates
 */
function updateUserTravelInfo(user, dates){
    let updatedInfo = updateDates(user.travelingInfo, user.travelingDest, dates.departure, dates.returnDate);

    let toUpdate = {
        travelingInfo: updatedInfo._travelingInfo,
        travelingDest: updatedInfo.travelingDest
    };
    return updateUser(user, toUpdate);
}

/**
 * Remove and update user's canceled requests
 *
 * @param user - user to update
 * @param requestId - requestId to remove from requests
 */
function removeCanceledRequest(user, requestId){
    //find index
    // let index = -1;
    // user.requests.forEach(function(request, i){
    //     if(request.toString() == requestId)
    //         index = i;
    // });
    // if(index != -1){
    //     user.requests = user.requests.splice(index,1) // remove the request;
    // }
    return updateUser(user, {requests: user.requests});
}

/**
 * Update user model
 *
 * @param user - user to update
 * @param toUpdate - fields to update
 */
function updateUser(user, toUpdate){
    let dfr = Q.defer();
    User.update({_id: user._id}, {$set: toUpdate})
        .then(function (updated) {
            if (!updated.ok) {
                dfr.reject('User not updated');
            }
            else {
                dfr.resolve();
            }
        });
    return dfr.promise;
}

/**
 * Cancel or decline a swap request
 *
 * @param requestId - the request ID
 */
module.exports.cancelRequest = function(requestId, userId, message){
    let defer = Q.defer();

    let user1 = {};
    let user2 = {};
    let transaction1 = {};
    let transaction2 = {};
    let declined = false;

    getConfirmedRequest(requestId).then(function(request){
        user1 = request.user1;
        user2 = request.user2;
        transaction1 = request.transactionUser1;
        transaction2 = request.transactionUser1;
        // if status s pending and the call came from user2 then send decline message
        declined = request.status == Data.getRequestStatus().pending && userId.toString() == (user2._id).toString();

        //refund transactions
        return sendRefundTransactions(transaction1, transaction2, user1, user2, declined);
    })
    .then(function(){
        //update request
        return Request.update({_id: requestId}, {$set: {status: Data.getRequestStatus().canceled}});
    })
    .then(function(updated){
        if (!updated.ok) {
            defer.reject("Request not updated");
        }
        // update users requests
        else {
            return removeCanceledRequest(user1, requestId);
        }
    })
    .then(function(){
        return removeCanceledRequest(user2, requestId);
    })
    .then(function(){
        defer.resolve();
        if(declined){
            email.sendMail([user1.email],'Swap Declined', emailMessages.declined(user1, user2, message));
        }
        else{
            let sender;
            let recipient;
            if((user1._id).toString() == userId.toString()){
                sender = user1;
                recipient = user2;
            }
            else{
                sender = user2;
                recipient = user1;
            }
            email.sendMail([recipient.email],'Swap Canceled', emailMessages.canceled(recipient, sender, message));
            email.sendMail([sender.email],'Swap Canceled', emailMessages.canceledSent(sender, recipient));
        }
    },function(err){
        error.message = err;
        defer.reject(error);
    });

    return defer.promise;
};

/**
 * Send refund for both transactions upon canceling request.
 * if user2 is declining request then no need to send refunds
 *
 * @param transaction1 - first user transaction
 * @param transaction2 - second user transaction
 * @param user1 - first user
 * @param user2 - second user
 * @param declined - is request declined
 */
function sendRefundTransactions(transaction1, transaction2, user1, user2, declined){
    let dfr = Q.defer();
    if(declined){
        return dfr.resolve();
    }
    dfr.resolve();

    //TODO - currently transactions arent working so can't cancel them.
    // transactionService.refund(transaction1, user1._id)
    // .then(function(){
    //     return transactionService.refund(transaction2, user2._id);
    // })
    // .then(function(){
    //     dfr.resolve();
    // },function(err){
    //     dfr.reject(err);
    // });

    return dfr.promise;
}

/**
 * Charge the users with the transaction tokens saved on the request
 *
 * @param params
 */
function chargeUsers(params){
    let dfr = Q.defer();

    let requestId = params.requestId;
    let tokenUser2 = params.token;
    let guests2 = params.guests;
    let verifyTransactionUser2 = params.transactionId;
    let transactionUser1;
    let transactionUser2;

    getRequest(requestId).then(function(request){
        let user1 = request.user1;
        let user2 = request.user2;
        let tokenUser1 = request.verifyTransactionUser1.token;
        let guests1 = request.guests1;
        let nights = request.nights;
        let plan = request.plan;

        checkAvailability(user1, user2, request.checkin, request.checkout)
        .then(function() {
            return transactionService.chargeRequest(tokenUser1, user1, plan, guests1, nights);
        })
        .then(function(transactionId){
            transactionUser1 = transactionId;
            return transactionService.chargeRequest(tokenUser2, user2, plan, guests2, nights);
        })
        .then(function(transactionId){
            transactionUser2 = transactionId;
            let results = {
                requestId: requestId,
                verifyTransactionUser2: verifyTransactionUser2,
                transactionUser1: transactionUser1,
                transactionUser2: transactionUser2,
            };
            dfr.resolve(results);
        },function(err){
            dfr.reject(err);
        });
    });
    return dfr.promise;
}

/**
 * Get a request that is still pending.
 *
 * @param id - request ID
 */
function getRequest(id){
    let dfr = Q.defer();
    Request.findOne({_id: id, status: Data.getRequestStatus().pending})
        .populate({
            path: 'verifyTransactionUser1',
        })
        // TODO: populate user and user requests in order to check availability
        .exec(function (err, request) {
            if (err || !request) {
                let msg = err;
                if(!request){
                    msg = 'No relevant request found';
                }
                dfr.reject(msg);
            }
            else {
                dfr.resolve(request);
            }
        });
    return dfr.promise;
}

/**
 * Get a request that is has been confirmed.
 *
 * @param id - request ID
 */
function getConfirmedRequest(id){
    let dfr = Q.defer();
    //populate transactions in order to cancel them
    Request.findOne({_id: id})
        .populate({
            path: 'transactionUser1',
        })
        .populate({
            path: 'transactionUser2',
        })
        .populate({
            path: 'user1',// TODO: populate user requests in order to check availability
        })
        .populate({
            path: 'user2',
        })
        .exec(function (err, request) {
            if (err || !request) {
                let msg = err;
                if(!request){
                    msg = 'No relevant request found';
                }
                dfr.reject(msg);
            }
            else {
                dfr.resolve(request);
            }
        });
    return dfr.promise;
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
    // TODO: This needs updating because returnDate is the checkout date, meaning it is an available date
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
    // TODO: FIX THIS!! update to new travelingInformation structure and use moment
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
