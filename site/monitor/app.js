const config = require('./../config');
const Requests = require('./../models/Request');
const Transaction = require('./../models/Transaction');
const User = require('./../models/User');
const mongoose = require('mongoose');
const email = require('./../services/email');
const emailMessages = require('./../services/email-messages');

mongoose.Promise = global.Promise;

mongoose.connect(config.mongoUrl).then(function () {
    console.log('connection successful');
}).catch(function (err) {
    console.error(err);
});


var schedule = require('node-schedule');


//  # ┌────────────── second (optional)  0-59
//  # │ ┌──────────── minute             0-59
//  # │ │ ┌────────── hour               0-23
//  # │ │ │ ┌──────── day of month       1-31
//  # │ │ │ │ ┌────── month              1-12
//  # │ │ │ │ │ ┌──── day of week        0-7 (0 or 7 are sunday)
//  # │ │ │ │ │ │
//  # │ │ │ │ │ │
//  # * * * * * *


//at midnight run through all the users and if the returnDate of the travelingInfo is passed remove ut from the list
schedule.scheduleJob('* 0 * * *', function () {
    User.find({}, function (err, users) {
        if (err) return err;
        users.forEach(function (user) {
            var i = user.travelingInfo.length - 1;
            while (i >= 0) {
                if (new Date(user.travelingInfo[i].returnDate) < Date.now()) {
                    user.travelingInfo.splice(i, 1);
                }
                else if (new Date(user.travelingInfo[i].departure) < Date.now()) {
                    user.travelingInfo[i].departure = Date.now();
                    var part2 = user.travelingInfo[i].dates.substring(user.travelingInfo[i].dates.indexOf("-"));
                    var part1 = getMonthAndDayNow();
                    user.travelingInfo[i].dates = part1 + part2;
                }
                i -= 1;
            }
            user.save();
        });
    });
});


const requestStatus = {
    pending: 0,
    confirmed: 1,
    canceled: 2
};

//at midnight run through all requests that are pending and if the check in date passed
//change the status to canceled and send a mail to the user
schedule.scheduleJob('* 0 * * *', function () {
    Requests.find({status: requestStatus.pending}, function (err, requests) {
        if (err) return err;
        requests.forEach(function (request) {
            if (new Date(request.checkin) < Date.now()) {
                request.status = requestStatus.canceled;
                User.findOne({_id: request.user1}, function (err, user) {
                    if (err) return err;
                    if (user.email) {
                        email.sendMail("stermaneran@gmail.com", 'fix this!!', emailMessages.confirmation(user));
                    }
                });
            }
        })
    });
});


//at midnight run through all requests
schedule.scheduleJob('* 0 * * *', function () {
    Requests.find({/*status: requestStatus.pending*/}, function (err, requests) {
        if (err) return err;
        requests.forEach(function (request) {
            const diff = dateDiffInDays(request.updated_at, Date.now());
            User.findOne({_id: request.user2}, function (err, user) {
                if (err) return err;
                if (user.email) {
                    switch (diff) {
                        case 26:
                            console.log("2 6");
                            // email.sendMail(user.email, 'fix this!!', emailMessages.confirmation(user));
                            email.sendMail("stermaneran@gmail.com", 'fix this!!', emailMessages.confirmation(user));
                            break;
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
});


schedule.scheduleJob('* 0 * * *', function () {
    Requests.find({status: requestStatus.confirmed}, function (err, requests) {
        if (err) return err;
        requests.forEach(function (request) {
            const diff = dateDiffInDays(request.updated_at, Date.now());
            User.findOne({_id: request.user2}, function (err, user) {
                if (err) return err;
                if (user.email) {
                    switch (diff) {
                        case 27:
                            console.log("27");
                            // email.sendMail(user.email, 'fix this!!', emailMessages.confirmation(user));
                            email.sendMail("stermaneran@gmail.com", 'fix this!!', emailMessages.eran(user));
                            break;
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
});


const _MS_PER_DAY = 1000 * 60 * 60 * 24;

// a and b are javascript Date objects
function dateDiffInDays(a, b) {
    var date1 = new Date(a);
    var date2 = new Date(b);
    // Discard the time and time-zone information.
    var utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    var utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}


const monthNames = ["Jan", "Feb", "Mar", "April", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getMonthAndDayNow() {
    var date = new Date(Date.now());
    return monthNames[date.getMonth()] + " " + date.getDate() + " ";
}

// module.exports = app;
