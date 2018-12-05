let User = require('../models/User.js');
let Q = require('q');
let dateFormat = require('dateformat');
let email = require('../services/email.js');
let emailMessages = require('../services/email-messages.js');
let Data = require('../user_data/data.js');

let error = {
    error: true,
    message: ''
};

module.exports.purchaseCredits = function(userId, amount){
    let defferd = Q.defer();
    User.update({_id: userId}, { $inc: { credit: amount}}, function (err, updated) {
        if (err){
            console.log( + err);
            error.message = "Message not sent";
            defferd.reject(error);
        }
        else{
            console.log("updated DB");
            defferd.resolve(updated);
        }
    });
    return defferd.promise;
};

module.exports.calculateCreditAmount = function(price){
    let amount = 0;
    amount += Math.floor(price/Data.getCreditInfo().priceFor15) * 15;
    price = price % Data.getCreditInfo().priceFor15;
    amount += Math.floor(price/Data.getCreditInfo().priceFor10) * 10;
    price = price % Data.getCreditInfo().priceFor10;
    amount += Math.floor(price/Data.getCreditInfo().priceFor5) * 5;
    price = price % Data.getCreditInfo().priceFor5;
    amount += Math.floor(price/Data.getCreditInfo().priceFor1) * 1;
    return amount;
}
