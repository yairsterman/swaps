let URLSafeBase64 = require('urlsafe-base64');
let sha1 = require('sha1');
//use to delete photos from cloudinary
let cloudinary = require('cloudinary');

let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let User = require('../models/User.js');
let Request = require('../models/Request.js');
let Community = require('../models/Community.js');
let path = require('path');
let fs = require('fs');
let Q = require('q');
let Data = require('../user_data/data.js');
let config = require('../config');
let jwt = require('jsonwebtoken');
let emailMessages = require('../services/email-messages.js');
let EmailService = require('../services/email.js');
let utils = require('../utils/util');
let bcrypt = require('bcrypt-nodejs');

let multer = require('multer');
let upload = multer({dest: 'uploads/', limits: {files: 8}});

let geocoder = require('../services/geocoderService');
let uniqid = require('uniqid');
let moment = require('moment');

cloudinary.config({
    cloud_name: config.cloudinaryName,
    api_key: config.cloudinaryKey,
    api_secret: config.cloudinarySecret
});

const TRANSFORMATION = "w_1400,h_920,c_limit";
const PROFILE_TRANSFORMATION = 'w_200,h_200,c_limit';

// const siteUrl = "https://swapshome.com/";
const siteUrl = "http://localhost:3000/";

var error = {
    error: true,
    message: ''
};

router.post('/reauth', function (req, res, next) {
    return
});

router.post('/edit-profile', function (req, res, next) {
    let id = req.user._id;
    let email = req.body.email;
    let aboutMe = req.body.aboutMe;
    let occupation = req.body.occupation;
    let birthday = req.body.birthday;
    let gender = req.body.gender;
    let thingsToDo = req.body.thingsToDo;

    User.findOne({_id: id}, function (err, user) {
        if (err) {
            error.message = err;
            return res.json(err);
        }
        else {
            if (user) {
                let update = {};
                if (user.aboutMe !== aboutMe)
                    update.aboutMe = aboutMe;
                if (user.occupation !== occupation)
                    update.occupation = occupation;
                if (user.birthday !== birthday)
                    update.birthday = birthday;
                if (user.gender !== gender)
                    update.gender = gender;
                if (user.thingsToDo !== thingsToDo)
                    update.thingsToDo = thingsToDo;
                if (user.email !== email) {
                    update.email = email;
                    let token = utils.createVerifyToken(update.email);
                    update.verifyEmailToken = token;
                    update.verifications = user.verifications;
                    update.verifications.email = false;
                }
                let toUpdate = {$set: update};
                findOneAndUpdate(id, toUpdate, res).then(function () {
                    if (update.email) {
                        EmailService.sendMail([update.email], 'Email Verification', emailMessages.emailVerification(user, update.verifyEmailToken));
                    }
                });
            }
            else {
                error.message = 'No user found';
                return res.json(error);
            }
        }
    });

});

router.post('/edit-listing', function (req, res, next) {
    let id = req.user._id;
    let address = req.body.address;
    let apptInfo = req.body.apptInfo;
    let deposit = req.body.deposit;
    let location = {};

    let update = {};

    if (apptInfo)
        update.apptInfo = apptInfo;
    if (deposit)
        update.deposit = deposit;

    let dfr = Q.defer();
    if (address) {
        geocoder.geocode(address)
            .then(function (geo) {
                update.location = geo.location;
                let country = geo.country;
                let city = geo.city;
                let region = geo.region;
                if (!city) {
                    city = geo.region;
                }
                update.country = country;
                update.city = city;
                update.region = region;
                update.address = address;
                dfr.resolve();
            })
            .catch(function (err) {
                error.message = err;
                dfr.reject(error);
            });
    }
    else {
        dfr.resolve();
    }

    dfr.promise.then(function () {
        let toUpdate = {$set: update};
        findOneAndUpdate(id, toUpdate, res);
    }, function (err) {
        error.message = err;
        return res.json(error);
    });

});

