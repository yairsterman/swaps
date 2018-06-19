let express = require('express');
let router = express.Router();
let passport = require('passport');
let User = require('../models/User.js');
const bcrypt = require('bcrypt-nodejs');



router.get('/facebook',
    passport.authenticate('facebook', {scope: ['user_birthday', 'email']}));

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
    passport.authenticate('local-signup', {failureRedirect: '/auth/signup'}), function (req, res) {
        // Successful authentication, redirect home.
        res.json({userId: req.session.passport.user});
    }
);

router.post('/signin',function (req, res) {
    if(!req.body.email){
        res.status(404).json({message: 'no email '});
    }
    else {
        User.findOne({email: req.body.email},function (err, user) {
            if(err){
                console.log(err);
                res.status(409).json({message: err});
            }
            else{
                if(user && user.password){
                    if (bcrypt.compareSync(req.body.password, user.password)) {
                        res.status(200).json(user);
                    }
                    else{
                        res.status(404).json({message: 'wrong password '+ req.body.password});
                    }
                }
                else{
                    if(user.password) {
                        res.status(404).json({message: 'no user with email ' + req.body.email});
                    }
                    else {
                        res.status(404).json({message: 'user ' + req.body.email + ' has no password'});
                    }
                }
            }
        })
    }
    });




module.exports = router;
