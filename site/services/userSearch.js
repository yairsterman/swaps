let mongoose = require('mongoose');
let config = require('../config.js');
let User = require('../models/User.js');
let Q = require('q');
let request = require('request');
let Data = require('../user_data/data.js');

let geocoder = require('./geocoderService');

// Filter all returned users by the given filter params
module.exports.sortUsers = function (req, users, options){

    let placesRelevance = 60;
    users.forEach((user) => {
        user.relevance = matchPlaces(user, options.geo) * placesRelevance;
        // filterDestination(user, geo);
        // filterDates(user, query.dates, destination);
        // filterGuests(req, user, destination);
        // filterRooms(user, query.room);
        // filterAmenities(user, query.amenities);

    });
    return users.sort(function(a, b){
        return b.relevance - a.relevance;
    });
}

function matchPlaces(user, geo){
    if(!geo){
        return 1;
    }
    if(user.city && geo.city && user.city.toLowerCase() == geo.city.toLowerCase()){
        return 1 // 100% match
    }
    if(user.region && geo.region && user.region.toLowerCase() == geo.region.toLowerCase()){
        return 0.5 // 50% match
    }
    if(user.country && geo.country && user.country.toLowerCase() == geo.country.toLowerCase()){
        return 0.3 // 30% match
    }
    return 0;
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
    //get all travel information of the user that matches the given destination
    user.travelingDest.filter((travel) => {
        return travel.destination == destination || !travel.destination;
    });
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

/**
 * Gets all geo code information of the given search term.
 * @param term - the search term
 */
function getGeocodeInformation(term){
    let dfr = Q.defer();
    if(!term || term == ''){
        dfr.resolve(null);
    }
    geocoder.geocode(term)
        .then(function (geo) {
            dfr.resolve(goe);
        },function(err){
            dfr.reject(null);
        });

    return dfr.promise;
}