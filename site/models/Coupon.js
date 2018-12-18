let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let schema = new Schema({
    name: String,
    amount: Number,
    code: String,
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }], // users who have used the coupon
    expiration: Number,
    updated_at: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Coupon', schema);