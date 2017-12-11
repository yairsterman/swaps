

const visibleUserData = {
    accessible: {
        firstName:true,
        birthday:true,
        gender:true,
        image:true,
        country:true,
        city:true,
        radius:true,
        location:true,
        swaps:true,
        traveling:true,
        travelingDest:true,
        travelingInfo:true,
        aboutMe:true,
        occupation:true,
        photos:true,
        reviews:true,
        comments:true,
        apptInfo:true,
        allowViewHome:true,
        deposit:true,
        rating:true
    },
    member: {
        firstName:true,
        lastName:true,
        birthday:true,
        gender:true,
        image:true,
        country:true,
        city:true,
        radius:true,
        location:true,
        swaps:true,
        traveling:true,
        travelingDest:true,
        travelingInfo:true,
        aboutMe:true,
        occupation:true,
        photos:true,
        reviews:true,
        comments:true,
        apptInfo:true,
        allowViewHome:true,
        deposit:true,
        rating:true
    },
    restricted: {
        firstName:true,
        lastName:true,
        birthday:true,
        gender:true,
        image:true,
        country:true,
        city:true,
        address:true,
        swaps:true,
        traveling:true,
        travelingDest:true,
        travelingInfo:true,
        aboutMe:true,
        occupation:true,
        photos:true,
        reviews:true,
        comments:true,
        apptInfo:true,
        deposit:true,
        thingsToDo:true,
        allowViewHome:true,
        rating:true,
        radius:true,
        location:true,
        messages: true,
        requests: true
    }
};

const amenities = [
    {id: 0, name: 'kitchen', displayName:'Kitchen', icon:'icon-kitchen'},
    {id: 1, name: 'wifi', displayName:'Wi-Fi', icon:'icon-wifi'},
    {id: 2, name: 'washer', displayName:'Washer', icon:'icon-washer'},
    {id: 3, name: 'dryer', displayName:'Dryer', icon:'icon-hairdry'},
    {id: 4, name: 'shower', displayName:'Shower', icon:'icon-shower'},
    {id: 5, name: 'elevator', displayName:'Elevator', icon:'icon-elevator'},
    {id: 6, name: 'garden', displayName:'Garden', icon:'icon-vegen'},
    {id: 7, name: 'bathroom', displayName:'Private Bathroom', icon:'icon-privateB'},
    {id: 8, name: 'parking', displayName:'Parking', icon:'icon-parking'},
    {id: 9, name: 'air', displayName:'Air Conditioning', icon:'icon-snowflake'},
    {id: 10, name: 'heat', displayName:'Heating', icon:'icon-heating'},
    {id: 11, name: 'laptop', displayName:'Laptop Friendly', icon:'icon-LAPTOP'},
    {id: 12, name: 'tv', displayName:'TV', icon:'icon-TV'},
    {id: 13, name: 'entrance', displayName:'Private Entrance', icon:'icon-privateE'},
    {id: 14, name: 'gym', displayName:'Gym', icon:'icon-gym'},
    {id: 15, name: 'wheelchair', displayName:'Wheelchair Accessible', icon:'icon-wheelchair'},
    {id: 16, name: 'doorman', displayName:'Doorman', icon:'icon-doorman'},
    {id: 17, name: 'iron', displayName:'Iron', icon:'icon-iron'},
    {id: 18, name: 'pool', displayName:'Pool', icon:'icon-pool'},
    {id: 19, name: 'hottub', displayName:'Hot Tub', icon:'icon-hotub'},

];

