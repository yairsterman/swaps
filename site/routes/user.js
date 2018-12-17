let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let User = require('../models/User.js');
let Data = require('../user_data/data.js');
let geocoder = require('../services/geocoderService');
let UserSearch = require('../services/userSearch');
let config = require('../config');


let error = {
	error: true,
	message: ''
};

const USERS_PER_PAGE = 12;

router.get('/getUsers', function(req, res, next) {
    // user's country or user's current location city
	let destination = req.user?req.user.country:req.query.destination?req.query.destination:null;
    let from = req.query.from; // searching for users from
    let guests = req.query.guests?parseInt(req.query.guests):null;
    let page = req.query.page?parseInt(req.query.page):0;
    let when = req.query.when;
    let amenities = req.query.amenities;
    let room = req.query.room;
    let params = {};
    let or = [];

    geocoder.geocode(from).then((geo) =>{
        setRequiredParams(params);
        if(guests){
            params['apptInfo.guests'] = {'$gt':(guests-1)}; //guests less then
        }
        if(amenities){
            amenities = amenities.split(',').map(a => {
                return parseInt(a);
            });
            params['apptInfo.amenities'] = {'$all':amenities};
        }
        if(room){
            room = room.split(',');
            params['apptInfo.roomType'] = {'$in':room};
        }
        // if users' country was specified, find only users traveling to the same country
        // if(destination){
        //     // if searching by user's current location then find user's by city
        //     if(req.query.destination){
        //         or.push({"travelingInformation.destination.city": {$regex: destination, $options: 'i'}});
        //     }
        //     else{
        //         or.push({"travelingInformation.destination.country": {$regex: destination, $options: 'i'}});
        //     }
        //     or.push({"travelingInformation.destination": null});
        //     params["$or"] = or;
        // }
        // if no user is logged in or country is not filled, find all users traveling
        // else{
        //     or.push({"travelingInformation.0": {$exists:true}});
        // }
        // // or who allowed to view home
        // or.push({allowViewHome: true});
        // params["$or"] = or;

        if(geo){
            params.country = {$regex: geo.country, $options: 'i'};
        }
        if(req.user){
            params._id = {"$ne": req.user._id};
        }

        User.find(params, Data.getVisibleUserData().accessible)
            .populate({
                path: 'community',
                select: Data.getCommunityData(),
            })
            .populate({
                path: 'requests',
                match: {status: Data.getRequestStatus().confirmed},
                select: 'status checkin checkout'
            })
            .exec(function (err, users) {
            if (err){
                error.message = "error finding users";
                res.json(error);
            }
            else{
                let matches = UserSearch.sortUsers(req, users, {geo:geo, dates: when, guests:guests});
                let sortedUsers = matches.exactMatches.concat(matches.closeMatches);
                let length = sortedUsers.length;
                let exactMatchesLength = matches.exactMatches.length;
                res.json({users: getPage(sortedUsers, page), total: length, page: page, exactMatchesLength:exactMatchesLength});
            }
        });
    });
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

router.get('/get-all-users-admin', function(req, res, next) {
    let password = req.query.password;
    if(password !== config.ADMIN_PASSWORD){
        error.message = "No Access";
        res.json(error);
        return;
    }
    let complete = req.query.complete;
    let names = req.query.names;
    let params = {};
    if(complete){
        setRequiredParams(params);
    }
    let projection = {};
    if(names){
        projection = {
            firstName: true,
            lastName: true
        }
    }
    User.find(params,projection)
        .populate({
            path: 'community',
            select: Data.getCommunityData(),
        })
        .exec(function (err, users) {
            if (err) return next(err);
            res.json({users: users});
        });
});

router.get('/searchTravelInformation', function(req, res, next) {
    let password = req.query.password;
    if(password !== config.ADMIN_PASSWORD){
        error.message = "No Access";
        res.json(error);
        return;
    }

    let params = {};
    setRequiredParams(params);
    params['travelingInformation.0'] = {$exists: true};// at least 1 travel plan
    let projection = {
        firstName: true,
        lastName: true,
        city : true,
        country: true,
        'travelingInformation.fullDestination' : true,
        'travelingInformation.returnDate' : true,
        'travelingInformation.departure' : true,
        'travelingInformation.dates' : true,
        'travelingInformation.guests' : true,
        'travelingInformation.destination' : true
        // travelingInformation: {
        //     fullDestination: true,
        //     returnDate: true,
        //     departure: true,
        //     dates: true,
        //     guests: true,
        // }
    };
    User.find(params,projection)
        .exec(function (err, users) {
            if (err) return next(err);

            users = UserSearch.findMatchingTravelers(users);
            res.json({users: users});
        });
});

router.get('/get-featured-users', function(req, res, next) {
    let params = {};
    setRequiredParams(params);
    params = {featured: true};
    if(req.user){
        params._id = {"$ne": req.user._id};
    }
    User.find(params, Data.getVisibleUserData().accessible)
        .populate({
            path: 'community',
            select: Data.getCommunityData(),
        })
        .limit(10).sort({rating: -1})
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
    User.find(params, Data.getVisibleUserData().accessible)
        .populate({
            path: 'community',
            select: Data.getCommunityData(),
        }).limit(3)
        .exec(function (err, users) {
            if (err) return next(err);
            res.json({users: users});
        });
});

router.get('/get-user', function(req, res, next) {
    if(!req.user){
        error.message = "No Access";
        res.json(error);
        return;
    }
    let id = req.user._id;
    User.findOne({_id: id}, Data.getVisibleUserData().restricted)
        .populate({
            path: 'community',
            select: Data.getCommunityData(),
        })
        .populate({
            path: 'reviews',
            populate: {path: 'reviewer', select: 'firstName image city country'},
        })
        .populate({
            path: 'requests',
            match: {status: {$ne: Data.getRequestStatus().canceled}},
            select: Data.getRequestData(),
            populate: [{path: 'user1', select: Data.getRequestUserData(), match: {_id: {$ne: id}} },{path: 'user2', select: Data.getRequestUserData(), match: {_id: {$ne: id}} }]
        })
        .exec(function (err, user) {
            if (err) return next(err);
            res.json(user);
        });
});

router.get('/get-profile', function(req, res, next) {
    var id = req.query.id;

    User.findOne({_id:id}, Data.getVisibleUserData().accessible)
        .populate({
            path: 'community',
            select: Data.getCommunityData(),
        })
        .populate({
            path: 'reviews',
            populate: {path: 'reviewer', select: 'firstName image city country'},
        })
        .populate({
            path: 'requests',
            match: {status: Data.getRequestStatus().confirmed},
            select: 'status checkin checkout'
        })
        .exec(function (err, user) {
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
	if(dates.length < 2){
        return true;
    }
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
    params['photos.0'] = {$exists: true};// at least 1 photo
    params['apptInfo.rooms'] = {$exists: true}; // number of rooms set
    params['apptInfo.beds'] = {$exists: true};// number of beds set
    params['apptInfo.baths'] = {$exists: true};// number of baths set
    params['apptInfo.roomType'] = {$exists: true};// room type set
    params['apptInfo.title'] = {$ne: ''}; // home title set
}

function getPage(users, pageNum){
    users.splice((pageNum + 1) * USERS_PER_PAGE);
    users.splice(0, pageNum * USERS_PER_PAGE);
    return users;
}

module.exports = router;
