let express = require('express');
let router = express.Router();
let Q = require('q');
let Data = require('../user_data/data.js');
let config = require('../config');
let Blog = require('../models/Blog.js');

router.get('/getPost', function (req, res, next) {

    let name = req.query.post;
    Blog.findOne({name: name}, function (err, post) {
        if (err) return res.json(err);
        res.json(post);
    });
});

router.get('/getAllPost', function (req, res, next) {

    Blog.find({}, function (err, post) {
        if (err) return res.json(err);
        res.json(post);
    });
});

router.post('/createPost', function (req, res, next) {

    let post = new Blog(req.body.post);


    post.save(function (err, post) {
        if (err) return res.json(err);
        res.json(post);
    });
});

module.exports = router;