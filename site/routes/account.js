var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User.js');
var path = require('path');
var fs = require('fs');
var Q = require('q');
var Data = require('../user_data/data.js');

var multer = require('multer');
var upload = multer({dest: 'uploads/', limits: {files: 8}});

var NodeGeocoder = require('node-geocoder');

var options = {
    provider: 'google',

    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: 'AIzaSyBWmFeAXp3C9w8cwVHu6emXoQpmgJis9Hw', // for Mapquest, OpenCage, Google Premier
    formatter: null         // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(options);


// const siteUrl = "http://swapshome.com:3000/";
const siteUrl = "http://localhost:3000/";

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
                User.findOne({_id: id}, function (err, user) {
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
                    User.findOne({_id: id}, function (err, user) {
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
                            User.findOne({_id: id}, function (err, user) {
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
    var departure = dates ? Date.parse(dates[0].trim()) : undefined;
    var returnDate = dates ? Date.parse(dates[1].trim()) : undefined;
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
                    User.findOne({_id: id}, function (err, user) {
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
                if (travelingInfo[index].where != where) {
                    if (travelingDest.indexOf(travelingInfo[index]) != -1) {
                        travelingDest.splice(travelingDest.indexOf(travelingInfo[index].where), 1);
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
                        User.findOne({_id: id}, function (err, user) {
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
                            var fileName = url.substring(url.indexOf('uploads/'));
                            var targetPath = path.resolve('public/images/' + fileName);
                            try {
                                fs.unlinkSync(targetPath);
                                console.log("File deleted");
                                res.json(user);
                            }
                            catch (err) {
                                error.message = "File not removed \n" + err;
                                res.json(error);
                            }
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
    var requestIds = req.user.requests.filter(function (request) {
        return request.status != Data.getRequestStatus().canceled;
    });
    requestIds = requestIds.map(function (request) {
        return request.userId;
    });
    if (requestIds.length == 0) {
        res.json(requestIds);
        return;
    }
    User.find({_id: {$in: requestIds}}, Data.getVisibleUserData().accessible, function (err, users) {
        if (err) {
            error.message = err;
            res.json(error);
        }
        else {
            res.json(users);
        }
    });
});




router.put('/add-favorite', function (req, res, next) {
    var id = req.user.id;
    var newFavorite = req.body.favorite;

    console.log("Got a PUT request on /account/add-favorite");


    User.update({_id: id}, {

        "$push": {
            "favorites": newFavorite
        }

    }, function (err, user) {
            if (err) {
                error.message = err;
                res.json(error);
            } else {
                console.log("\t\t\t\tNEW FAV: " + JSON.stringify(newFavorite));

                res.json(user);
            }
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


//  This one is causing some warnings, but we need it.
var ObjectID     = require('mongodb').ObjectID;

router.get('/get-favorites', function (req, res, next) {

    var favs = req.user.favorites;

    var ids = favs.map(function(fave) {
        return ObjectID(String(fave._id));
    });

    var favorites = [];

    function addToFavs(users) {
        favorites = users;
        res.json({favorites: favorites});
    }

    User.find({ '_id': { $in: ids } }, function(err, users) {
        if(err) {
            console.log("ERROR IN ARR error = " + err);
            error.message = err;
        } else {
            addToFavs(users);
        }
    });

});


router.put('/unset-favorite', function (req, res, next) {
    console.log("INSIDE UNSER FAVS");
    var user = req.user;
    var toDelete = req.body.id;

    console.log("Line 490");

    User.update(
        { _id: user._id },
        { $pull: { 'favorites': { _id: toDelete } } }, function(err, ans) {
            if (err) {
                console.log("ERROR IN DELETING FAV");
                res.json({error: err});
            } else {
                console.log("FOUND!");
                res.json(user);
            }


        }
    );

});

module.exports = router;
