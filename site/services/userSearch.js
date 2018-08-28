let mongoose = require('mongoose');
let config = require('../config.js');
let User = require('../models/User.js');
let Q = require('q');
let request = require('request');
let Data = require('../user_data/data.js');
let moment = require('moment');

let geocoder = require('./geocoderService');

const WEEK = 1000 * 60 * 60 * 24 * 7;

// Filter all returned users by the given filter params
module.exports.sortUsers = function (req, users, options){

    let dates = {};
    let when = req.query.when ? req.query.when.split('-') : null;
    dates.departure = when ? moment.utc(when[0].trim(), "MM/DD/YYYY").valueOf() : null;
    dates.returnDate = when ? moment.utc(when[1].trim(), "MM/DD/YYYY").valueOf() : null;

    users.forEach((user) => {
        user.relevance = getHighestTravelScore(user, options.geo, dates, req);

        // filterDestination(user, geo);
        // filterDates(user, query.dates, destination);
        // filterGuests(req, user, destination);
        // filterRooms(user, query.room);
        // filterAmenities(user, query.amenities);

    });
    return users.sort(function(a, b){
        return b.relevance - a.relevance;
    });
};

module.exports.findMatchingTravelers = function (users){

    let filteredUsers = [];

    users.forEach((user) => {
        findMatches(user, users);
    });
    filteredUsers = users.filter(u => {
        return u.travelingInformation.length > 0;
    });
    return filteredUsers;
};

function findMatches(user, users){
    user.travelingInformation.forEach((info) => {
        info._doc.matches = [];
        users.forEach((_user) => {
            if(_user._id == user._id){
                return;
            }
            // check first if the user's traveling destination is the same as the other user's address
            if(info.destination && ((info.destination.city && matchPlaces(_user, info.destination) === 1) || (!info.destination.city && info.destination.country && matchPlaces(_user, info.destination) >= 0.3))){
                _user.travelingInformation.forEach((_info) => {
                    if(_info.destination && ((_info.destination.city && matchPlaces(user, _info.destination) === 1)
                        || (!_info.destination.city && _info.destination.country && matchPlaces(user, _info.destination) >= 0.3))){
                        info._doc.matches.push({
                            firstName: _user.firstName,
                            lastName: _user.lastName,
                            _id: _user._id,
                            city: _user.city,
                            country: _user.country,
                            travelPlan: {fullDestination: _info.fullDestination, dates:_info.dates, overlappingDays : getOverlappingDays(_info, info), isWithinMonth: isWithinRange(info,_info,4),isWithinWeek: isWithinRange(info,_info,1) }
                        });
                    }
                });
            }
        });
    });
    // user.travelingInformation =  user.travelingInformation.filter(info => {
    //     return info._doc.matches.length > 0;
    // });
}

function matchPlaces(user, geo){
    if(!geo){
        return 0.4;
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

function getHighestTravelScore(user, geo, searchDates, req){
    let score = 0;
    let placesRelevancePercent = 80;
    let datesRelevancePercent = 20;
    let placesAndDatesRelevance = 60;
    let fromRelevance = 0.4;
    let toRelevance = 0.6;

    // match search address and user address
    let from = matchPlaces(user, geo);

    // if user not logged in and search is only by user's location,
    // return higher score for users who are currently traveling
    if(!req.user){
        let travelRelevance = (user.travelingInformation && user.travelingInformation.length > 0)?1:0.8;
        placesAndDatesRelevance = (from * placesRelevancePercent) / 100  * placesAndDatesRelevance * travelRelevance;
        return placesAndDatesRelevance;
    }

    // if the user has no traveling information then return only
    // the places relevance percent of total places and dates relevance
    if(!user.travelingInformation || user.travelingInformation.length == 0){
        return (from * fromRelevance * placesRelevancePercent) / 100  * placesAndDatesRelevance;
    }
    user.travelingInformation.forEach(travel => {

        // match travel destinations to the searching user's address
        let to = matchPlaces(req.user, travel.destination.country?travel.destination:null);

        let travelDates = {
            departure: travel.departure,
            returnDate: travel.returnDate,
        };

        let totalDatesRelevance;
        // if user has not specified dates (set date for 'Anytime')
        // then the date is a match but not full score
        if(!travelDates.departure || !travelDates.returnDate){
            totalDatesRelevance = 0.3;
        }
        else{
            let overlappingDays = getOverlappingDays(travelDates, searchDates);
            totalDatesRelevance = !overlappingDays?0:overlappingDays / getDaysBetween(searchDates.returnDate, searchDates.departure);
        }

        // if places and travel search were a match and dates match too,
        // then the total places and dates relevance increases
        if(from > 0 && to > 0 && totalDatesRelevance > 0){
            placesAndDatesRelevance = 90;
        }
        let totalPlaceRelevance = ((from * fromRelevance) + (to * toRelevance))  * placesRelevancePercent;
        totalDatesRelevance = totalDatesRelevance * datesRelevancePercent;

        let finalTravelRelevance = (totalPlaceRelevance + totalDatesRelevance) / 100 * placesAndDatesRelevance;
        if (finalTravelRelevance > score){
            score = finalTravelRelevance;
        }
    });

    return score;
}

/**
 * Find the number of overlapping days between two date ranges.
 *
 * @param dateRange1 - the departure and returnDate of first date range
 * @param dateRange2 - the departure and returnDate of second date range
 * @return {number} - number of overlapping days
 */
function getOverlappingDays(dateRange1, dateRange2){
    if(!dateRange1.departure || !dateRange2.departure || !dateRange1.returnDate || !dateRange2.returnDate){
        return 0;
    }
    let max = Math.max(dateRange2.departure, dateRange1.departure);
    let min = Math.min(dateRange2.returnDate, dateRange1.returnDate);
    return getDaysBetween(min, max);
}

/**
 * Get number of days between two dates
 * @param first
 * @param second
 */
function getDaysBetween(first, second){
    if(first - second < 0)
        return 0;
    return Math.floor(( first - second ) / 86400000); // devide by days 24 * 60 * 60 * 1000
}

/**
 * Find if the dates are within a given number of weeks range.
 *
 * @param dateRange1 - the departure and returnDate of first date range
 * @param dateRange2 - the departure and returnDate of second date range
 * @param numOfWeeks - number of weeks
 * @return {boolean} - if within two week range
 */
function isWithinRange(dateRange1, dateRange2, numOfWeeks){
    if(!dateRange1.departure || !dateRange2.departure || !dateRange1.returnDate || !dateRange2.returnDate){
        return false;
    }
    return (dateRange2.returnDate <= dateRange1.returnDate && dateRange1.departure - numOfWeeks * WEEK <= dateRange2.returnDate) || (dateRange2.departure >= dateRange1.departure && dateRange1.returnDate + numOfWeeks * WEEK >= dateRange2.departure)
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