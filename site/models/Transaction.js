var mongoose = require('mongoose');
var schema = new mongoose.Schema({
    token: String,
    confirmationCode: String,
    index: String,
    payment: Number,
    deposit: Number,
    date: Number,
    updated_at: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Transaction', schema);