const thingsToDo = [
    {id: 0, name: 'club', displayName:'Clubbing', icon:'icon-club', img:'../images/icons/club.png'},
    {id: 1, name: 'bar', displayName:'Cocktail Bars', icon:'icon-bar', img:'../images/icons/bar.png'},
    {id: 2, name: 'gym', displayName:'Gym', icon:'icon-gym', img:'../images/icons/gym.png'},
    {id: 3, name: 'theater', displayName:'Theater', icon:'icon-cinema', img:'../images/icons/cinema.png'},
    {id: 4, name: 'museum', displayName:'Museums', icon:'icon-museum', img:'../images/icons/museum.png'},
    {id: 5, name: 'art gallery', displayName:'Art galleries', icon:'icon-gallery', img:'../images/icons/gallery.png'},
    {id: 6, name: 'extreme sports', displayName:'Extreme sports', icon:'icon-extreme', img:'../images/icons/extreme.png'},
    {id: 7, name: 'vegan restaurant', displayName:'Vegan restaurants', icon:'icon-vegen', img:'../images/icons/vegen.png'},
    {id: 8, name: 'music concerts', displayName:'Music Concerts', icon:'icon-music', img:'../images/icons/music.png'},
    {id: 9, name: 'walking tour', displayName:'Walking tours', icon:'icon-walking', img:'../images/icons/walking.png'},
    {id: 10, name: 'bus tour', displayName:'Bus tours', icon:'icon-bus', img:'../images/icons/bus.png'},
    {id: 11, name: 'cafe', displayName:'Local Cafes', icon:'icon-coffee', img:'../images/icons/coffee.png'},
    {id: 12, name: 'restaurant', displayName:'Local food', icon:'icon-restaurant', img:'../images/icons/restaurant.png'},
    {id: 13, name: 'workspace', displayName:'Workspaces', icon:'icon-LAPTOP', img:'../images/icons/LAPTOP.png'},
    {id: 14, name: 'market', displayName:'Market', icon:'icon-shopping', img:'../images/icons/openmarket.png'},
    {id: 15, name: 'zoo', displayName:'Zoo', icon:'icon-zoo', img:'../images/icons/zoo.png'},
    {id: 16, name: 'park', displayName:'Park', icon:'icon-park', img:'../images/icons/park.png'},
    {id: 17, name: 'beach', displayName:'Beach', icon:'icon-beach', img:'../images/icons/beach.png'},
    // {id: 18, name: 'gay', displayName:'Gay friendly', icon:'icon-dryer'},
];

const houseRules = [
    {id: 0, name: 'pets', displayName:'Pets Allowed', icon:'icon-pets'},
    {id: 1, name: 'smoking', displayName:'No Smoking', icon:'icon-nosmoking'},
    {id: 2, name: 'events', displayName:'Suitable For Events', icon:'icon-cocktail'},
    {id: 3, name: 'children', displayName:'Suitable For Children', icon:'icon-kids'}
];

const requestStatus ={
    pending: 0,
    confirmed: 1,
    canceled: 2,
};

const genders =[
    {value:1, name:'Female'},
    {value:2, name:'Male'},
    {value:3, name:'Other'}
];

const roomType =[
    {id: 0, type: 'SingleRoom', displayName: 'Single Room'},
    {id: 1, type: 'EntireApartment', displayName: 'Entire Apartment'},
    {id: 2, type: 'SharedRoom', displayName: 'Shared Room'},
];

const securityDeposit =[
    {id: 0, type: 'basic', displayName: 'Basic', value:100},
    {id: 1, type: 'bronze', displayName: 'Bronze', value:150},
    {id: 2, type: 'silver', displayName: 'Silver', value:200},
    {id: 3, type: 'gold', displayName: 'Gold', value:300},
    {id: 4, type: 'platinum', displayName: 'Platinum', value:400},
    {id: 5, type: 'diamond', displayName: 'Diamond', value:400},
];

const creditCards = [
    {id: 0, type: 'visa', displayName: 'Visa'},
    {id: 1, type: 'mastercard', displayName: 'Mastercard'},
    {id: 2, type: 'americanExpress', displayName: 'American Express'},
]

const months = [
    {id: 1, name: 'January'},
    {id: 2, name: 'February'},
    {id: 3, name: 'March'},
    {id: 4, name: 'April'},
    {id: 5, name: 'May'},
    {id: 6, name: 'June'},
    {id: 7, name: 'July'},
    {id: 8, name: 'August'},
    {id: 9, name: 'September'},
    {id: 10, name: 'October'},
    {id: 11, name: 'November'},
    {id: 12, name: 'December'},
]

const years = [
    2018,2019,2020,2021,2022,2023,2024,2025,2026,2027,2028,2029,2030
]


var data = {

};

var dataForSite = {
    amenities: amenities,
    thingsToDo: thingsToDo,
    requestStatus: requestStatus,
    houseRules: houseRules,
    genders: genders,
    roomType: roomType,
    securityDeposit: securityDeposit,
    creditCards: creditCards,
    months: months,
    years: years
}

data.getAmenities = function(){
    return amenities;
};

data.getVisibleUserData = function(){
    return visibleUserData;
};

data.getRequestStatus = function(){
    return requestStatus;
};

data.getRoomType = function(){
    return roomType;
};

data.getThingsToDo = function(){
    return thingsToDo;
};

data.getGenders = function(){
    return genders;
};

data.getSecurityDeposit = function(){
    return securityDeposit;
};

data.getCreditCards = function(){
    return creditCards;
};

data.getHouseRules = function(){
    return houseRules;
};

data.getData = function(){
    return dataForSite;
};

module.exports = data;