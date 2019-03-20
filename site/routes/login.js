let express = require('express');
let router = express.Router();
let passport = require('passport');
let User = require('../models/User.js');
let config = require('../config');
let bcrypt = require('bcrypt-nodejs');
let emailMessages = require('../services/email-messages.js');
let EmailService = require('../services/email.js');
let utils = require('../utils/util');



router.get('/facebook',
    passport.authenticate('facebook', {scope: ['email']}));

router.get('/facebook/callback',
    passport.authenticate('facebook', {failureRedirect: '/'}), function (req, res) {
        res.render('close-auth.html', {userId: req.session.passport.user});
    });

router.get('/google',
    //remove comment for birthday access
    passport.authenticate('google', {scope: ['profile email'/*, 'https://www.googleapis.com/auth/user.birthday.read'*/]}));

router.get('/google/callback',
    passport.authenticate('google', {failureRedirect: '/'}), function (req, res) {
        // Successful authentication, redirect home.
        res.render('close-auth.html', {userId: req.session.passport.user});
    }
);

router.post('/signup',
    passport.authenticate('local-signup', {failureRedirect: '/'}), function (req, res) {
        // Successful authentication, redirect home.
        res.json({userId: req.session.passport.user});
    }
);

router.post('/forgotPassword', function (req, res, next) {
    let error = {
        error: true,
        message: ''
    };
    //find user with this verify token
    User.findOne({email: req.body.email}, function(err, user) {
        if(err){
            error.message = err;
            return res.json(error);
        }
        if(!user){
            error.message = 'No user found';
            return res.json(error);
        }

        let password = utils.randomPassword();
        bcrypt.genSalt(config.saltRounds, function (err, salt) {
            bcrypt.hash(password, salt, null, function (err, hash) {
                user.password = hash;
                user.save(function (err) {
                    if (err) {
                        error.message = 'Could not create password';
                        return res.json(error);
                    }
                    EmailService.sendMail([user.email], 'Password Recovery', emailMessages.passwordRecovery(user, password));
                    res.json({success: true});
                });
            });
        });

    });


});




module.exports = router;
