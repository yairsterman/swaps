var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    review: String,
    rating: Number,
    date: { type: Date, default: Date.now },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewer: { type: Schema.Types.ObjectId, ref: 'User' },
    comment: String,
    updated_at: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Review', schema);