router.post('/reorderPhotos', function (req, res, next) {
    let id = req.user._id;
    let photos = req.body.photos;
    if (!photos || !Array.isArray(photos)) {
        error.message = '';
        return res.json(error);
    }

    User.findOne({_id: id}, function (err, user) {
        if (err) {
            error.message = err;
            return res.json(err);
        }
        else {
            if (user && user.photos) {
                let update = {};
                photos.forEach((photo) => {
                    // check if the photos are the same as saved on user and
                    // no duplicates were added
                    let index = user.photos.indexOf(photo);
                    let lastIndex = user.photos.lastIndexOf(photo);
                    if (index === -1 || lastIndex !== index) {
                        error.message = 'Bad photo ordering';
                        return res.json(error);
                    }
                });
                update.photos = photos;
                let toUpdate = {$set: update};
                findOneAndUpdate(id, toUpdate, res);
            }
            else {
                error.message = 'No user found';
                return res.json(error);
            }
        }
    });

});

router.post('/changePassword', function (req, res, next) {
    let id = req.user._id;
    let newPassword = req.body.new;
    let password = req.body.current;

    if (!newPassword || !password) {
        error.message = 'Wrong password';
        return res.json(error);
    }

    let dfr = Q.defer();

    User.findOne({_id: id}, function (err, user) {
        if (err) {
            dfr.reject(err);
        }
        else {
            if (user) {
                if (user.password) {
                    if (bcrypt.compareSync(password, user.password)) {
                        dfr.resolve(user);
                    }
                    else {
                        dfr.reject('Wrong password');
                    }
                }
                else {
                    dfr.reject('Wrong password');
                }
            }
            else {
                dfr.reject('No user found');
            }
        }
    });

    dfr.promise.then(function () {
        bcrypt.genSalt(config.saltRounds, function (err, salt) {
            bcrypt.hash(newPassword, salt, null, function (err, hash) {
                let update = {};
                update.password = hash;
                let toUpdate = {$set: update};
                findOneAndUpdate(id, toUpdate, res);
            });
        });
    }, function (err) {
        error.message = err;
        return res.json(error);
    });

});

router.post('/set-community', function (req, res, next) {
    let code = req.body.code;
    let id = req.user._id;

    Community.findOne({code: code}).then(function (community) {
        if (!community) {
            error.message = 'No community found, please contact your community administrator';
            return res.json(error);
        }

        let toUpdate = {$set: {community: community._id}};
        findOneAndUpdate(id, toUpdate, res);

    })
});

router.post('/add-travel-info', function (req, res, next) {
    let id = req.user._id;
    let info = req.body.info;
    let where = info.fullDestination;
    let guests = info.guests;
    let dates = info.when ? info.when.split('-') : null;
    let departure = dates ? moment.utc(dates[0].trim(), "MM/DD/YYYY").valueOf() : null;
    let returnDate = dates ? moment.utc(dates[1].trim(), "MM/DD/YYYY").valueOf() : null;
    let rangeLabel = info.rangeLabel;
    let startRange = departure && info.startRange?parseInt(info.startRange):null;
    let endRange = departure && info.endRange?parseInt(info.endRange):null;

    geocoder.geocode(where).then(function (geo) {

        let newInfo = {
            fullDestination: where,
            destination: geo ? geo : null,
            departure: departure,
            returnDate: returnDate,
            dates: departure && returnDate ? `${moment.utc(departure).format('MMM DD')} - ${moment.utc(returnDate).format('MMM DD')}` : null,
            guests: guests,
            rangeLabel: rangeLabel,
            startRange: startRange,
            endRange: endRange
        };

        let toUpdate = {$push: {travelingInformation: newInfo}};
        findOneAndUpdate(id, toUpdate, res);

    });
});

