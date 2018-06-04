let config = require('./../config');
let mongoose = require('mongoose');

let functions = require('./functions');



//connect to mongoDB will need to remove when merging both so we don't connect twice
mongoose.Promise = global.Promise;
mongoose.connect(config.mongoUrl).then(function () {
    console.log('connection successful');
}).catch(function (err) {
    console.error(err);
});


let schedule = require('node-schedule');
//  # ┌────────────── second (optional)  0-59
//  # │ ┌──────────── minute             0-59
//  # │ │ ┌────────── hour               0-23
//  # │ │ │ ┌──────── day of month       1-31
//  # │ │ │ │ ┌────── month              1-12
//  # │ │ │ │ │ ┌──── day of week        0-7 (0 or 7 are sunday)
//  # │ │ │ │ │ │
//  # │ │ │ │ │ │
//  # * * * * * *

schedule.scheduleJob('0 23 * * *', functions.updateTravelingInformation);
schedule.scheduleJob('0 23 * * *', functions.emailPassedPendingRequests);
schedule.scheduleJob('0 23 * * *', functions.PendingRequestsReminder);
schedule.scheduleJob('0 23 * * *', functions.emailConfirmedRequests);

// module.exports = monitor;
