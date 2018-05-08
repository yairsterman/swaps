var express = require('express');
var router = express.Router();
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/User.js');
var Data = require('../user_data/data.js');
var email = require('../services/email.js');
var emailMessages = require('../services/email-messages.js');
var config = require('../config.js');
var app = express();

app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index.html', {title: 'Express'});
});

passport.use(new FacebookStrategy({
        clientID: config.FACEBOOK_APP_ID,
        clientSecret: config.FACEBOOK_APP_SECRET,
        // callbackURL: "https://swapshome.com/auth/facebook/callback",
        callbackURL: "http://localhost:3000/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'picture.type(large)', 'email', 'name', 'gender', 'birthday']
    },
    function (accessToken, refreshToken, profile, done) {
        console.log(profile);
        if(profile._json.email) {
            User.findOne({email: profile._json.email}, function (err, user) {
                if (err) return done(err);
                if (user) {
                    return done(null, user);
                }
            });
        }
        User.findOne({facebookId: profile.id}, function (err, user) {
            if (err) return done(err);
            if (user) {
                return done(null, user);
            }
            var gender = getGender(profile.gender);
            user = new User({
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                displayName: profile.displayName,
                gender: gender,
                birthday: profile._json.birthday,
                email: profile._json.email,
                facebookId: profile.id,
                image: profile._json.picture.data.url,
                occupation: '',
                aboutMe: '',
                country: '',
                city: '',
                address: '',
                swaps: 0,
                allowViewHome: true,
                traveling: false,
                travelingDates: {},
                apptInfo: {
                    roomType: 0,
                    propertyType: 0,
                    beds: 1,
                    baths: 1,
                    guests: 2,
                    rooms: 1,
                    bedType: 1
                },
                deposit: 1,
                paymentInfo: {}
            });
            user.save(function (err, user) {
                if (err) return next(err);
                console.log("new user saved");
                if(user.email) {
                    email.sendMail([user.email], 'Registration to Swaps', emailMessages.registration(user));
                }
                return done(null, user);
            });
        });
    }
));

router.get('/auth/facebook',
    passport.authenticate('facebook', {scope: ['user_birthday', 'email']}));

router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {failureRedirect: '/'}), function (req, res) {
        // Successful authentication, redirect home.
        res.render('close-auth.html', {userId: req.session.passport.user});
    }
);


//eran

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        // callbackURL: "https://swapshome.com/auth/google/callback",
        callbackURL: "http://localhost:3000/auth/google/callback"
    },
    function (accessToken, refreshToken, profile, done) {
        console.log(profile);
        User.findOne({email: profile.emails[0].value}, function (err, user) {
            if (err) return done(err);
            if (user) {
                user.googleId = profile.id;
                user.save();
                return done(null, user);
            }
            else {
                var gender = getGender(profile.gender);
                user = new User({
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    displayName: profile.displayName,
                    gender: gender,
                    birthday: profile._json.birthday,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    image: profile._json.image.url,
                    occupation: '',
                    aboutMe: '',
                    country: '',
                    city: '',
                    address: '',
                    swaps: 0,
                    allowViewHome: true,
                    traveling: false,
                    travelingDates: {},
                    apptInfo: {
                        roomType: 0,
                        propertyType: 0,
                        beds: 1,
                        baths: 1,
                        guests: 2,
                        rooms: 1,
                        bedType: 1
                    },
                    deposit: 1,
                    paymentInfo: {}
                });
                user.save(function (err, user) {
                    if (err) return next(err);
                    console.log("new user saved");
                    email.sendMail([user.email], 'Registration to Swaps', emailMessages.registration(user));
                    return done(null, user);
                });
            }
        });
    }
));

router.get('/auth/google',
    //remove comment for birthday access
    passport.authenticate('google', {scope: ['profile email'/*, 'https://www.googleapis.com/auth/user.birthday.read'*/]}));

router.get('/auth/google/callback',
    passport.authenticate('google', {failureRedirect: '/'}), function (req, res) {
        // Successful authentication, redirect home.
        res.render('close-auth.html', {userId: req.session.passport.user});
    }
);
//eran

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


function getGender(gender) {
    if (gender) {
        if (gender.toLowerCase() === 'female')
            return 1;
        if (gender.toLowerCase() === 'male')
            return 2;
    }
    return 3;
}

module.exports = router;
