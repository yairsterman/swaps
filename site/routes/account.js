var URLSafeBase64 = require('urlsafe-base64');
var sha1 = require('sha1');
//use to delete photos from cloudinary
var cloudinary = require('cloudinary');

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User.js');
var Request = require('../models/Request.js');
var path = require('path');
var fs = require('fs');
var Q = require('q');
var Data = require('../user_data/data.js');

var multer = require('multer');
var upload = multer({dest: 'uploads/', limits: {files: 8}});

var NodeGeocoder = require('node-geocoder');

cloudinary.config({ 
  cloud_name: 'swaps', 
  api_key: '141879543552186', 
  api_secret: 'DzracCkoJ12usH_8xCe2sG8of3I' 
});

var options = {
    provider: 'google',

    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: 'AIzaSyBWmFeAXp3C9w8cwVHu6emXoQpmgJis9Hw', // for Mapquest, OpenCage, Google Premier
    formatter: null         // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(options);


const siteUrl = "https://swapshome.com/";
// const siteUrl = "http://localhost:3000/";

var error = {
    error: true,
    message: ''
};

router.post('/edit-profile', function (req, res, next) {
    var id = req.user._id;
    var email = req.body.email;
    var aboutMe = req.body.aboutMe;
    var occupation = req.body.occupation;
    var birthday = req.body.birthday;
    var gender = req.body.gender;
    var thingsToDo = req.body.thingsToDo;

    User.update({_id: id}, {
            $set: {
                email: email,
                aboutMe: aboutMe,
                occupation: occupation,
                gender: gender,
                birthday: birthday,
                thingsToDo: thingsToDo
            }
        },
        function (err, updated) {
            if (err) {
                error.message = err;
                res.json(error);
            }
            else {
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
        });
});

router.post('/edit-listing', function (req, res, next) {
    var id = req.user._id;
    var address = req.body.address;
    var apptInfo = req.body.apptInfo;
    var deposit = req.body.deposit;
    var location = {};

    if (!address) {
        User.update({_id: id}, {$set: {apptInfo: apptInfo, deposit: deposit}},
            function (err, updated) {
                if (err) {
                    error.message = err;
                    res.json(error);
                }
                else {
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
            });
    }
    else {
        geocoder.geocode(address)
            .then(function (geo) {
                location.lat = geo[0].latitude.toFixed(3);
                location.long = geo[0].longitude.toFixed(3);
                var country = geo[0].country;
                var city = geo[0].city;
                if (!city) {
                    city = geo[0].administrativeLevels.level1long;
                }
                User.update({_id: id}, {
                        $set: {
                            location: location,
                            country: country,
                            city: city,
                            address: address,
                            apptInfo: apptInfo,
                            deposit: deposit
                        }
                    },
                    function (err, updated) {
                        if (err) {
                            error.message = err;
                            res.json(error);
                        }
                        else {
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
                    });
            })
            .catch(function (err) {
                error.message = err;
                res.json(error);
            });
    }
});

router.post('/add-travel-info', function (req, res, next) {
    var id = req.user._id;
    var info = req.body.info;
    var where = info.destination ? info.destination.split(',')[0] : null;
    var guests = info.guests;
    var dates = info.when ? info.when.split('-') : null;
    var departure = dates ? Date.parse(dates[0].trim()) : null;
    var returnDate = dates ? Date.parse(dates[1].trim()) : null;
    var newInfo = {
        destination: where,
        departure: departure,
        returnDate: returnDate,
        dates: info.dates,
        guests: guests
    };
    console.log(newInfo);
    User.findOne({_id: req.user._id}, function (err, user) {
        if (err) {
            error.message = err;
            res.json(error);
        }
        else {
            var travelingInfo = user.travelingInfo;
            var travelingDest = user.travelingDest;
            if (travelingInfo.length == 0) {
                newInfo._id = 1;
            }
            else {
                newInfo._id = travelingInfo[travelingInfo.length - 1]._id + 1;
            }
            travelingInfo.push(newInfo);
            travelingDest.push(where);
            User.update({_id: id}, {
                $set: {
                    travelingInfo: travelingInfo,
                    travelingDest: travelingDest,
                    traveling: true
                }
            }, function (err, updated) {
                if (err) {
                    error.message = err;
                    res.json(error);
                }
                else {
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
            });
        }
    });
});

router.post('/update-travel-info', function (req, res, next) {
    if (!req.user.id || !req.body.info) {
        error.message = 'No travel information found';
        res.json(error);
    }
    var id = req.user.id;
    var info = req.body.info;
    var travelId = info._id;
    var where = info.destination ? info.destination.split(',')[0] : null;
    var guests = info.guests;
    var dates = info.when ? info.when.split('-') : info.dates ? info.dates : undefined;
    var departure = dates ? Date.parse(dates[0].trim()) : undefined;
    var returnDate = dates ? Date.parse(dates[1].trim()) : undefined;
    var newInfo = {
        destination: where,
        departure: departure,
        returnDate: returnDate,
        dates: dates ? info.dates : undefined,
        guests: guests,
        _id: travelId
    };
    console.log(newInfo);
    User.findOne({_id: id}, function (err, user) {
        if (err) {
            error.message = err;
            res.json(error);
        }
        else {
            var travelingInfo = user.travelingInfo;
            var travelingDest = user.travelingDest;
            var index;
            for (var i = 0; i < travelingInfo.length; i++) {
                if (travelingInfo[i]._id == travelId) {
                    index = i;
                    break;
                }
            }
            if (index == -1) {
                error.message = 'No travel information found';
                res.json(error);
            }
            else {
                if (travelingInfo[index].destination != where) {
                    if (travelingDest.indexOf(travelingInfo[index].destination) != -1) {
                        travelingDest.splice(travelingDest.indexOf(travelingInfo[index].destination), 1);
                        travelingDest.push(where);
                    }
                }
                travelingInfo[index] = newInfo;
                User.update({_id: id}, {
                    $set: {
                        travelingInfo: travelingInfo,
                        travelingDest: travelingDest,
                        traveling: true
                    }
                }, function (err, updated) {
                    if (err) {
                        error.message = err;
                        res.json(error);
                    }
                    else {
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
                });
            }
        }
    });
});

router.post('/remove-travel-info', function (req, res, next) {
    if (!req.user.id || !req.body.info) {
        error.message = 'No travel information found';
        res.json(error);
        res.end();
    }
    var id = req.user.id;
    var info = req.body.info;
    var travelId = info._id;
    User.findOne({_id: id}, function (err, user) {
        if (err) {
            error.message = err;
            res.json(error);
        }
        else {
            var travelingInfo = user.travelingInfo;
            var travelingDest = user.travelingDest;
            var index;
            for (var i = 0; i < travelingInfo.length; i++) {
                if (travelingInfo[i]._id == travelId) {
                    index = i;
                    break;
                }
            }
            if (index == -1) {
                error.message = 'No travel information found';
                res.json(error);
            }
            else {
                if (travelingDest.indexOf(travelingInfo[index].destination) != -1) {
                    travelingDest.splice(travelingDest.indexOf(travelingInfo[index].destination), 1);
                }
                travelingInfo.splice(index,1);
                User.update({_id: id}, {
                    $set: {
                        travelingInfo: travelingInfo,
                        travelingDest: travelingDest,
                        traveling: (travelingInfo.length > 0)
                    }
                }, function (err, updated) {
                    if (err) {
                        error.message = err;
                        res.json(error);
                    }
                    else {
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
                });
            }
        }
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

router.get('/get-upload-token', function (req, res, next) {
	
    if(req.user.photos.length >= 8) {
		if(!error)
			error = {}
		error.message = "cannot have more then 8 files";
        res.json(error);
	}
	else {
		let eager = "eager=w_1080,h_720,c_crop"// should be changed to whatever resolution we want
		// public id is in the folder named <userID> and file name is SHA1 of the timestamp
		// (just using it to generate a random name for each photo
		let timestamp = Math.floor(Date.now() * Math.random());
		let server_path;
		if(req.user)
			server_path = '' + req.user.id + '/' + URLSafeBase64.encode(sha1(timestamp));
		else
			server_path = 'qwe/' + URLSafeBase64.encode(sha1(timestamp));
		let public_id = "public_id=" + server_path;
		secret = "DzracCkoJ12usH_8xCe2sG8of3I";
		//the token is valid for 1 hour from <timestamp> if we want to decrease this time
		// we need to subtract (60000 - <time in minutes multiply by 1000>) from <timestamp>
		// before put it in <ts> 
		let ts = "timestamp=" + timestamp;
		let to_sign = ([eager, public_id, ts]).join("&");
		let token = URLSafeBase64.encode(sha1(to_sign + secret));
		if(req.user)
			console.log('generate token for user: ' + req.user.id + ' token: ' + token) 
		else
			console.log('generate token for user: 1' + ' token: ' + token) 
		res.send( {
			public_id: server_path,
			timestamp: timestamp,
			eager: "w_1080,h_720,c_crop",
			signature: token,
			api_key: "141879543552186",
		});
	}
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
