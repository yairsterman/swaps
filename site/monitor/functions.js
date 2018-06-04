let Requests = require('./../models/Request');
let User = require('./../models/User');
let data = require('./../user_data/data');
let email = require('./../services/email');
let emailMessages = require('./../services/email-messages');
let moment = require('moment');
let util = require('./../utils/util');
let jwt = require('jsonwebtoken');

let now = moment.utc().valueOf();

//at midnight run through all the users and if the returnDate of the travelingInformation is passed remove it from the list
module.exports.updateTravelingInformation = function () {
    User.find({}, function (err, users) {
        if (err) return err;
        let updated = false;
        users.forEach(function (user) {
            let i = user.travelingInformation.length - 1;
            while (i >= 0) {
                let returnDate = user.travelingInformation[i].returnDate;
                let departureDate = user.travelingInformation[i].departure;
                if (!returnDate || returnDate < now) {
                    user.travelingInformation.splice(i, 1);
                    updated = true;
                }
                else if (!departureDate || departureDate < now) {
                    departureDate = now;
                    user.travelingInformation[i].dates = moment(departureDate).utc().format('MMM DD') + "-" + moment(returnDate).utc().format('MMM DD');
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


//at midnight run through all requests that are pending and if the check in date passed
//change the status to canceled and send a mail to the user
module.exports.emailPassedPendingRequests = function () {
    Requests.find({status: data.getRequestStatus().pending}, function (err, requests) {
        if (err) return err;
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



//
module.exports.emailReview = function () {
    Requests.find({status: data.getRequestStatus().confirmed}, function (err, requests) {
        if (err) return err;
        requests.forEach(function (request) {
            let diff = util.calculateNightsBetween(now, request.checkout);
            User.find({$or: [{_id: request.user1}, {_id: request.user2}]}, function (err, user) {
                if (err) return err;
                if (request.tokenUser1 === "" && diff === 1) {
                    let t1 = jwt.sign({
                        expiresIn: '7d',
                        data: request.id + "1"
                    }, 'swaps');

                    let t2 = jwt.sign({
                        expiresIn: '7d',
                        data: request.id + "1"
                    }, 'swaps');

                    request.update({tokenUser1: t1, tokenUser2 :t2}).then(function () {
                        User.findOne({_id: request.user1},function (err, user) {
                            if (err) return err;
                            if(user.email){
                                email.sendMail("stermaneran@gmail.com", 'fix this!!', emailMessages.confirmation(user));
                            }
                        });
                        User.findOne({_id: request.user2},function (err, user) {
                            if (err) return err;
                            if(user.email){
                                email.sendMail("stermaneran@gmail.com", 'fix this!!', emailMessages.confirmation(user));
                            }
                        });

                    });
                }
                else {
                    switch (diff) {
                        case 7:
                            if (request.tokenUser2 !== 'done') {
                                //resend email to user 2
                            }
                            if (request.tokenUser1 !== 'done') {
                                //resend email to user 1
                            }
                            break;
                        case 3:
                            if (request.tokenUser2 !== 'done') {
                                //resend email to user 2
                            }
                            if (request.tokenUser1 !== 'done') {
                                //resend email to user 1
                            }
                            break;
                        default:
                            break;
                    }
                }
        });
    })
});
};




module.exports.test = function (token) {
    jwt.verify(token, "swaps", function (err, decoded) {
        if (err) {
            console.log("error");
        }
        let requestID = (decoded.data.substring(0, (decoded.data.length - 1)));
        let user = (decoded.data.substring((decoded.data.length - 1), (decoded.data.length)));
        Requests.findOne({_id: requestID},function (err, request) {
            if(user === "1"){
                //Review belongs to user 1
                request.update({tokenUser1: 'done'}).then(function () {
                    console.log('user 1 gave review')
                })
            }
            else{
                //Review belongs to user 2
                request.update({tokenUser2: 'done'}).then(function () {
                    console.log('user 2 gave review')
                })
            }
        });
    });
};