let express = require('express');
let router = express.Router();
let passport = require('passport');
let User = require('../models/User.js');
let Data = require('../user_data/data.js');
let email = require('../services/email.js');
let emailMessages = require('../services/email-messages.js');
let config = require('../config.js');


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index.html', {title: 'Express'});
});

router.get('/reauth', function (req, res) {
    res.json(req.user);
});

router.post('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/fail', function (req, res, next) {
    res.render('transactions/fail.html', {});
});

router.get('/success', function (req, res, next) {
    res.render('transactions/success.html', {});
});

router.get('/*', function (req, res, next) {
    res.render('index.html', {});
});


module.exports = router;