router.post('/update-travel-info', function (req, res, next) {
    if (!req.user.id || !req.body.info) {
        error.message = 'No travel information found';
        return res.json(error);
    }
    let id = req.user.id;
    let info = req.body.info;
    let travelId = info._id;
    let where = info.fullDestination;
    let guests = info.guests;
    let removeDates = info.removeDates;
    let dates = info.when ? info.when.split('-') : null;
    let departure = dates ? moment.utc(dates[0].trim(), "MM/DD/YYYY").valueOf() : null;
    let returnDate = dates ? moment.utc(dates[1].trim(), "MM/DD/YYYY").valueOf() : null;
    let rangeLabel = info.rangeLabel;
    let startRange = info.startRange?parseInt(info.startRange):null;
    let endRange = info.endRange?parseInt(info.endRange):null;

    geocoder.geocode(where).then(function (geo) {
        let updatedInfo = {};

        if (where) {
            updatedInfo['travelingInformation.$.fullDestination'] = where;
            updatedInfo['travelingInformation.$.destination'] = geo;
        }
        if (guests)
            updatedInfo['travelingInformation.$.guests'] = guests;
        if (dates) {
            updatedInfo['travelingInformation.$.departure'] = departure;
            updatedInfo['travelingInformation.$.returnDate'] = returnDate;
            updatedInfo['travelingInformation.$.dates'] = `${moment(departure).utc().format('MMM DD')} - ${moment(returnDate).utc().format('MMM DD')}`;
        }
        if(rangeLabel)
            updatedInfo['travelingInformation.$.rangeLabel'] = rangeLabel;
        if(startRange || startRange == 0)
            updatedInfo['travelingInformation.$.startRange'] = startRange;
        if(endRange || endRange == 0)
            updatedInfo['travelingInformation.$.endRange'] = endRange;
        if (removeDates) {
            updatedInfo['travelingInformation.$.dates'] = null;
            updatedInfo['travelingInformation.$.departure'] = null;
            updatedInfo['travelingInformation.$.returnDate'] = null;
            updatedInfo['travelingInformation.$.rangeLabel'] = null;
            updatedInfo['travelingInformation.$.startRange'] = null;
            updatedInfo['travelingInformation.$.endRange'] = null;
        }
        if (where == '') {
            updatedInfo['travelingInformation.$.fullDestination'] = null;
            updatedInfo['travelingInformation.$.destination'] = null;
        }

        User.findOneAndUpdate({'travelingInformation._id': travelId}, {$set: updatedInfo}, {new: true, projection: Data.getVisibleUserData().restricted})
            .populate({
                path: 'community',
                select: Data.getCommunityData(),
            })
            .exec(function (err, user) {
                if (err) {
                    error.message = err;
                    return res.json(error);
                }
                if (!user) {
                    error.message = 'No user found';
                    return res.json(error);
                }
                res.json(user);
            });
    });
});

router.post('/remove-travel-info', function (req, res, next) {
    if (!req.user.id || !req.body.id) {
        error.message = 'No travel information found';
        res.json(error);
        res.end();
    }
    let id = req.user.id;
    let travelId = req.body.id;

    let toUpdate = {$pull: {travelingInformation: {_id: travelId}}};
    findOneAndUpdate(id, toUpdate, res);

});

router.post('/delete-photo', function (req, res, next) {
    var id = req.user.id;
    var url = req.body.url;
    User.findOne({_id: id}, function (err, user) {
        if (err) throw err;
        else {
            if (user) {
                var photos = user.photos;
                var index = user.photos.indexOf(url);
                if (index != -1) {
                    photos.splice(index, 1);
                    User.update({_id: id}, {$set: {photos: photos}}, {
                        new: true,
                        projection: Data.getVisibleUserData().restricted
                    })
                        .populate({
                            path: 'community',
                            select: Data.getCommunityData(),
                        })
                        .populate({
                            path: 'requests',
                            match: {status: {$ne: Data.getRequestStatus().canceled}},
                            select: Data.getRequestData(),
                            populate: [{path: 'user1', select: Data.getRequestUserData(), match: {_id: {$ne: id}} },{path: 'user2', select: Data.getRequestUserData(), match: {_id: {$ne: id}} }]
                        })
                        .exec(function (err, _user) {
                            if (err) {
                                error.message = "File not removed \n" + err;
                                res.json(error);
                            }
                            else {
                                var fileName = req.user.id + url.substring(url.lastIndexOf('/'), url.lastIndexOf('.'));
                                cloudinary.v2.uploader.destroy(fileName, function (error, result) {
                                    if (error || result.result != 'ok') {
                                        if (!error)
                                            error = {}
                                        error.message = "File not removed \n" + result.result;
                                        res.json(error);
                                    }
                                    else {
                                        res.json(user);
                                    }
                                });
                            }
                        });
                }
                else {
                    error.message = "File not found";
                    res.json(error);
                }
            }
            else {
                error.message = "File not removed";
                res.json(error);
            }
        }
    });
});

