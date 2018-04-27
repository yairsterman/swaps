var mongoose = require('mongoose');
var schema = new mongoose.Schema({
    token: String,
    confirmationCode: String,
    index: String,
    amount: Number,
    type: Number,
    date: Number,
    updated_at: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Transaction', schema);
