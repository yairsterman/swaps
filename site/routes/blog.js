let express = require('express');
let router = express.Router();
let Q = require('q');
let Data = require('../user_data/data.js');
let config = require('../config');
let Blog = require('../models/Blog.js');

let error = {
    error: true,
    message: ''
};

router.get('/getPost', function (req, res, next) {


    let slug = req.query.slug;
    Blog.findOne({slug: slug}, function (err, post) {
        if (err) return res.json(err);
        res.json(post);
    });
});

router.get('/getAllPost', function (req, res, next) {

    Blog.find({show: {$ne: false}}, function (err, post) {
        if (err) return res.json(err);
        res.json(post);
    });
});

router.post('/createPost', function (req, res, next) {
    let password = req.query.password;

    if(password !== config.ADMIN_PASSWORD){
        error.message = "No Access";
        res.json(error);
        return;
    }

    let post = new Blog(req.body.post);


    post.save(function (err, post) {
        if (err) return res.json(err);
        res.json(post);
    });
});

router.put('/editPost', function (req, res, next) {
    let password = req.query.password;

    if(password !== config.ADMIN_PASSWORD){
        error.message = "No Access";
        res.json(error);
        return;
    }
    let post = req.body.post;

    let toUpdate = {};

    if(post.title){
        toUpdate.title = post.title;
    }
    if(post.html){
        toUpdate.html = post.html;
    }
    if(post.excerpt){
        toUpdate.excerpt = post.excerpt;
    }
    if(post.photo){
        toUpdate.photo = post.photo;
    }
    if(post.slug){
        toUpdate.slug = post.slug;
    }
    if(typeof post.show != 'undefined'){
        toUpdate.show = post.show;
    }

    Blog.findOneAndUpdate({_id: post._id},{$set: toUpdate}, function (err, post) {
        if (err) return res.json(err);
        res.json(post);
    });
});

module.exports = router;