/*
* A route for updating the DB once Cloudinary has successfully
* completed uploading the user's photos.
*/
router.post('/uploadCompleted', function (req, res, next) {
    let user = req.user;
    let id = req.user.id;

    if (req.user.photos.length >= 8) {
        if (!error)
            error = {}
        error.message = "Cannot have more then 8 files";
        res.json(error);
    }

    cloudinary.v2.api.resources_by_ids([req.body.public_id], function (err, result) {
        if (err) {
            error.message = 'could not verify picture in the server';
            res.json(error);
            return
        }
        if (result.resources.length > 0 && result.resources[0].public_id == req.body.public_id) {
            let toUpdate = {"$push": {"photos": result.resources[0].secure_url}};
            findOneAndUpdate(id, toUpdate, res);
        }
        else {
            error.message = 'picture does not exist on the server';
            res.json(error);
        }
    });
});

router.post('/profileUploadCompleted', function (req, res, next) {
    let user = req.user;
    let id = req.user.id;
    // only google user's can change profile pic
    if (req.user.facebookId) {
        error.message = 'Not Authorized to change profile picture';
        res.json(error);
        return;
    }
    cloudinary.v2.api.resources_by_ids([req.body.public_id], function (err, result) {
        if (err) {
            error.message = 'could not verify picture in the server';
            res.json(error);
            return;
        }
        if (result.resources.length > 0 && result.resources[0].public_id == req.body.public_id) {
            let toUpdate = {image: result.resources[0].secure_url};
            findOneAndUpdate(id, toUpdate, res);
        }
        else {
            error.message = 'picture does not exist on the server';
            res.json(error);
        }
    });
});

router.get('/get-upload-token', function (req, res, next) {

    if (req.user.photos.length >= 8) {
        if (!error)
            error = {}
        error.message = "cannot have more then 8 files";
        res.json(error);
    }
    else {
        let transformation = `transformation=${TRANSFORMATION}`;// should be changed to whatever resolution we want
        // public id is in the folder named <userID> and file name is SHA1 of the timestamp
        // (just using it to generate a random name for each photo
        let timestamp = Math.floor(Date.now() * Math.random());
        let server_path;
        if (req.user)
            server_path = '' + req.user.id + '/' + URLSafeBase64.encode(sha1(timestamp));
        else
            server_path = 'qwe/' + URLSafeBase64.encode(sha1(timestamp));
        let public_id = "public_id=" + server_path;
        let secret = config.cloudinarySecret;
        //the token is valid for 1 hour from <timestamp> if we want to decrease this time
        // we need to subtract (60000 - <time in minutes multiply by 1000>) from <timestamp>
        // before put it in <ts>
        let ts = "timestamp=" + timestamp;
        let to_sign = ([public_id, ts, transformation]).join("&");
        let token = URLSafeBase64.encode(sha1(to_sign + secret));
        if (req.user)
            console.log('generate token for user: ' + req.user.id + ' token: ' + token)
        else
            console.log('generate token for user: 1' + ' token: ' + token)
        res.send({
            public_id: server_path,
            timestamp: timestamp,
            transformation: TRANSFORMATION,
            signature: token,
            api_key: config.cloudinaryKey,
        });
    }
});

router.get('/get-profile-upload-token', function (req, res, next) {

    // public id is in the folder named <userID> and file name profile
    let timestamp = Math.floor(Date.now() * Math.random());
    let server_path = '' + req.user.id + '/profile';
    let transformation = `transformation=${PROFILE_TRANSFORMATION}`;// should be changed to whatever resolution we want

    let public_id = "public_id=" + server_path;
    let secret = config.cloudinarySecret;
    //the token is valid for 1 hour from <timestamp> if we want to decrease this time
    // we need to subtract (60000 - <time in minutes multiply by 1000>) from <timestamp>
    // before put it in <ts>
    let ts = "timestamp=" + timestamp;
    let to_sign = ([public_id, ts, transformation]).join("&");
    let token = URLSafeBase64.encode(sha1(to_sign + secret));

    res.send({
        public_id: server_path,
        timestamp: timestamp,
        signature: token,
        transformation: PROFILE_TRANSFORMATION,
        api_key: config.cloudinaryKey,
    });
});

