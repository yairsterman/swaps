

const visibleUserData = {
    accessible: {
        firstName:true,
        age:true,
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
        rating:true
    },
    member: {
        firstName:true,
        lastName:true,
        age:true,
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
        rating:true
    },
    restricted: {
        firstName:true,
        lastName:true,
        age:true,
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
    {id: 3, name: 'shower', displayName:'Shower', icon:'icon-dryer'},
    {id: 4, name: 'elevator', displayName:'Elevator', icon:'icon-elevator'},
    {id: 5, name: 'garden', displayName:'Garden', icon:'icon-tree'},
    {id: 6, name: 'bathroom', displayName:'Private Bathroom', icon:'icon-dryer'},
    {id: 7, name: 'parking', displayName:'Parking', icon:'icon-parking'},
    {id: 8, name: 'air', displayName:'Air Conditioning', icon:'icon-snowflake'},
    {id: 9, name: 'heat', displayName:'Heating', icon:'icon-heat'},
    {id: 10, name: 'laptop', displayName:'Laptop Friendly', icon:'icon-dryer'},
    {id: 11, name: 'tv', displayName:'TV', icon:'icon-tv'},
    {id: 12, name: 'entrance', displayName:'Private Entrance', icon:'icon-keys'},
    {id: 13, name: 'gym', displayName:'Gym', icon:'icon-dryer'},
    {id: 14, name: 'wheelchair', displayName:'Wheelchair Accessible', icon:'icon-dryer'},
    {id: 15, name: 'doorman', displayName:'Doorman', icon:'icon-dryer'},
    {id: 16, name: 'iron', displayName:'Iron', icon:'icon-dryer'},
    {id: 17, name: 'pool', displayName:'Pool', icon:'icon-dryer'},

];

const requestStatus ={
    pending: 0,
    confirmed: 1,
    canceled: 2,
};

const propertyType =[
    {id: 0, type: 'SingleRoom', displayName: 'Single Room'},
    {id: 1, type: 'EntireApartment', displayName: 'Entire Apartment'},
    {id: 2, type: 'SharedRoom', displayName: 'Shared Room'},
];

var data = {

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

data.getPropertyType = function(){
    return propertyType;
};

module.exports = data;