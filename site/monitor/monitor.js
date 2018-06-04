let mongoose = require('mongoose');
let config = require('./../config');
let functions = require('./functions');

//connect to mongoDB
//todo: remove when merging with app.js so we don't connect twice
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
// schedule.scheduleJob('* * 14 * * *', functions.emailReview);
functions.emailReview();
// functions.test("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHBpcmVzSW4iOiI3ZCIsImRhdGEiOiI1YWUzODk3ZDQxNTY1MzI4ZDU2ZWJmYTExIiwiaWF0IjoxNTI4MTExOTYyfQ.XWT4YK_f6WNqTmVH9Vd5WpJZB_C-XNqIT81FujXzYTQ");



// module.exports = monitor;
