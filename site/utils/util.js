let jwt = require('jsonwebtoken');
let config = require('../config.js');
let data = require('../user_data/data');
let Q = require('q');

const PASSWORD_LENGTH = 8;
const ALLOWED_ONE_WAY_SWAP_DAYS = 14;

/**
 * calculate how many nights are between the two dates
 * @param date1 - first date
 * @param date2 - second date
 * @return {number} number of nights
 */
module.exports.calculateNightsBetween = function(date1, date2) {
    let DAYS = 1000 * 60 * 60 * 24;
    let date1_ms = date1;
    let date2_ms = date2;
    let difference_ms = Math.abs(date1_ms - date2_ms);
    return Math.ceil(difference_ms / DAYS);
};

module.exports.getTotalPaymentAmount = function(roomTypeCost, roomTypeGain, nights, oneWay, showGain) {
    let cost = data.getRoomType()[roomTypeCost].cost;
    let gain = data.getRoomType()[roomTypeGain].gain;

    if(oneWay){
        if(showGain){
            cost = 0;
        }
        else{
            gain = 0;
        }
    }
    return (cost - gain) * nights
};

module.exports.createVerifyToken = function(email){
    return jwt.sign({
        email: email,
    }, config.jwtSecret);
};

module.exports.createReferralToken = function(id){
    return jwt.sign({
        id: id,
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

module.exports.getRangeText = function(range){
    if(range.rangeLabel == 'Date Range'){
        return `on flexible dates, for ${range.startRange !== range.endRange?range.startRange  +' - ' + range.endRange:range.startRange} ${range.endRange > 1?' Nights':' Night'}`
    }
    if(range.rangeLabel == 'Weekends'){
        return `on flexible dates, on a ${data.getWeekendStart()[range.startRange].displayName} to ${data.getWeekendEnd()[range.endRange].displayName} weekend within the following range`
    }
    return '';
}

module.exports.notEnoughOneWaySwapDays = function(user, nights, isOneWay){

    if(!isOneWay){
       return false;
    }
    return(user.oneWaySwapDays + nights > ALLOWED_ONE_WAY_SWAP_DAYS);
}

