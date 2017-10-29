

const visibleUserData = {
    accessible: {
        firstName:true,
        age:true,
        gender:true,
        image:true,
        country:true,
        city:true,
        radius:true,
        swaps:true,
        traveling:true,
        travelingDest:true,
        travelingInfo:true,
        aboutMe:true,
        occupation:true,
        photos:true,
        reviews:true,
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
        swaps:true,
        traveling:true,
        travelingDest:true,
        travelingInfo:true,
        aboutMe:true,
        occupation:true,
        photos:true,
        reviews:true,
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
        apptInfo:true,
        rating:true,
        radius:true,
        messages: true,
        requests: true
    }
};

const amenities = [
    {id: 0, name: 'kitchen', displayName:'Kitchen'},
    {id: 1, name: 'wifi', displayName:'WiFi'},
    {id: 2, name: 'washer', displayName:'Washer'},
    {id: 3, name: 'dryer', displayName:'Dryer'},
    {id: 4, name: 'elevator', displayName:'Elevator'},
    {id: 5, name: 'garden', displayName:'Garden'},
    {id: 6, name: 'privateBathroom', displayName:'Private Bathroom'},
    {id: 7, name: 'parking', displayName:'Parking'},
    {id: 8, name: 'air', displayName:'Air Conditioning'},
    {id: 9, name: 'heat', displayName:'Heating'},
    {id: 10, name: 'kitchen', displayName:'Kitchen'},
    {id: 11, name: 'kitchen', displayName:'Kitchen'},
    {id: 12, name: 'kitchen', displayName:'Kitchen'},

];

const requestStatus ={
    pending: 0,
    confirmed: 1
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