var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User.js');

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
	// getQueryParams(req.query);
	var destination = req.query.dest.split('-')[0];
	var from = req.query.from;
	var page = parseInt(req.query.page);
    if(from){
		var params;
		if(from == 'Anywhere'){
			params = {travelingDest: {$regex: destination, $options: 'i'}};
		}
		else{
			params = {travelingDest: {$regex: destination, $options: 'i'}, city:{$regex: from, $options: 'i'}};
		}
         User.find(params, {firstName:true, lastName:true, age:true, gender:true, image:true, country:true, city:true, address:true, swaps:true, traveling:true, travelingDest:true, travelingInfo:true, aboutMe:true, ocupation:true, photos:true, reviews:true, apptInfo:true, rating:true}, function (err, users) {
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
        User.find({travelingDest: {$regex: destination, $options: 'i'}}, {firstName:true, lastName:true, age:true, gender:true, image:true, country:true, city:true, address:true, swaps:true, traveling:true, travelingDest:true, travelingInfo:true, aboutMe:true, ocupation:true, photos:true, reviews:true, apptInfo:true, rating:true}, function (err, users) {
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

router.get('/get-user', function(req, res, next) {
    var id = req.query.id;

    User.findOne({_id:id}, function (err, user) {
        if (err) return next(err);
        res.json(user);
    });
});

router.get('/get-profile', function(req, res, next) {
    var id = req.query.id;

    User.findOne({_id:id}, {firstName:true, lastName:true, age:true, gender:true, image:true, country:true, city:true, address:true, swaps:true, traveling:true, travelingDest:true, travelingInfo:true, aboutMe:true, ocupation:true, photos:true, reviews:true, apptInfo:true, rating:true}, function (err, user) {
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
	var destination = query.dest.split('-')[0];
	var dates;
	var departure = 0; // default start date
	var returnDate = 10000000000000; // default return date large number that is bigger than any other date
	if(query.date){
		dates = query.date.split('-');
		departure = Date.parse(dates[0].trim());
		returnDate = Date.parse(dates[1].trim());
	}
	for (var i = 0; i < users.length; i++) {
		for (var j = 0; j < users[i].travelingInfo.length; j++) {
			if(users[i].travelingInfo[j].dest.includes(destination) && users[i].travelingInfo[j].departure >= departure
				&& users[i].travelingInfo[j].returnDate <= returnDate){
					if(query.guests && users[i].apptInfo.guests < query.guests){
		                continue;
		            }
		            if(query.property && users[i].apptInfo.property != query.property){
		                continue;
		            }
		            if(query.room && users[i].apptInfo.room != query.room){
		                continue;
		            }
		            if(query.kitchen == 'true' && !users[i].apptInfo.kitchen){
		                continue;
		            }
		            if(query.wheelchair == 'true' && !users[i].apptInfo.wheelchair){
		                continue;
		            }
		            if(query.kids == 'true' && !users[i].apptInfo.kids){
		                continue;
		            }
		            if(query.smoking == 'true' && !users[i].apptInfo.smoking){
		                continue;
		            }
		            if(query.pets == 'true' && !users[i].apptInfo.pets){
		                continue;
		            }
		            if(query.parking == 'true' && !users[i].apptInfo.parking){
		                continue;
		            }
					filterdUsers.push(users[i]);
			}
		}
	}
	return filterdUsers
}

module.exports = router;
