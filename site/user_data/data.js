

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
        rating:true,
        radius:true,
        location:true,
        messages: true,
        requests: true
    }
};

const amenities = [
    {id: 0, name: 'kitchen', displayName:'Kitchen', icon:'icon-kitchen'},
    {id: 1, name: 'wifi', displayName:'Wi-Fi', icon:'icon-dryer'},
    {id: 2, name: 'washer', displayName:'Washer', icon:'icon-washer'},
    {id: 3, name: 'dryer', displayName:'Dryer', icon:'icon-dryer'},
    {id: 4, name: 'shower', displayName:'Shower', icon:'icon-dryer'},
    {id: 5, name: 'elevator', displayName:'Elevator', icon:'icon-elevator'},
    {id: 6, name: 'garden', displayName:'Garden', icon:'icon-tree'},
    {id: 7, name: 'bathroom', displayName:'Private Bathroom', icon:'icon-dryer'},
    {id: 8, name: 'parking', displayName:'Parking', icon:'icon-parking'},
    {id: 9, name: 'air', displayName:'Air Conditioning', icon:'icon-snowflake'},
    {id: 10, name: 'heat', displayName:'Heating', icon:'icon-heat'},
    {id: 11, name: 'laptop', displayName:'Laptop Friendly', icon:'icon-dryer'},
    {id: 12, name: 'tv', displayName:'TV', icon:'icon-tv'},
    {id: 13, name: 'entrance', displayName:'Private Entrance', icon:'icon-keys'},
    {id: 14, name: 'gym', displayName:'Gym', icon:'icon-dryer'},
    {id: 15, name: 'wheelchair', displayName:'Wheelchair Accessible', icon:'icon-dryer'},
    {id: 16, name: 'doorman', displayName:'Doorman', icon:'icon-dryer'},
    {id: 17, name: 'iron', displayName:'Iron', icon:'icon-dryer'},
    {id: 18, name: 'pool', displayName:'Pool', icon:'icon-dryer'},

];

const thingsToDo = [
    {id: 0, name: 'clubbing', displayName:'Clubbing', icon:'icon-kitchen'},
    {id: 1, name: 'bars', displayName:'Cocktail Bars', icon:'icon-dryer'},
    {id: 2, name: 'gym', displayName:'Gym', icon:'icon-washer'},
    {id: 3, name: 'theater', displayName:'Theater', icon:'icon-dryer'},
    {id: 4, name: 'museums', displayName:'Museums', icon:'icon-elevator'},
    {id: 5, name: 'galleries', displayName:'Art galleries', icon:'icon-tree'},
    {id: 6, name: 'sports', displayName:'Extreme sports', icon:'icon-dryer'},
    {id: 7, name: 'vegan', displayName:'Vegan restaurants', icon:'icon-parking'},
    {id: 8, name: 'bicycle', displayName:'Bicycle riding', icon:'icon-snowflake'},
    {id: 9, name: 'concerts', displayName:'Classical music concerts', icon:'icon-heat'},
    {id: 10, name: 'music', displayName:'Live music', icon:'icon-dryer'},
    {id: 11, name: 'walking', displayName:'Walking tours', icon:'icon-tv'},
    {id: 12, name: 'bus', displayName:'Bus tours', icon:'icon-tv'},
    {id: 13, name: 'cafes', displayName:'Local Cafes', icon:'icon-keys'},
    {id: 14, name: 'food', displayName:'Local food', icon:'icon-dryer'},
    {id: 15, name: 'workspaces', displayName:'Workspaces', icon:'icon-dryer'},
    {id: 16, name: 'market', displayName:'Market', icon:'icon-dryer'},
    {id: 17, name: 'zoo', displayName:'Zoo', icon:'icon-dryer'},
    {id: 18, name: 'park', displayName:'Park', icon:'icon-dryer'},
    {id: 19, name: 'gay', displayName:'Gay friendly', icon:'icon-dryer'},
    {id: 20, name: 'beach', displayName:'Beach', icon:'icon-dryer'},
    {id: 21, name: 'dance', displayName:'Dance performances', icon:'icon-dryer'},
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

data.getData = function(){
    return dataForSite;
};

module.exports = data;