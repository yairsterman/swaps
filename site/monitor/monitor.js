let mongoose = require('mongoose');
let config = require('./../config');
let functions = require('./functions');

//connect to mongoDB
//todo: remove when merging with app.js so we don't connect twice
mongoose.Promise = global.Promise;

mongoose.connect(config.mongoUrl,{user: config.mongoUser, pass: config.mongoPassword, useMongoClient: true}).then(function () {
    console.log('connection successful');
}).catch(function (err) {
    console.error(err);
});


let emailService = require('./../services/email');
emailService.init();


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
schedule.scheduleJob('0 23 * * *', functions.emailPendingRequests);
schedule.scheduleJob('0 23 * * *', functions.emailAcceptedRequests);
schedule.scheduleJob('0 23 * * *', functions.emailConfirmedRequests);
schedule.scheduleJob('0 23 * * *', functions.emailReview);
// functions.completeProfile(); // for testing...
// functions.emailAcceptedRequests(); // for testing...
// functions.emailConfirmedRequests(); // for testing...

// module.exports = monitor;