router.get('/get-requests', function (req, res, next) {
    var id = req.user._id;
    var requestIds = req.user.requests;

    if (requestIds.length == 0) {
        res.json(requestIds);
        return;
    }
    Request.find({
        _id: {$in: requestIds},
        status: {$ne: Data.getRequestStatus().canceled}
    }, Data.getVisibleRequestData())
        .populate({
            path: 'user1',
            match: {_id: {$ne: id}}, // no need to populate user's own document
            select: Data.getRequestUserData(),
        })
        .populate({
            path: 'user2',
            match: {_id: {$ne: id}}, // no need to populate user's own document
            select: Data.getRequestUserData(),
        })
        .exec(function (err, requests) {
            if (err) {
                error.message = err;
                res.json(error);
            }
            else {
                res.json(requests);
            }
        });
});

router.put('/add-favorite', function (req, res, next) {
    var id = req.user.id;
    let newFavorite = req.body.favorite;
    let user = {};

    User.update({_id: id}, {"$push": {"favorites": newFavorite}})
        .then(function (updated) {
            if (!updated.ok) {
                error.message = err;
                throw (error);
            } else {
                return User.findOne({_id: id}, Data.getVisibleUserData().restricted)
                    .populate({
                        path: 'community',
                        select: Data.getCommunityData(),
                    })
                    .populate({
                        path: 'requests',
                        match: {status: {$ne: Data.getRequestStatus().canceled}},
                        select: Data.getRequestData(),
                        populate: [{path: 'user1', select: Data.getRequestUserData(), match: {_id: {$ne: id}} },{path: 'user2', select: Data.getRequestUserData(), match: {_id: {$ne: id}} }]
                    })
                    .exec();
            }
        })
        .then(function (_user) {
            user = _user;
            if (!user) {
                error.message = 'No user found';
                throw (error);
            }
            else {
                return User.findOne({_id: newFavorite, favorites: id});
            }
        })
        .then(function (favorite) {
            if (favorite) {
                EmailService.sendMail([favorite.email], 'Match Found', emailMessages.matchFound(user));
                res.json({user: user, isMatch: true});
            }
            else {
                res.json({user: user});
            }
        }, function (err) {
            res.json(error);
        });
});

router.get('/is-favorite', function (req, res, next) {
    var id = req.user._id;
    var favoriteID = req.query.id;
    User.findOne({_id: id}, function (err, user) {
        if (err) {
            error.message = err;
            res.json(error);
        } else {
            var found = false;
            for (var i = 0; i < user.favorites.length; ++i) {
                if (user.favorites[i]._id == favoriteID) {
                    found = true;
                    res.json({answer: true});
                }
            }
            if (!found) {
                res.json({answer: false});
            }

        }
    });
});

router.get('/get-favorites', function (req, res, next) {

    var favorites = req.user.favorites;

    User.find({'_id': {$in: favorites}}, Data.getVisibleUserData().accessible, function (err, users) {
        if (err) {
            console.log("ERROR IN GET FAVORITES. error = " + err);
            error.message = err;
        } else {
            res.json(users);
        }
    });

});


router.put('/unset-favorite', function (req, res, next) {

    let id = req.user._id;
    let toDelete = req.body.id;

    let toUpdate = {$pull: {'favorites': toDelete}};

    findOneAndUpdate(id, toUpdate, res);

});

router.get('/verifyEmail', function (req, res, next) {

    //find user with this verify token
    User.findOne({verifyEmailToken: req.query.token}, function (err, user) {
        if (err) {
            error.message = err;
            return res.json(error);
        }
        if (!user) {
            error.message = 'No user found';
            return res.json(error);
        }
        // make sure user's email is the same one the verify token was sent to
        jwt.verify(req.query.token, config.jwtSecret, function (err, decoded) {
            if (err) {
                error.message = err;
                return res.json(error);
            }
            let email = decoded.email;
            if (email != user.email) {
                error.message = 'Wrong email, please resend verification email';
                return res.json(error);
            }
            if (!user.verifications) {
                user.verifications = {};
            }
            user.verifications.email = true;
            user.verifyEmailToken = null;
            user.save(function (err) {
                if (err) {
                    error.message = 'Failed to save user, please try again';
                    return res.json(error);
                }
                EmailService.sendMail([user.email], 'Email verified', emailMessages.emailVerified(user));
                //completeReferral(user)
                return res.json({verified: true});
            });
        });

    });
});

