let Requests = require('./../models/Request');
let User = require('./../models/User');
let data = require('./../user_data/data');
let email = require('./../services/email');
let emailMessages = require('./../services/email-messages');
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
 * run through all requests that are pending and if the check in date passed
 * change the status to canceled and send a mail to the user
 */
module.exports.emailPassedPendingRequests = function () {
    Requests.find({status: data.getRequestStatus().pending}, function (err, requests) {
        if (err) return err;
        let now = moment.utc().valueOf();
        requests.forEach(function (request) {
            if (request.checkin < now) {
                request.update({status: data.getRequestStatus().canceled}).then(function () {
                    User.findOne({_id: request.user1}, function (err, user) {
                        if (err) return err;
                        if (user.email) {
                            email.sendMail("stermaneran@gmail.com", 'fix this!!', emailMessages.confirmation(user));
                        }
                    });
                });
            }
        })
    });
};


//todo: can merge this with the one on top
//find all pending requests that have 7, 3, 1 days till expire and update user 2
module.exports.PendingRequestsReminder = function () {
    Requests.find({status: data.getRequestStatus().pending}, function (err, requests) {
        if (err) return err;
        requests.forEach(function (request) {
            let diff = util.calculateNightsBetween(request.updated_at, now);
            User.findOne({_id: request.user2}, function (err, user) {
                if (err) return err;
                if (user.email) {
                    switch (diff) {
                        case 7:
                            console.log("SEVEN");
                            email.sendMail("stermaneran@gmail.com", 'fix this!!', emailMessages.confirmation(user));
                            break;
                        case 3:
                            console.log("THREE");
                            email.sendMail("stermaneran@gmail.com", 'fix this!!', emailMessages.confirmation(user));
                            break;
                        case 1:
                            console.log("ONE");
                            email.sendMail("stermaneran@gmail.com", 'fix this!!', emailMessages.confirmation(user));
                            break;
                        default:
                            break;
                    }
                }
            });
        })
    });
};


//run through all requests that are confirmed and update the 2 user (?) in 7, 3, 1 day left for swap
module.exports.emailConfirmedRequests = function () {
    Requests.find({status: data.getRequestStatus().confirmed}, function (err, requests) {
        if (err) return err;
        requests.forEach(function (request) {
            let diff = util.calculateNightsBetween(request.updated_at, now);
            User.findOne({_id: request.user2}, function (err, user) {
                if (err) return err;
                if (user.email) {
                    switch (diff) {
                        case 7:
                            console.log("SEVEN");
                            email.sendMail("stermaneran@gmail.com", 'fix this!!', emailMessages.confirmation(user));
                            break;
                        case 3:
                            console.log("THREE");
                            email.sendMail("stermaneran@gmail.com", 'fix this!!', emailMessages.confirmation(user));
                            break;
                        case 1:
                            console.log("ONE");
                            email.sendMail("stermaneran@gmail.com", 'fix this!!', emailMessages.confirmation(user));
                            break;
                        default:
                            break;
                    }
                }
            });
        })
    });
};


/**
 * Find all swaps are completed
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
                if(user[0]._id == request.user2){
                    user2 = user[0];
                    user1 = user[1];
                }
                // if (!request.tokenUser1) {
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
                            email.sendMail(['yair@swapshome.com'], 'Review your Swap', emailMessages.review(user2, t1));
                            console.log("email sent");
                            // email.sendMail([user1.email], 'Review your Swap', emailMessages.review(user2, t1));
                        }
                        if (user2.email) {
                            email.sendMail(['yair@swapshome.com'], 'Review your Swap', emailMessages.review(user1, t2));
                            console.log("email sent");
                            // email.sendMail([user2.email], 'Review your Swap', emailMessages.review(user1, t2));
                        }
                    });
                // }
                // else {
                //     switch (diff) {
                //         case 3:
                //             if (request.tokenUser2 && request.tokenUser2 != !config.EXPIRED_TOKEN) {
                //                 if (user2.email) {
                //                     email.sendMail(['yair@swapshome.com'], 'Review Swap Reminder', emailMessages.reviewReminder(user1, request.tokenUser2));
                //                     console.log("email sent");
                //                     // email.sendMail([user2.email], 'Review your Swap', emailMessages.review(user1, t2));
                //                 }
                //             }
                //             if (request.tokenUser1 && request.tokenUser1 != !config.EXPIRED_TOKEN) {
                //                 if (user1.email) {
                //                     email.sendMail(['yair@swapshome.com'], 'Review your Swap', emailMessages.review(user2, request.tokenUser1));
                //                     console.log("email sent");
                //                     // email.sendMail([user1.email], 'Review your Swap', emailMessages.review(user2, t1));
                //                 }
                //             }
                //             break;
                //         case 4:
                //             request.update({tokenUser1: config.EXPIRED_TOKEN, tokenUser2: config.EXPIRED_TOKEN, status: data.getRequestStatus().complete})
                //                 .then(function(){
                //
                //                 });
                //             break;
                //         default:
                //             break;
                //     }
                // }
            });
        })
    });
};
