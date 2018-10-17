

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
        travelingInformation:true,
        travelingInfo:true,
        aboutMe:true,
        occupation:true,
        photos:true,
        reviews:true,
        comments:true,
        apptInfo:true,
        allowViewHome:true,
        deposit:true,
        community:true,
        rating:true
    },
    member: {
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
        travelingInformation:true,
        travelingInfo:true,
        aboutMe:true,
        occupation:true,
        photos:true,
        reviews:true,
        comments:true,
        apptInfo:true,
        allowViewHome:true,
        deposit:true,
        community:true,
        verifications: true,
        rating:true
    },
    restricted: {
        firstName:true,
        lastName:true,
        birthday:true,
        email:true,
        gender:true,
        image:true,
        country:true,
        city:true,
        address:true,
        swaps:true,
        traveling:true,
        travelingInformation:true,
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
        favorites:true,
        rating:true,
        radius:true,
        location:true,
        messages: true,
        requests: true,
        googleId: true,
        localId: true,
        community:true,
        verifications: true,
        facebookId: true,
        referredBy: true,
    }
};

const amenities = [
    {id: 0, name: 'kitchen', displayName:'Kitchen', icon:'icon-kitchen'},
    {id: 1, name: 'wifi', displayName:'Wi-Fi', icon:'icon-wifi'},
    {id: 2, name: 'washer', displayName:'Washer', icon:'icon-washer'},
    {id: 3, name: 'dryer', displayName:'Dryer', icon:'icon-Dryer'},
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
    {id: 20, name: 'firplace', displayName:'Fire Place', icon:'icon-fire'},
    {id: 21, name: 'hairdryer', displayName:'Hair Dryer', icon:'icon-hairdry'},

];

const thingsToDo = [
    {id: 0, name: 'club', displayName:'Clubbing', icon:'icon-club', img:'../images/icons/club.png'},
    {id: 1, name: 'bar', displayName:'Cocktail Bars', icon:'icon-cocktail', img:'../images/icons/cocktail.png'},
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
    accepted: 1,
    confirmed: 2,
    canceled: 3,
    complete: 4,
};

const requestType ={
    request: 0,
    accept: 1,
    confirm: 2,
    cancel: 3,
};

const visibleRequestData ={
    transactionUser1: false,
    transactionUser2: false,
    verifyTransactionUser1: false,
    verifyTransactionUser2: false,
};

const requestUserData = 'firstName image photos _id apptInfo country city reviews rating occupation';

const requestData = 'guests1 guests2 user1 user2 nights checkin checkout proposition status';


const transactionType = {
    verify: 0,
    regular: 1,
    refund: 2,
    rejected: 3,
};

const transactionMode = {
    verify: 'V',
    regular: 'A',
    refund: 'C',
    rejected: 3,
};

const genders =[
    {value:1, name:'Female'},
    {value:2, name:'Male'},
    {value:3, name:'Other'}
];

const roomType =[
    {id: 0, type: 'SingleRoom', displayName: 'Single Room'},
    {id: 1, type: 'EntirePlace', displayName: 'Entire Place'},
    {id: 2, type: 'SharedRoom', displayName: 'Shared Room'},
];

const securityDeposit =[
    {id: 0, type: 'nomad', displayName: 'Nomad', value:1 , night:1, week:70, damage: 150},
    {id: 1, type: 'explorer', displayName: 'Explorer', value:5, night:5, week:350, damage: 800},
    {id: 2, type: 'cosmopolite', displayName: 'Cosmopolite', value:12, night:12, week:840, damage: 2000},
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

const weekendStart = [
    {id: 0, calendarDay: 4, value:"Thu", displayName: "Thursday"},
    {id: 1, calendarDay: 5, value:"Fri", displayName: "Friday"}
]

const weekendEnd = [
    {id: 0, calendarDay: 6, value:"Sat", displayName: "Saturday"},
    {id: 1, calendarDay: 0, value:"Sun", displayName: "Sunday"},
    {id: 2, calendarDay: 1, value:"Mon", displayName: "Monday"}
]

const flexibleDates = [
    {id: 0, value: 'exact dates'},
    {id: 1, value: '+ day '},
    {id: 2, value: '- day'},
    {id: 3, value: '± 1 day'},
    {id: 4, value: '± 2 days'},
    {id: 5, value: '± 3 days'},
]

const label = [
    {id: 0, value: "Date Range"},
    {id: 1, value: "Upcoming Weekends"}
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
    requestType: requestType,
    houseRules: houseRules,
    genders: genders,
    roomType: roomType,
    securityDeposit: securityDeposit,
    creditCards: creditCards,
    months: months,
    years: years,
    label: label,
    flexibleDates: flexibleDates,
    weekendEnd: weekendEnd,
    weekendStart: weekendStart
};

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

data.getRequestType = function(){
    return requestType;
};

data.getRequestUserData = function(){
    return requestUserData;
};

data.getRequestData = function(){
    return requestData;
};

data.getTransactionType = function(){
    return transactionType;
};

data.getTransactionMode = function(){
    return transactionMode;
};


data.getVisibleRequestData = function(){
    return visibleRequestData;
};

data.getWeekendStart = function(){
    return weekendStart;
};

data.getWeekendEnd = function(){
    return weekendEnd;
};

data.getFlexibleDates = function(){
    return flexibleDates;
};

data.getLabel = function(){
    return label;
};


module.exports = data;