var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    user1: { type: Schema.Types.ObjectId, ref: 'User' },
    user2: { type: Schema.Types.ObjectId, ref: 'User' },
    checkin: Number,
    checkout: Number,
    proposition:{
        checkin: Number,
        checkout: Number,
        rangeLabel : String,
        startRange: Number,
        endRange: Number,
    },
    nights: Number,
    plan: Number,
    guests1: Number,
    guests2: Number,
    oneWay: Boolean,
    deposit: Boolean,
    verifyTransactionUser1: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    verifyTransactionUser2: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    transactionUser1: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    transactionUser2: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    status: Number,
    updated_at: { type: Date, default: Date.now},
    created_at: { type: Date, default: Date.now},
    tokenUser1: String ,
    tokenUser2: String
});
module.exports = mongoose.model('Request', schema);