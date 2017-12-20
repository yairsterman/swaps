var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User.js');
var Data = require('../user_data/data.js');

var error = {
	error: true,
	message: ''
};

const USERS_PER_PAGE = 10;

/* GET /Users listing. */
router.get('/', function(req, res, next) {
    User.find(function (err, Users) {
        if (err) return next(err);
        res.json(Users);
    });
});


router.get('/get-user-by-travelingDest', function(req, res, next) {
	var destination = req.query.dest.split('-')[0];
	var from = req.query.from;
	var guests = req.query.guests?parseInt(req.query.guests):null;
	var page = parseInt(req.query.page);
    if(from){
		var params = {};
        setRequiredParams(params);
        if(req.query.guests){
            params['apptInfo.guests'] = {'$lt':(guests+1)}; //guests less then
        }
		if(req.query.dest && req.query.dest != 'undefined'){
			params.travelingDest = {$regex: destination, $options: 'i'};
		}
		if(from.toLowerCase() != 'anywhere'){
			params.city = {$regex: from, $options: 'i'};
		}
		if(req.user){
		    if(req.user.facebookId){
                params.facebookId = {"$ne": req.user.facebookId};
            }
            if(req.user.googleId){
                params.googleId = {"$ne": req.user.googleId};
            }
        }

		User.find(params, Data.getVisibleUserData().accessible, function (err, users) {
			if (err){
				error.message = "error finding users";
				res.json(error);
			}
			else{
                var filterdUsers = filterUsers(req, users, req.query);
                var length = filterdUsers.length;
                // return the users according to the given page number
                console.log((page + 1) * USERS_PER_PAGE);
                filterdUsers.splice((page + 1) * USERS_PER_PAGE);
                filterdUsers.splice(0, page * USERS_PER_PAGE);
                res.json({users: filterdUsers, total: length, page: page});
            }
		});
    }
    else{
        User.find({travelingDest: {$regex: destination, $options: 'i'}}, Data.getVisibleUserData().accessible, function (err, users) {
            if (err){
                error.message = "error finding users";
                res.json(error);
            }
            res.json(getRandomUsers(users));
        });
    }
});

router.get('/get-all-users', function(req, res, next) {
    var params = {};
    setRequiredParams(params);
    User.find(params, Data.getVisibleUserData().accessible).limit(10)
        .exec(function (err, users) {
            if (err) return next(err);
            res.json({users: users});
        });
});

router.get('/get-featured-users', function(req, res, next) {
    var params = {};
    setRequiredParams(params);
    params = {rating: {$gt: 4}, traveling:true};
    if(req.user){
        params._id = {"$not": req.userId};
    }
    User.find(params, Data.getVisibleUserData().accessible).limit(10).sort({rating: -1})
        .exec(function (err, users) {
            if (err) return next(err);
            res.json({users: users});
        });
});

router.get('/get-new-users', function(req, res, next) {
    var params = {};
    setRequiredParams(params);
    if(req.user){
        params['reviews.0'] = {$exists: false};
    }
    User.find(params, Data.getVisibleUserData().accessible).limit(3)
        .exec(function (err, users) {
            if (err) return next(err);
            res.json({users: users});
        });
});

router.get('/get-user', function(req, res, next) {
    var id = req.user._id;

    User.findOne({_id: id}, function (err, user) {
        if (err) return next(err);
        res.json(user);
    });
});

router.get('/get-profile', function(req, res, next) {
    var id = req.query.id;

    User.findOne({_id:id}, Data.getVisibleUserData().accessible, function (err, user) {
        if (err) return next(err);
        console.log(user);
        res.json(user);
    });
});

//Get 8 random users who are currently traveling
function getRandomUsers(users){
    var randomUsers = [];
    while(randomUsers.length < 8 && users.length > 0){
        var index = Math.floor((Math.random() * users.length) + 1) - 1;
        var flag = true;
        for(i = 0; i < randomUsers.length; i++){
            if(randomUsers[i].country == users[index].country && users[index].traveling){
                flag = false;
                break;
            }
        }
        if(flag){
            randomUsers.push(users[index]);
        }
        users.splice(index,1);
    }
    return randomUsers;
}

