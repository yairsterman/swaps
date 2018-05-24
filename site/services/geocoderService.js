let config = require('../config');

let NodeGeocoder = require('node-geocoder');
let geocoder = NodeGeocoder(config.geoCoderOptions);
let Q = require('q');


module.exports.geocode = function(address){
    let dfr = Q.defer();
    if(!address || address == ''){
        dfr.resolve();
    }
    else{
        geocoder.geocode(address).then(function (_geo) {
            let geo = {
                city : _geo[0].city,
                region: _geo[0].administrativeLevels.level1long,
                country: _geo[0].country,
                location: {
                    lat: _geo[0].latitude.toFixed(3),
                    long: _geo[0].longitude.toFixed(3)
                }
            };
            dfr.resolve(geo);
        });
    }

    return dfr.promise;
};