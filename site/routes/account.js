var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User.js');
var path = require('path');
var fs = require('fs');
var Q = require('q');
var Data = require('../user_data/data.js');

var multer  = require('multer');
var upload = multer({dest:  'uploads/',limits: {files: 8}});

var NodeGeocoder = require('node-geocoder');

var options = {
    provider: 'google',

    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: 'AIzaSyBWmFeAXp3C9w8cwVHu6emXoQpmgJis9Hw', // for Mapquest, OpenCage, Google Premier
    formatter: null         // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(options);


const siteUrl = "http://swapshome.com:3000/";

var error = {
	error: true,
	message: ''
};

router.post('/edit-profile', function(req, res, next) {
	var id = req.body._id;
	var address = req.body.address;
	var email = req.body.email;
    var aboutMe = req.body.aboutMe;
    var occupation = req.body.occupation;
    var age = req.body.age;
    var gender = req.body.gender;
    var thingsToDo = req.body.thingsToDo;
    var location = {};

    geocoder.geocode(address)
    .then(function(geo) {
        location.lat = geo[0].latitude.toFixed(3);
        location.long = geo[0].longitude.toFixed(3);
        var country = geo[0].country;
        var city = geo[0].city;
        if(!city){
            city = geo[0].administrativeLevels.level1long;
        }
        User.update({_id: id}, { $set: { country: country, city: city, address: address, email: email, aboutMe: aboutMe, occupation: occupation, location: location, gender: gender, age: age, thingsToDo: thingsToDo}},
            function (err, updated) {
                if (err){
                    error.message = err;
                    res.json(error);
                }
                else{
                    User.findOne({_id: id}, function (err, user) {
                        if (err){
                            error.message = err;
                            res.json(error);
                        }
                        else{
                            res.json(user);
                        }
                    });
                }
            });
    })
    .catch(function(err) {
        error.message = err;
        res.json(error);
    });
});

router.post('/edit-listing', function(req, res, next) {
    var id = req.body._id;
    var apptInfo = req.body.apptInfo;
    User.update({_id: id}, { $set: { apptInfo: apptInfo}}, function (err, updated) {
        if (err){
            error.message = err;
            res.json(error);
        }
        else{
            User.findOne({_id:id}, function (err, user) {
                if (err){
                    error.message = err;
                    res.json(error);
                }
                else{
                    res.json(user);
                }
            });
        }
    });
});

router.post('/update-travel-info', function(req, res, next) {
    var id = req.body.id;
    var info = req.body.info;
	var where = info.where.split(',')[0];
	var dates = info.date.split('-');
	var departure = Date.parse(dates[0].trim());
	var returnDate = Date.parse(dates[1].trim());
	var newInfo = {
		dest: where,
		departure: departure,
		returnDate: returnDate
	};
	console.log(newInfo);
	User.findOne({_id:id}, function (err, user) {
		if (err){
			error.message = err;
			res.json(error);
		}
		else{
			var travelingInfo = user.travelingInfo;
			var travelingDest = user.travelingDest;
            newInfo._id = travelingInfo.length + 1;
			travelingInfo.push(newInfo);
			travelingDest.push(where);
			User.update({_id: id}, { $set: {travelingInfo: travelingInfo, travelingDest: travelingDest, traveling: true}}, function (err, updated) {
				if (err){
					error.message = err;
					res.json(error);
				}
				else{
					User.findOne({_id:id}, function (err, user) {
						if (err){
							error.message = err;
							res.json(error);
						}
						else{
							res.json(user);
						}
					});
				}
			});
		}
	});
});

router.post('/delete-photo', function(req, res, next) {
    var id = req.body.id;
    var url = req.body.url;
    User.findOne({_id:id}, function (err, user) {
        if (err) throw err;
        else{
            if(user){
                var photos = user.photos;
                var index = user.photos.indexOf(url);
                if(index != -1){
                    photos.splice(index,1);
                    User.update({_id: id}, { $set: { photos: photos}}, function (err, updated) {
                        if (err){
                            error.message = "File not removed \n" + err;
                            res.json(error);
                        }
                        else{
                            var fileName = url.substring(url.indexOf('uploads/'));
                            var targetPath = path.resolve('public/images/' + fileName);
                            try{
                                fs.unlinkSync(targetPath);
                                console.log("File deleted");
                                res.json(user);
                            }
                            catch(err){
                                error.message = "File not removed \n" + err;
                                res.json(error);
                            }
                        }
                    });
                }
                else{
                    error.message = "File not found";
                    res.json(error);
                }
            }
            else{
                error.message = "File not removed";
                res.json(error);
            }
        }
    });
});

router.post('/upload', upload.array('photos', 8), function(req, res) {
    var id = req.body.id;
    var photos = [];
    for(i = 0; i < req.files.length; i++){
        var tempPath = req.files[i].path;
        if (path.extname(req.files[i].originalname).toLowerCase() === '.jpg') {
            var targetPath = path.resolve('public/images/' + tempPath + '.jpg');
            try{
                fs.renameSync(tempPath, targetPath);
                tempPath = tempPath.replace(/\\/g,"/");
                photos.push(siteUrl + 'images/' + tempPath + '.jpg');
            }
            catch(err){
                error.message = 'Error uploading file';
                res.redirect('/#/account/listing');
            }

        } else {
            try{
                fs.unlinkSync(tempPath);
                error.message = 'Wrong file type';
                res.redirect('/#/account/listing');
            }
            catch(err){
                throw err;
            }
        }
    }
    console.log("upload complete");
    User.findOne({_id:id}, function (err, user) {
        if (err) throw err;
        else{
            if(user){
                photos = user.photos.concat(photos);
                if(photos.length > 8){
                    photos.splice(8);
                }
                User.update({_id: id}, { $set: { photos: photos}}, function (err, user) {
                    if (err){
                        error.message = err;
                        res.redirect('/#/account/listing');
                    }
                    else{
                        console.log("updated DB");
                        res.redirect('/#/account/listing');
                    }
                });
            }
            else{
                // res.redirect('/#/account/listing');
            }
        }
    });
});

module.exports = router;
