let URLSafeBase64 = require('urlsafe-base64');
let sha1 = require('sha1');
//use to delete photos from cloudinary
let cloudinary = require('cloudinary');

let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let User = require('../models/User.js');
let Request = require('../models/Request.js');
let path = require('path');
let fs = require('fs');
let Q = require('q');
let Data = require('../user_data/data.js');
let config = require('../config');

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

const TRANSFORMATION = "w_1200,h_720,c_limit";
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

    let toUpdate = {};
    if(email)
        toUpdate.email = email;
    if(aboutMe)
        toUpdate.aboutMe = aboutMe;
    if(occupation)
        toUpdate.occupation = occupation;
    if(birthday)
        toUpdate.birthday = birthday;
    if(gender)
        toUpdate.gender = gender;
    if(thingsToDo)
        toUpdate.thingsToDo = thingsToDo;


    User.findOneAndUpdate({_id: id}, {$set: toUpdate}, {new: true, projection: Data.getVisibleUserData().restricted})
        .then(function (user) {
        if (!user) {
            error.message = 'No user found';
            return res.json(error);
        }
        res.json(user);
        },function(err){
            error.message = err;
            return res.json(error);
        });
});

router.post('/edit-listing', function (req, res, next) {
    let id = req.user._id;
    let address = req.body.address;
    let apptInfo = req.body.apptInfo;
    let deposit = req.body.deposit;
    let location = {};

    let toUpdate = {};

    if(apptInfo)
        toUpdate.apptInfo = apptInfo;
    if(deposit)
        toUpdate.apptInfo = deposit;

    let dfr = Q.defer();
    if(address){
        geocoder.geocode(address)
            .then(function (geo) {
                toUpdate.location = geo.location;
                let country = geo.country;
                let city = geo.city;
                let region = geo.region;
                if (!city) {
                    city = geo.region;
                }
                toUpdate.country = country;
                toUpdate.city = city;
                toUpdate.region = region;
                toUpdate.address = address;
                dfr.resolve();
            })
            .catch(function (err) {
                error.message = err;
                dfr.reject(error);
            });
    }
    else{
        dfr.resolve();
    }

    dfr.promise.then(function(){
        User.findOneAndUpdate({_id: id}, {$set: toUpdate}, {new: true, projection: Data.getVisibleUserData().restricted})
            .then(function (user) {
                if (!user) {
                    error.message = 'No user found';
                    return res.json(error);
                }
                res.json(user);
            },function(err){
                error.message = err;
                return res.json(error);
            });
    },function(err){
        error.message = err;
        return res.json(error);
    });

});

