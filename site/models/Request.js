var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    user1: { type: Schema.Types.ObjectId, ref: 'User' },
    user2: { type: Schema.Types.ObjectId, ref: 'User' },
    checkin: Number,
    checkout: Number,
    nights: Number,
    plan: Number,
    guests1: Number,
    guests2: Number,
    verifyTransactionUser1: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    verifyTransactionUser2: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    transactionUser1: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    transactionUser2: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    status: Number,
    updated_at: { type: Date, default: Date.now},
    created_at: { type: Date, default: Date.now},
    tokenUser1: { type: String, default: ""},
    tokenUser2: { type: String, default: ""}
});
module.exports = mongoose.model('Request', schema);