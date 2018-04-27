let mongoose = require('mongoose');
let config = require('../config.js');
let User = require('../models/User.js');
let Transaction = require('../models/transaction.js');
let Q = require('q');
let request = require('request');
let email = require('../services/email.js');
let emailMessages = require('../services/email-messages.js');
let Data = require('../user_data/data.js');


let error = {
    error: true,
    message: ''
};

/**
 * Send a transaction request to charge the payment amount based on the number
 * of nights and guests, then save the new transaction to the DB
 *
 * @param token - user card token
 * @param userId - id of user to save the transaction on
 * @param nights - nights of request in order to calculate payment
 */
function chargeRequest(token, userId, plan, guests, nights){

    let dfr = Q.defer();
    let requestUrl = config.tranzilaRequestUrl;
    let perNight = Data.getSecurityDeposit()[plan].night; // how much to pay per night based on plan
    let amount = perNight * guests * nights; // pay for each guests per night
    amount = 5; //TODO: this is Debug REMOVE!!

    let tranmode = Data.getTransactionMode().regular;

    request.post({
        headers : {"Content-Type": "application/x-www-form-urlencoded"},
        url: requestUrl,
        body: `supplier=${config.tranzillaSupplier}&TranzilaPW=${config.TranzilaPW}&TranzilaTK=${token}&tranmode=${tranmode}&sum=${amount}&currency=1&cred_type=1&response_return_format=json`
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let result;
            try{
                result = JSON.parse(body);
                result.type = Data.getTransactionType().regular;
                createAndSaveToUser(result, userId).then(function(transactionId){
                    dfr.resolve(transactionId);
                },function(err){
                    dfr.reject(err);
                });
            }
            catch(e){
                dfr.reject(e);
            }
        }
        else{
            dfr.reject(error);
        }
    });

    return dfr.promise;
}

/**
 * Create and save transaction in DB, then save transaction on user
 *
 * @param data - transaction data
 */
function createAndSaveToUser (data, userId){
    let dfr = Q.defer();

    let token = data.TranzilaTK;
    let transaction = new Transaction({
        token: token,
        confirmationCode: data.ConfirmationCode,
        index: data.index,
        amount: data.sum,
        type: data.type,
        date: Date.now()
    });

    transaction.save(function (err, transaction) {
        if (err)
            return dfr.reject(err);
        saveTransactionId(userId, transaction._id).then(function(transactionId){
            dfr.resolve({transactionId, token});
        },function(err){
            dfr.reject(err);
        });
    })
    return dfr.promise;
};

/**
 * Save transaction ID to user's transactions
 *
 * @param userId - user to whom the transaction belongs
 * @param transactionId - transaction ID
 */
function saveTransactionId(userId, transactionId){
    let dfr = Q.defer();
    let id = transactionId;

    User.update({_id: userId}, {$push: {transactions: transactionId}}, function (err, user) {
        if (err) {
            error.message = err;
            dfr.reject(error);
        }
        else {
            dfr.resolve(id);
        }
    });

    return dfr.promise;
}

module.exports = {
    chargeRequest: chargeRequest,
    createAndSaveToUser: createAndSaveToUser,
};