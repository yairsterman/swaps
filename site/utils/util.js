let jwt = require('jsonwebtoken');
let config = require('../config.js');

const PASSWORD_LENGTH = 8;

/**
 * calculate how many nights are between the two dates
 * @param date1 - first date
 * @param date2 - second date
 * @return {number} number of nights
 */
module.exports.calculateNightsBetween = function(date1, date2) {
    var DAYS = 1000 * 60 * 60 * 24;
    var date1_ms = date1;
    var date2_ms = date2;
    var difference_ms = Math.abs(date1_ms - date2_ms);
    return Math.ceil(difference_ms / DAYS);
};

module.exports.createVerifyToken = function(email){
    return jwt.sign({
        email: email,
    }, config.jwtSecret);
};

module.exports.randomPassword = function () {
    let chars = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let pass = "";
    for (let i = 0; i < PASSWORD_LENGTH; i++) {
        let char = Math.floor(Math.random() * chars.length);
        pass += chars.charAt(char);
    }
    return pass;
};

