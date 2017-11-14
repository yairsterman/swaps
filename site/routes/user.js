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
	var page = parseInt(req.query.page);
    if(from){
		var params = {};
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
			var filterdUsers = filterUsers(users, req.query);
			var length = filterdUsers.length;
			// return the users according to the given page number
			console.log((page + 1) * USERS_PER_PAGE);
			filterdUsers.splice((page + 1) * USERS_PER_PAGE);
			filterdUsers.splice(0, page * USERS_PER_PAGE);
			res.json({users: filterdUsers, total: length, page: page});
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

router.get('/all-users', function(req, res, next) {
    User.find({}, {username:true}, function (err, users) {
        if (err) return next(err);

        console.log(users);
        res.json(users);
    });
});

router.get('/get-featured-users', function(req, res, next) {
    var params = {rating: {$gt: 4}, traveling:true};
    if(req.user){
        params._id = {"$not": req.userId};
    }
    User.find(params, Data.getVisibleUserData().accessible).limit(10).sort({rating: -1})
        .exec(function (err, users) {
            if (err) return next(err);
            res.json({users: users});
        });
});

router.get('/get-user', function(req, res, next) {
    var id = req.query.id;

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
function filterUsers(users, query){

	var filterdUsers = [];
	var destination = query.dest;
    if(!users){
        return filterdUsers;
    }
	for (var i = 0; i < users.length; i++) {
		var user = users[i];
		if(filterDestination(user, destination) &&
			filterDates(user, query.date, destination) &&
            	filterGuests(user, query.guests) &&
            		filterProperty(user, query.property) &&
            			filterAmenities(user, query.ameneties)) {
			filterdUsers.push(users[i]);
		}
	}
	return filterdUsers;
}

function filterGuests(user, guests){
    if(guests && user.apptInfo && (!user.apptInfo.guests || user.apptInfo.guests < guests) ){
        return false;
    }
    return true;
}

function filterProperty(user, propertyType){
    if(propertyType && user.apptInfo.property != propertyType){
        return false;
    }
    return true;
}

function filterAmenities(user, amenities){
    if(amenities && user.apptInfo.amenities){
        for(var i = 0; i < amenities.length; i++){
            if(!user.apptInfo.amenities.includes(amenities[i])){
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
    for (var i = 0; i < user.travelingDest.length; i++) {
		if(compareDestinations(user.travelingDest[i], destination)){
			return true;
		}
	}
}

function filterDates(user, date, destination){
	if(!date){
		return true;
	}
	var searchDates = {};
	var dates = date.split('-');
    searchDates.departure = Date.parse(dates[0].trim());
    searchDates.returnDate = Date.parse(dates[1].trim());
    for (var i = 0; i < user.travelingInfo.length; i++) {
        if(compareDestinations(user.travelingInfo[i].dest, destination)){
        	if(compareDates(user.travelingInfo[i], searchDates)){
                return true;
            }
        }
    }
    return false;
}

function compareDates(userDates, searchDates){
	return (searchDates.departure >= userDates.departure && searchDates.departure <= userDates.returnDate)
		|| (searchDates.returnDate >= userDates.departure && searchDates.returnDate <= userDates.returnDate);
}

function compareDestinations(userDestination, destination){
	if(!userDestination || !destination || userDestination == 'undefined' || destination == 'undefined'){
		return true;
	}
	userDestination = userDestination.split('-')[0].toLowerCase();
	destination = destination.split('-')[0].toLowerCase();
	return userDestination == destination;
}

module.exports = router;
