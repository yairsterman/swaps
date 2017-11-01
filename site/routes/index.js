var express = require('express');
var router = express.Router();
var passport       = require("passport");
var FacebookStrategy = require("passport-facebook").Strategy;
var User = require('../models/User.js');
var app = express();

app.use(passport.initialize());
app.use(passport.session());

//Facebook credentials
var FACEBOOK_APP_ID = "1628077027210389";
var FACEBOOK_APP_SECRET = "5a927f2caa3f5eb9a2eeaad0eaf1b225";

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.html', { title: 'Express' });
});

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://swapshome:3000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'picture.type(large)', 'email', 'name', 'gender', 'birthday']
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    User.find({facebookId: profile.id}, function (err, users) {
        if (err) return done(err);
        if(users.length > 0){
          var user = users[0];
          return done(null, user);
        }
        else{
          var age = getAge(profile._json.birthday);
          user = new User({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            displayName: profile.displayName,
            gender: profile.gender,
            age: age,
            email: profile._json.email,
            facebookId: profile.id,
            image: profile._json.picture.data.url,
            occupation: '',
            aboutMe: '',
            country: '',
            city: '',
            address: '',
            swaps: 0,
            traveling: false,
            travelingDest: '',
            travelingDates: {},
            apptInfo: {},
            paymentInfo: {}
          });
          user.save(function (err, user) {
              if (err) return next(err);
              console.log("new user saved");
              return done(null, user);
          });
        }
    });
  }
));

router.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['user_birthday','user_about_me', 'email']}));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' })
  ,function(req, res) {
    // Successful authentication, redirect home.
    res.render('close-auth.html', {userId: req.session.passport.user});
  }
);

router.get('/reauth', function(req, res) {
    res.json(req.user);
});

router.post('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

function getAge(dateString){
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

module.exports = router;
