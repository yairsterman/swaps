let Requests = require('./../models/Request');
let User = require('./../models/User');
let data = require('./../user_data/data');
let email = require('./../services/email');
let emailMessages = require('./../services/email-messages');
let requestService = require('./../services/requestsService');
let moment = require('moment');
let util = require('./../utils/util');
let jwt = require('jsonwebtoken');
let config = require('./../config');

const DAY = 1000 * 60 * 60 * 24;// one day in milliseconds
/**
 * Updates all users traveling information.
 * If departure date has passed then update new departure to today.
 * If return date has passed then remove information from the array.
 */
module.exports.updateTravelingInformation = function () {
    User.find({}, function (err, users) {
        if (err) return err;
        let updated = false;
        let now = moment.utc().valueOf();
        users.forEach(function (user) {
            let i = user.travelingInformation.length - 1;
            while (i >= 0) {
                let returnDate = user.travelingInformation[i].returnDate;
                let departureDate = user.travelingInformation[i].departure;
                if (returnDate < now) {
                    user.travelingInformation.splice(i, 1);
                    updated = true;
                }
                else if (departureDate < now) {
                    departureDate = moment.utc().set({hour:0, minute:0, second:0 ,millisecond:0}).valueOf() + DAY;
                    user.travelingInformation[i].departure = departureDate;
                    user.travelingInformation[i].dates = moment(departureDate).utc().format('MMM DD') + " - " + moment(returnDate).utc().format('MMM DD');
                    updated = true;
                }
                i -= 1;
            }
            if (updated) {
                let newInfo = user.travelingInformation;
                user.update({travelingInformation: newInfo}).then(function () {
                    console.log("updated user!");
                });
                updated = false;
            }
        });
    });
};


/**
 * run through all requests that are pending and if the check in date
 * has passed cancel the request.
 * If the request hasn't been responded to yet send reminder emails
 */
module.exports.emailPendingRequests = function () {
    Requests.find({status: data.getRequestStatus().pending})
        .populate({
            path: 'user1',
        })
        .populate({
            path: 'user2',
        })
        .exec(function (err, requests) {
            if (err) return err;
            let now = moment.utc().valueOf();
            requests.forEach(function (request) {
                if (request.proposition.checkin < now) { // or a week after the request was sent
                    requestService.cancelRequest(request._id, request.user1._id, '', true);
                }
                else{
                    let diff = util.calculateNightsBetween(moment.utc(request.updated_at).valueOf(), now);
                    if (request.user2.email) {
                        switch (diff) {
                            case 1:
                                email.sendMail(request.user2.email, 'Swap Request Pending', emailMessages.pendingRequestReminder(request.user1));
                                break;
                            case 3:
                                email.sendMail(request.user2.email, 'Swap Request Pending', emailMessages.pendingRequestReminder(request.user1));
                                break;
                            case 6:
                                email.sendMail(request.user2.email, 'Swap Request Pending', emailMessages.pendingRequestReminder(request.user1, true));
                                break;
                            case 7:
                                requestService.cancelRequest(request._id, request.user1._id, '', true);
                                break;
                            default:
                                break;
                        }
                    }
                }
            })
    });
};


/**
 * run through all requests that are accepted and if the check in date
 * has passed cancel the request.
 * If the request hasn't been confirmed yet, send reminder emails.
 */
module.exports.emailAcceptedRequests = function () {
    Requests.find({status: data.getRequestStatus().accepted})
        .populate({
            path: 'user1',
        })
        .populate({
            path: 'user2',
        })
        .exec(function (err, requests) {
            if (err) return err;
            let now = moment.utc().valueOf();
            requests.forEach(function (request) {
                if (request.checkin < now) { // or a week after the request was sent
                    requestService.cancelRequest(request._id, request.user1._id, '', true);
                }
                else{
                    let diff = util.calculateNightsBetween(moment.utc(request.updated_at).valueOf(), now);
                    if (request.user1.email) {
                        switch (diff) {
                            case 1:
                                email.sendMail(request.user1.email, 'Swap Request unconfirmed', emailMessages.acceptedRequestReminder(request.user2));
                                break;
                            case 3:
                                email.sendMail(request.user1.email, 'Swap Request unconfirmed', emailMessages.acceptedRequestReminder(request.user2));
                                break;
                            case 6:
                                email.sendMail(request.user1.email, 'Swap Request unconfirmed', emailMessages.acceptedRequestReminder(request.user2, true));
                                break;
                            case 7:
                                requestService.cancelRequest(request._id, request.user2._id, '', true);
                                break;
                            default:
                                break;
                        }
                    }
                }
            })
        });
};


/**
 * run through all confirmed request and send reminder emails before the swap
 *
 */
module.exports.emailConfirmedRequests = function () {
    Requests.find({status: data.getRequestStatus().confirmed})
        .populate({
            path: 'user1',
        })
        .populate({
            path: 'user2',
        })
        .exec(function (err, requests) {
            if (err) return err;
            let now = moment.utc().valueOf();
            requests.forEach(function (request) {
                if (request.checkin < now) {
                    return;
                }
                let diff = util.calculateNightsBetween(now, request.checkin);
                if (request.user1.email) {
                    switch (diff) {
                        case 7:
                            email.sendMail(request.user1.email, 'Swap Coming Up', emailMessages.confirmedRequestReminder(request.user2, request.city2, 1));
                            break;
                        case 3:
                            email.sendMail(request.user1.email, 'Get Ready to Swap!', emailMessages.confirmedRequestReminder(request.user2, request.city2,0, 3));
                            break;
                        case 1:
                            email.sendMail(request.user1.email, 'Last preparations for your swap tomorrow', emailMessages.confirmedRequestReminder(request.user2, request.city2, 0, 1));
                            break;
                        default:
                            break;
                    }
                }
                if (request.user2.email) {
                    switch (diff) {
                        case 7:
                            email.sendMail(request.user2.email, 'Swap Coming Up', emailMessages.confirmedRequestReminder(request.user1, request.city1, 1, 0, request.oneWay));
                            break;
                        case 3:
                            email.sendMail(request.user2.email, 'Get Ready to Swap!', emailMessages.confirmedRequestReminder(request.user1, request.city1, 0, 3, request.oneWay));
                            break;
                        case 1:
                            email.sendMail(request.user2.email, 'Last preparations for your swap tomorrow', emailMessages.confirmedRequestReminder(request.user1, request.city1, 0, 1, request.oneWay));
                            break;
                        default:
                            break;
                    }
                }
            })
        });
};


