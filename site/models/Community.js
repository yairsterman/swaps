let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let schema = new Schema({
    name: String,
    admin: String, // admin email
    discount: Number,
    code: String,
    photo: String,
    updated_at: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Community', schema);