router.post('/add-travel-info', function (req, res, next) {
    let id = req.user._id;
    let info = req.body.info;
    let where = info.fullDestination;
    let guests = info.guests;
    let dates = info.when ? info.when.split('-') : null;
    let departure = dates ? moment.utc(dates[0].trim(), "MM/DD/YYYY").valueOf() : null;
    let returnDate = dates ? moment.utc(dates[1].trim(), "MM/DD/YYYY").valueOf() : null;

    geocoder.geocode(where).then(function (geo) {
        let newInfo = {
            fullDestination: where,
            destination: geo? geo: null,
            departure: departure,
            returnDate: returnDate,
            dates: departure && returnDate?`${moment.utc(departure).format('MMM DD')} - ${moment.utc(returnDate).format('MMM DD')}`: null,
            guests: guests,
        };
        User.findOneAndUpdate({_id: id}, {$push: {travelingInformation: newInfo}}, {new: true, projection: Data.getVisibleUserData().restricted})
            .then(function (user) {
                if (!user) {
                    error.message = 'No user found';
                    return res.json(error);
                }
                res.json(user);
            });
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

    geocoder.geocode(where).then(function (geo) {
        let updatedInfo = {};
        if(where){
            updatedInfo['travelingInformation.$.fullDestination'] = where;
            updatedInfo['travelingInformation.$.destination'] = geo;
        }
        if(guests)
            updatedInfo['travelingInformation.$.guests'] = guests;
        if(dates){
            updatedInfo['travelingInformation.$.departure'] = departure;
            updatedInfo['travelingInformation.$.returnDate'] = returnDate;
            updatedInfo['travelingInformation.$.dates'] = `${moment(departure).utc().format('MMM DD')} - ${moment(returnDate).utc().format('MMM DD')}`;
        }
        if(removeDates){
            updatedInfo['travelingInformation.$.dates'] = null;
            updatedInfo['travelingInformation.$.departure'] = null;
            updatedInfo['travelingInformation.$.returnDate'] = null;
        }
        if(where == ''){
            updatedInfo['travelingInformation.$.fullDestination'] = null;
            updatedInfo['travelingInformation.$.destination'] = null;
        }
        User.findOneAndUpdate({'travelingInformation._id': travelId}, {$set: updatedInfo}, {new: true, projection: Data.getVisibleUserData().restricted})
            .then(function (user) {
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

    User.findOneAndUpdate({'_id': id}, {$pull: {travelingInformation:{_id: travelId}}}, {new: true, projection: Data.getVisibleUserData().restricted})
        .then(function (user) {
            if (!user) {
                error.message = 'No user found';
                return res.json(error);
            }
            res.json(user);
        });
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
                    User.update({_id: id}, {$set: {photos: photos}}, function (err, updated) {
                        if (err) {
                            error.message = "File not removed \n" + err;
                            res.json(error);
                        }
                        else {
                            var fileName = req.user.id + url.substring(url.lastIndexOf('/'), url.lastIndexOf('.'));
							cloudinary.v2.uploader.destroy(fileName, function(error, result){
								if(error || result.result != 'ok'){
									if(!error)
										error = {}
									error.message = "File not removed \n" + result.result;
									res.json(error);
								}
								else{
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

    if(req.user.photos.length >= 8) {
        if(!error)
            error = {}
        error.message = "Cannot have more then 8 files";
        res.json(error);
    }

	cloudinary.v2.api.resources_by_ids([req.body.public_id], function(err, result) {
		if(err)
		{
			error.message = 'could not verify picture in the server';
			res.json(error);
			return
		}
		if(result.resources.length > 0 && result.resources[0].public_id == req.body.public_id)
		{
			User.update({_id: id}, {"$push": {"photos": result.resources[0].secure_url}})
			.then(function (updated) {
				if (!updated.ok) {
					error.message = 'Failed to update photos';
					throw (error);
				} else {
					return User.findOne({_id: id}, Data.getVisibleUserData().restricted);
				}
			}).then(function(user) {
				res.json(user);
			},function(err){
				res.json(error);
			});
		}
		else
		{
			error.message = 'picture does not exist on the server';
			res.json(error);
		}
	});
});

router.post('/profileUploadCompleted', function (req, res, next) {
    let user = req.user;
    let id = req.user.id;
    // only google user's can change profile pic
    if(req.user.facebookId){
        error.message = 'Not Authorized to change profile picture';
        res.json(error);
        return;
    }
    cloudinary.v2.api.resources_by_ids([req.body.public_id], function(err, result) {
        if(err)
        {
            error.message = 'could not verify picture in the server';
            res.json(error);
            return;
        }
        if(result.resources.length > 0 && result.resources[0].public_id == req.body.public_id)
        {
            User.update({_id: id}, {image: result.resources[0].secure_url})
                .then(function (updated) {
                    if (!updated.ok) {
                        error.message = 'Failed to update photo';
                        throw (error);
                    } else {
                        return User.findOne({_id: id}, Data.getVisibleUserData().restricted);
                    }
                }).then(function(user) {
                res.json(user);
            },function(err){
                res.json(error);
            });
        }
        else
        {
            error.message = 'picture does not exist on the server';
            res.json(error);
        }
    });
});

router.get('/get-upload-token', function (req, res, next) {
	
    if(req.user.photos.length >= 8) {
		if(!error)
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
		if(req.user)
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
		if(req.user)
			console.log('generate token for user: ' + req.user.id + ' token: ' + token) 
		else
			console.log('generate token for user: 1' + ' token: ' + token) 
		res.send( {
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

    res.send( {
        public_id: server_path,
        timestamp: timestamp,
        signature: token,
        transformation: PROFILE_TRANSFORMATION,
        api_key: config.cloudinaryKey,
    });
});

router.post('/upload', upload.array('photos', 8), function (req, res) {
    var id = req.user.id;
    var photos = [];
    for (i = 0; i < req.files.length; i++) {
        var tempPath = req.files[i].path;
        if (path.extname(req.files[i].originalname).toLowerCase() === '.jpg' || path.extname(req.files[i].originalname).toLowerCase() === '.jpeg') {
            var targetPath = path.resolve('public/images/' + tempPath + path.extname(req.files[i].originalname).toLowerCase());
            try {
                fs.renameSync(tempPath, targetPath);
                tempPath = tempPath.replace(/\\/g, "/");
                photos.push(siteUrl + 'images/' + tempPath + path.extname(req.files[i].originalname).toLowerCase());
            }
            catch (err) {
                error.message = 'Error uploading file';
                res.redirect('/#/account/listing');
            }

        } else {
            try {
                fs.unlinkSync(tempPath);
                error.message = 'Wrong file type';
                res.redirect('/#/account/listing');
            }
            catch (err) {
                throw err;
            }
        }
    }
    console.log("upload complete");
    User.findOne({_id: id}, function (err, user) {
        if (err) throw err;
        else {
            if (user) {
                photos = user.photos.concat(photos);
                if (photos.length > 8) {
                    photos.splice(8);
                }
                User.update({_id: id}, {$set: {photos: photos}}, function (err, user) {
                    if (err) {
                        error.message = err;
                        res.redirect('/#/account/listing');
                    }
                    else {
                        console.log("updated DB");
                        res.redirect('/#/account/listing');
                    }
                });
            }
            else {
                // res.redirect('/#/account/listing');
            }
        }
    });
});

router.get('/get-requests', function (req, res, next) {
    var id = req.user._id;
    var requestIds = req.user.requests;

    if (requestIds.length == 0) {
        res.json(requestIds);
        return;
    }
    Request.find({_id: {$in: requestIds}, status: {$ne: Data.getRequestStatus().canceled}}, Data.getVisibleRequestData())
        .populate({
            path: 'user1',
            match: { _id: { $ne: id }}, // no need to populate user's own document
            select: Data.getRequestData(),
        })
        .populate({
            path: 'user2',
            match: { _id: { $ne: id }}, // no need to populate user's own document
            select: Data.getRequestData(),
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
            return User.findOne({_id: id}, Data.getVisibleUserData().restricted);
        }
    })
    .then(function(_user){
        user = _user;
        if (!user) {
            error.message = err;
            throw (error);
        }
        else {
            return User.findOne({_id: newFavorite, favorites: id});
        }
    })
    .then(function(favorite){
        if(favorite){
            res.json({user: user, isMatch: true});
        }
        else{
            res.json({user: user});
        }
    },function(err){
        res.json(error);
    });
});

router.get('/is-favorite', function(req, res, next) {
    var id = req.user._id;
    var favoriteID = req.query.id;
    User.findOne({_id: id}, function(err, user) {
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

    User.find({ '_id': { $in: favorites }}, Data.getVisibleUserData().accessible, function(err, users) {
        if(err) {
            console.log("ERROR IN GET FAVORITES. error = " + err);
            error.message = err;
        } else {
            res.json(users);
        }
    });

});


router.put('/unset-favorite', function (req, res, next) {

    var id = req.user._id;
    var toDelete = req.body.id;

    User.update(
        { _id: id },
        { $pull: { 'favorites': toDelete} }, function(err, ans) {
            if (err) {
                error.message = err;
                res.json(error);
            } else {
                User.findOne({_id: id}, Data.getVisibleUserData().restricted, function (err, user) {
                    if (err) {
                        error.message = err;
                        res.json(error);
                    }
                    else {
                        res.json(user);
                    }
                });
            }


        }
    );

});

module.exports = router;
