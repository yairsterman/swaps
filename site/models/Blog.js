let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let schema = new Schema({
    title: String,
    slug: String,
    photo: String,
    html: String,
    excerpt: String,
    author: String,
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Blog', schema);