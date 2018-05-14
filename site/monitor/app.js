const config = require('./../config');
const Requests = require('./../models/Request');
const Transaction = require('./../models/Transaction');
const User = require('./../models/User');
const mongoose = require('mongoose');
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


schedule.scheduleJob('* 13 * * *', function(){
   //this should not be findOne but find!!!
    User.findOne({},function(err, user){
       if (err) return err;
        // users.forEach(function(user) {
        var i = user.travelingInfo.length - 1;
        while (i >= 0) {
            if (new Date(user.travelingInfo[i].returnDate) < Date.now()) {
                user.travelingInfo.splice(i, 1);
            }
            else if(new Date(user.travelingInfo[i].departure) < Date.now()){
                user.travelingInfo[i].departure = Date.now();
                var part2 = user.travelingInfo[i].dates.substring(user.travelingInfo[i].dates.indexOf("-"));
                var part1= getMonthAndDayNow();
                user.travelingInfo[i].dates= part1+part2;
            }
            i -= 1;
        }
        user.save();
        // });
    });
});


const monthNames = ["Jan", "Feb", "Mar", "April", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getMonthAndDayNow() {
    var date = new Date(Date.now());
    return monthNames[date.getMonth()] + " " + date.getDate() + " ";
}

// module.exports = app;
