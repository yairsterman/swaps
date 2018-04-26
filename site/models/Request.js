var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    user1: { type: Schema.Types.ObjectId, ref: 'User' },
    user2: { type: Schema.Types.ObjectId, ref: 'User' },
    checkin: Number,
    checkout: Number,
    transactionUser1: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    transactionUser2: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    status: Number,
    updated_at: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Request', schema);