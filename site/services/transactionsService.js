let mongoose = require('mongoose');
let config = require('../config.js');
let User = require('../models/User.js');
let Transaction = require('../models/Transaction.js');
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
 * @param index - transaction index
 * @param userId - id of user to save the transaction on
 * @param payment - all payment information
 * @param userEmail - the user's email
 */
function chargeRequest(token, index, userId, payment, userEmail, expdate){

    let dfr = Q.defer();
    let requestUrl = config.tranzilaRequestUrl;
    let perNight = Data.getSecurityDeposit()[payment.plan].night; // how much to pay per night based on plan
    let amount = perNight * payment.guests * payment.nights; // pay for each guests per night
    amount = payment.discount?amount * ((100 - payment.discount) / 100):amount; // distract discount from final amount
    let tranmode = Data.getTransactionMode().regular;

    let terminalInformation = {
        supplier: config.tranzillaSupplier,
        password: config.tranzillaPassword,
    };

    getExpirationDate(terminalInformation, index, expdate).then(expdate => {
        request.post({
            headers : {"Content-Type": "application/x-www-form-urlencoded"},
            url: requestUrl,
            body: `supplier=${config.tranzillaTokenSupplier}&TranzilaPW=${config.TranzilaPW}&TranzilaTK=${token}&expdate=${expdate}&tranmode=${tranmode}&sum=${amount}&email=${userEmail}&currency=2&cred_type=1&response_return_format=json`
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                let result;
                try{
                    result = JSON.parse(body);
                    if(result.error_msg){
                        return dfr.reject(result.error_msg);
                    }
                    result.type = Data.getTransactionType().regular;
                    createAndSaveToUser(result, userId).then(function({transactionId, token}){
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
    },function(err){
        dfr.reject(err);
    });

    return dfr.promise;
}

/**
 * Send a refund to the token saved on this transaction,
 * then save the new transaction to the DB
 *
 * @param transaction - transaction to refund
 * @param userId - id of user to save the transaction on
 */
function refund(transaction, userId){

    let dfr = Q.defer();

    let requestUrl = config.tranzilaRequestUrl;

    let amount = transaction.amount;
    let index = transaction.index;
    let confirmationCode = transaction.confirmationCode;
    let token = transaction.token;

    let tranmode = Data.getTransactionMode().refund + index;
    let terminalInformation = {
        supplier: config.tranzillaTokenSupplier,
        password: config.tranzillaTokenPassword,
    };
    getExpirationDate(terminalInformation, index).then(expdate => {
        request.post({
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            url: requestUrl,
            body: `supplier=${config.tranzillaTokenSupplier}&TranzilaPW=${config.TranzilaPW}&expdate=${expdate}&CreditPass=${config.CreditPass}&authnr=${confirmationCode}&TranzilaTK=${token}&tranmode=${tranmode}&sum=${amount}&currency=1&cred_type=1&response_return_format=json`
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                let result;
                try {
                    result = JSON.parse(body);
                    if (result.error_msg) {
                        return dfr.reject(result.error_msg);
                    }
                    result.type = Data.getTransactionType().refund;
                    createAndSaveToUser(result, userId).then(function ({transactionId, token}) {
                        dfr.resolve(transactionId);
                    }, function (err) {
                        dfr.reject(err);
                    });
                }
                catch (e) {
                    dfr.reject(e);
                }
            }
            else {
                dfr.reject(error);
            }
        });
    },function(err){
        dfr.reject(err);
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

    if(data.ConfirmationCode == '0000000'){//failed transaction
        dfr.reject('transaction failed');
    }

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

/**
 * Sends a request to tranzila in order to get the expiration date of a CC
 * by retrieving the index of the transaction.
 * If expdate is sent it means this is the confirming user and we don't need to
 * Query the transaction information, we could simply use the given expdate.
 *
 * @param terminalInformation - the credentials for the terminal
 * @param index - index of the transaction
 * @param expdate - CC expiration date
 */
function getExpirationDate(terminalInformation, index, expdate){
    let dfr = Q.defer();

    if(expdate){
        //return the expiration date without querying tranzila
        dfr.resolve(expdate);
    }

    request.post({
        headers : {"Content-Type": "application/x-www-form-urlencoded"},
        url: config.tranzilaGetIndexUrl,
        body: `terminal=${terminalInformation.supplier}&passw=${terminalInformation.password}&index=${index}&response_return_format=json`
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let result;
            try{
                result = JSON.parse(body);
                if(result.error_msg){
                    return dfr.reject(result.error_msg);
                }
                dfr.resolve(result.expdate);
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

module.exports = {
    chargeRequest: chargeRequest,
    createAndSaveToUser: createAndSaveToUser,
    refund: refund,
};