router.post('/setReferral', function (req, res, next) {
    if(!req.body.token || (req.user.referredBy && req.user.referredBy.user)){
        return res.json({});
    }

    jwt.verify(req.body.token, config.jwtSecret, function (err, decoded) {
        let id = decoded.id;
        if(!id || req.user._id == id){
            return res.json({});
        }

        let toUpdate = {referredBy: {user: id, complete: false}};
        findOneAndUpdate(req.user._id, toUpdate, res);

    });
});

router.get('/getReferralToken', function (req, res, next) {
    let token = utils.createReferralToken(req.user._id.toString());
    res.json({token: token});
});

router.post('/sendInvites', function (req, res, next) {
    if(!req.body.emails || req.body.emails == ''){
        error.message = 'No emails supplied';
        return res.json(error);
    }
    let emails = req.body.emails.trim();
    emails = emails.split(',');
    if(emails.length == 0){
        error.message = 'No emails supplied';
        return res.json(error);
    }
    let link = config.baseUrl + '/login?external=true&referer=' + utils.createReferralToken(req.user._id.toString());
    EmailService.sendMail(emails, 'Invitation to join Swaps', emailMessages.invitation(req.user, link));
    res.json({})
});

router.post('/setAllowViewHome', function (req, res, next) {

    let id = req.user._id;
    let allow = req.body.allowViewHome;

    let toUpdate = {$set: {'allowViewHome': allow}};

    findOneAndUpdate(id, toUpdate, res);
});

function completeReferral(user) {

    let dfr = Q.defer();

    if(!isProfileComplete(user) || !user.referredBy || !user.referredBy.user || user.referredBy.complete){
        return dfr.resolve();
    }

    User.findOne({_id: user.referredBy.user}, function (err, referrer) {
        if (err) {
            error.message = err;
            dfr.reject(error);
        }
        if (!referrer) {
            error.message = 'No user found';
            dfr.reject(error);
        }
        if(!referrer.refers){
            referrer.refers = [];
        }
        referrer.refers.push(user._id);
        referrer.credit = typeof referrer.credit == 'undefined'?10:referrer.credit + 5;
        referrer.save(function (err) {
            if (err) {
                error.message = 'Failed to save user, please try again';
                dfr.reject(error);
            }
            user.referredBy.complete = true;
            user.credit = typeof user.credit == 'undefined'?10:user.credit + 5;
            user.save(function (err) {
                if (err) {
                    error.message = 'Failed to save user, please try again';
                    dfr.reject(error);
                }
                EmailService.sendMail([referrer.email], 'Referral complete', emailMessages.referralComplete(referrer, user));
                dfr.resolve();
            });
        });
    });

    return dfr.promise;
}


function findOneAndUpdate(id, toUpdate, res) {
    let dfr = Q.defer();
    User.findOneAndUpdate({_id: id}, toUpdate, {new: true, projection: Data.getVisibleUserData().restricted})
        .populate({
            path: 'community',
            select: Data.getCommunityData(),
        })
        .populate({
            path: 'requests',
            match: {status: {$ne: Data.getRequestStatus().canceled}},
            select: Data.getRequestData(),
            populate: [{path: 'user1', select: Data.getRequestUserData(), match: {_id: {$ne: id}} },{path: 'user2', select: Data.getRequestUserData(), match: {_id: {$ne: id}} }]
        })
        .exec(function (err, user) {
            if (err) {
                error.message = err;
                res.json(error);
                return dfr.reject(error);
            }
            if (!user) {
                error.message = 'No user found';
                res.json(error);
                return dfr.reject(error);
            }
            res.json(user);
            completeReferral(user);
            dfr.resolve();
        });

    return dfr.promise;
}

function isProfileComplete(user) {
    return user.address && user.address != ''
            && user.email && user.email != '' // && user.verifications.email == true
            && user.apptInfo.title != ''
            && user.photos.length > 0
}

function isNumeric(n) {
    return (typeof n == "number" && !isNaN(n));
}

module.exports = router;
