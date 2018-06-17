let passport = require('passport');
let FacebookStrategy = require('passport-facebook').Strategy;
let GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
let User = require('../models/User.js');
let email = require('./email.js');
let emailMessages = require('./email-messages.js');
let data = require('../user_data/data.js');
let config = require('../config.js');
let Q = require('q');
let moment = require('moment');

const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: 'swaps',
    api_key: '141879543552186',
    api_secret: 'DzracCkoJ12usH_8xCe2sG8of3I'
});

module.exports.init = function () {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use(new FacebookStrategy({
            clientID: config.FACEBOOK_APP_ID,
            clientSecret: config.FACEBOOK_APP_SECRET,
            callbackURL: config.baseUrl + "/auth/facebook/callback",
            profileFields: ['id', 'displayName', 'picture.type(large)', 'email', 'name', 'gender', 'birthday']
        },
        function (accessToken, refreshToken, profile, done) {
            console.log(profile);
            let query = {};
            query['facebookId'] = profile.id;
            if (profile._json.email) {
                query = {};
                query ["$or"] = [];
                let a = {};
                a['facebookId'] = profile.id;
                let b = {};
                b['email'] = profile._json.email;
                query ["$or"].push(a);
                query ["$or"].push(b);
            }
            User.findOne(query, function (err, user) {
                if (err) return done(err);
                if (user) {
                    uploadProfileImage(user._id, profile._json.picture.data.url).then(function (result) {
                            user.image = result.url;
                            user.facebookId = profile.id;
                            if (profile._json.email && !user.email) {
                                user.email = profile._json.email;
                            }
                            user.save(function (err, user) {
                                if (err) return next(err);
                                return done(null, user);
                            });
                        },function(err){
                            return next(err);
                        });
                }
                else {
                    const gender = getGender(profile.gender);
                    user = new User({
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        displayName: profile.displayName,
                        gender: gender,
                        birthday: profile._json.birthday,
                        email: profile._json.email,
                        facebookId: profile.id,
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
                        deposit: 0,
                    });
                    uploadProfileImage(user._id, profile._json.picture.data.url).then(function (result) {
                        user.image = result.url;
                        user.save(function (err, user) {
                            if (err) return next(err);
                            console.log("new user saved");
                            if (user.email) {
                                email.sendMail([user.email], 'Registration to Swaps', emailMessages.registration(user));
                            }
                            return done(null, user);
                        });
                    },function(err){
                        return next(err);
                    });
                }
            });
        }
    ));

    passport.use(new GoogleStrategy({
            clientID: config.googleClientId,
            clientSecret: config.googleClientSecret,
            callbackURL: config.baseUrl + "/auth/google/callback"
        },
        function (accessToken, refreshToken, profile, done) {
            console.log(profile);
            User.findOne({$or: [{googleId: profile.id}, {email: profile.emails[0].value}]}, function (err, user) {
                if (err) return done(err);
                if (user) {
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        user.save(function (err, user) {
                            if (err) return next(err);
                            return done(null, user);
                        });
                    }
                    else {
                        return done(null, user);
                    }
                }
                else {
                    user = new User({
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        displayName: profile.displayName,
                        gender: 3,
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        birthday: '01/01/1999',
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
                    uploadProfileImage(user._id, profile._json.image.url).then(function (result) {
                        user.image = result.url;
                        user.save(function (err, user) {
                            if (err) return next(err);
                            console.log("new user saved");
                            email.sendMail([user.email], 'Registration to Swaps', emailMessages.registration(user));
                            return done(null, user);
                        });
                    },function(err){
                        return next(err);
                    });
                }
            });
        }
    ));
};

function getGender(gender) {
    if (gender) {
        if (gender.toLowerCase() === 'female')
            return 1;
        if (gender.toLowerCase() === 'male')
            return 2;
    }
    return 3;
}

function uploadProfileImage(userId, newImage, oldImage){
    let dfr = Q.defer();


    cloudinary.v2.uploader.upload(newImage,{public_id: `${userId}/profile`}, function (err,result) {
        if (err) {
            return dfr.reject(err);
        }
        dfr.resolve(result);

    });
    return dfr.promise;
}