// Filter all returned users by the given filter params
function filterUsers(req, users, query){

	var filterdUsers = [];
	var destination = query.dest;
    if(!users){
        return filterdUsers;
    }
	for (var i = 0; i < users.length; i++) {
		var user = users[i];
		if(filterDestination(user, destination) &&
			filterDates(user, query.dates, destination) &&
            	filterGuests(req, user, destination) &&
                    filterRooms(user, query.room) &&
            			filterAmenities(user, query.amenities)) {
			filterdUsers.push(users[i]);
		}
	}
	return filterdUsers;
}

function filterGuests(req, user, destination){
    if(!req.user || user.allowViewHome){
        return true;
    }
    // if(!user.travelingInfo && !user.allowViewHome){
    //     return false;
    // }
    // if(user.allowViewHome || !guests || !req.user){
    //     return true;
    // }
    for (var i = 0; i < user.travelingInfo.length; i++) {
        if(compareDestinations(user.travelingInfo[i].destination, destination)){
            if(req.user.apptInfo.guests >= user.travelingInfo[i].guests){
                return true;
            }
        }
    }
    return false;
}

function filterRooms(user, _roomTypes){
    if(!_roomTypes || _roomTypes == ''){
        return true;
    }
    var roomTypes = _roomTypes.split(',');
    if(roomTypes.length == 0 || roomTypes.includes(user.apptInfo.roomType.toString())){
        return true;
    }
    return false;
}

function filterAmenities(user, _amenities){
    if(!_amenities || _amenities == ''){
        return true;
    }
    var amenities = _amenities.split(',');
    if(amenities.length > 0 && user.apptInfo.amenities.length > 0){
        for(var i = 0; i < amenities.length; i++){
            if(!user.apptInfo.amenities.includes(parseInt(amenities[i]))){
                return false;
            }
        }
        return true;
    }
    else{
        return true;
    }
}

function filterDestination(user, destination){
    if(user.allowViewHome){
        return true;
    }
    for (var i = 0; i < user.travelingDest.length; i++) {
		if(compareDestinations(user.travelingDest[i], destination)){
			return true;
		}
	}
}

function filterDates(user, date, destination){
	if(!date || user.allowViewHome){
		return true;
	}
	var searchDates = {};
	var dates = date.split('-');
    searchDates.departure = Date.parse(dates[0].trim());
    searchDates.returnDate = Date.parse(dates[1].trim());
    for (var i = 0; i < user.travelingInfo.length; i++) {
        if(compareDestinations(user.travelingInfo[i].destination, destination)){
        	if(compareDates(user.travelingInfo[i], searchDates)){
                return true;
            }
        }
    }
    return false;
}

function compareDates(userDates, searchDates){
    if(!userDates.departure && !userDates.returnDate){
        return true;
    }
	return (searchDates.departure >= userDates.departure && searchDates.departure <= userDates.returnDate)
		|| (searchDates.returnDate >= userDates.departure && searchDates.returnDate <= userDates.returnDate)
        || (userDates.returnDate >= searchDates.departure && userDates.returnDate <= searchDates.returnDate);
}

function compareDestinations(userDestination, destination){
	if(!userDestination || !destination || userDestination == 'undefined' || destination == 'undefined'){
		return true;
	}
	userDestination = userDestination.split('-')[0].toLowerCase();
	destination = destination.split('-')[0].toLowerCase();
	return userDestination == destination;
}

function setRequiredParams(params){
    //required for all users to appear in search
    params.address = {$ne: ''}; // address is set
    params['photos.2'] = {$exists: true};// at least 3 photos
    params['apptInfo.rooms'] = {$exists: true}; // number of rooms set
    params['apptInfo.beds'] = {$exists: true};// number of beds set
    params['apptInfo.baths'] = {$exists: true};// number of baths set
    params['apptInfo.title'] = {$ne: ''}; // home title set
    params['$or'] = [{'travelingInfo.0':{$exists:true}},{allowViewHome:true}];// either traveling or allowed to view home
}

module.exports = router;
