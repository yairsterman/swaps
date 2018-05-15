let express = require('express');
let router = express.Router();
let passport = require('passport');


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

module.exports = router;
