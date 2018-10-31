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