/**
 * Find all swaps that are completed and send a review email to both users.
 * After three days - if the user hasn't written a review send a reminder email.
 * After 4 days - if the user hasn't written a review, disable the review token
 *                and mark the request as complete.
 */
module.exports.emailReview = function () {
    let now = moment.utc().valueOf();
    Requests.find({status: data.getRequestStatus().confirmed, checkout: {'$lt': now - DAY}}, function (err, requests) {
        if (err) return err;
        requests.forEach(function (request) {
            let diff = util.calculateNightsBetween(now, request.checkout);
            User.find({$or: [{_id: request.user1}, {_id: request.user2}]}, function (err, user) {
                if (err) return err;
                let user1 = user[0];
                let user2 = user[1];
                if(user[0]._id.toString() == request.user2.toString()){
                    user2 = user[0];
                    user1 = user[1];
                }
                if (!request.tokenUser1) {
                    let t1 = jwt.sign({
                        expiresIn: moment(new Date()).add(7, 'days').utc().valueOf(),
                        reqId: request.id,
                        user: "1"
                    }, config.jwtSecret);

                    let t2 = jwt.sign({
                        expiresIn: moment(new Date()).add(7, 'days').utc().valueOf(),
                        reqId: request.id,
                        user: "2"
                    }, config.jwtSecret);

                    request.update({tokenUser1: t1, tokenUser2: t2}).then(function () {
                        if (user1.email) {
                            // email.sendMail(['yair@swapshome.com'], 'Review your Swap', emailMessages.review(user2, t1));
                            // console.log("email sent");
                            email.sendMail([user1.email], 'Review your Swap', emailMessages.review(user2, t1));
                        }
                        if (user2.email) {
                            // email.sendMail(['yair@swapshome.com'], 'Review your Swap', emailMessages.review(user1, t2));
                            // console.log("email sent");
                            email.sendMail([user2.email], 'Review your Swap', emailMessages.review(user1, t2));
                        }
                    });
                }
                else {
                    switch (diff) {
                        case 3:
                            if (request.tokenUser2 && request.tokenUser2 != config.EXPIRED_TOKEN) {
                                if (user2.email) {
                                    // email.sendMail(['yair@swapshome.com'], 'Review Swap Reminder', emailMessages.reviewReminder(user1, request.tokenUser2));
                                    // console.log("email sent");
                                    email.sendMail([user2.email], 'Review Swap Reminder', emailMessages.reviewReminder(user1, request.tokenUser2));
                                }
                            }
                            if (request.tokenUser1 && request.tokenUser1 != config.EXPIRED_TOKEN) {
                                if (user1.email) {
                                    // email.sendMail(['yair@swapshome.com'], 'Review your Swap', emailMessages.review(user2, request.tokenUser1));
                                    // console.log("email sent");
                                    email.sendMail([user1.email], 'Review Swap Reminder', emailMessages.reviewReminder(user2, request.tokenUser1));
                                }
                            }
                            break;
                        case 4:
                            request.update({tokenUser1: config.EXPIRED_TOKEN, tokenUser2: config.EXPIRED_TOKEN, status: data.getRequestStatus().complete})
                                .then(function(){

                                });
                            break;
                        default:
                            break;
                    }
                }
            });
        })
    });
};

module.exports.completeProfile = function(){
    User.find({_id:{$in:['5cc9608a533b8b037a79dd9c','5cce65cc2005d81470868180','5cce6d292005d81470868184','5cd13de3896ea240d48b5421','5cd14275896ea240d48b5422','5cd6e54d9ab19d59bae18f96','5cd6eabf9ab19d59bae18f97','5cd833a19ab19d59bae18f98','5cd850929ab19d59bae18f99','5cd8ed719ab19d59bae18f9a','5cd97ff49ab19d59bae18f9b','5cd9cbf99ab19d59bae18f9c','5cd9d9469ab19d59bae18f9d','5ce102c021f5e91a482052f5','5ce53fe2f607154ea65522f9','5ce60948f607154ea65522fb','5ce946adf607154ea65522fc','5ce95edef607154ea65522fd','5cea0f0af607154ea65522ff','5cea39cdf607154ea6552300','5cea59cdf607154ea6552301','5ceaba11f607154ea6552302','5ceadaa3f607154ea6552303','5ceaeec7f607154ea6552304','5ceb1f8ff607154ea6552306','5ceb51bef607154ea6552307','5ceb6abdf607154ea6552308','5ceb6e60f607154ea6552309','5ceb70abf607154ea655230a','5ceb885ef607154ea655230c']}}, function (err, users) {
        users.forEach(function (user) {
            email.sendMail([user.email], 'Complete Your Profile - Start Swapping!', emailMessages.completeProfile(user));
        });
    });
};
