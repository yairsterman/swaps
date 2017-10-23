

const visableUserData = {
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
        ocupation:true,
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
        ocupation:true,
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
        ocupation:true,
        photos:true,
        reviews:true,
        apptInfo:true,
        rating:true
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
    {id: 8, name: 'kitchen', displayName:'Kitchen'},
    {id: 9, name: 'kitchen', displayName:'Kitchen'},
    {id: 10, name: 'kitchen', displayName:'Kitchen'},
    {id: 11, name: 'kitchen', displayName:'Kitchen'},
    {id: 12, name: 'kitchen', displayName:'Kitchen'},

];

var data = {

}

data.getAmenities = function(){
    return amenities;
}

module.exports = data;