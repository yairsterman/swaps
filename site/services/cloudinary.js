let cloudinary = require('cloudinary');
let Util = require('../utils/util');
let Q = require('q');

const TRANSFORMATION = "w_1400,h_920,c_limit";
const PROFILE_TRANSFORMATION = 'w_200,h_200,c_limit';
const CITIES_FOLDER = 'placeholder-home/';


function config (name, key, secret){
    cloudinary.config({
        cloud_name: name,
        api_key: key,
        api_secret: secret
    });
}

function isSystemPhoto(path){
    return path.indexOf(CITIES_FOLDER) !== -1;
}

async function getRandomCityPhoto(city){
    try{
        let folder = getCityFolder(city);
        let resources = await getResources(folder);
        resources = resources.resources.map(resource => {
            return resource.secure_url;
        });
        return addTransformation(resources[Util.randomNumber(resources.length - 1)]);
    }
    catch (e) {
        return null;
    }
}

async function getResources(folder){

    return cloudinary.v2.api.resources({ type: 'upload', prefix: folder });
}

function addTransformation(path){
    return path.replace('/upload', `/upload/${TRANSFORMATION}`)
}

function getCityFolder(city){
    let folder = CITIES_FOLDER;
    switch (city) {
        case 'New York':
            return folder + 'New-York';
        case 'Tel Aviv':
        case 'Tel Aviv-Yafo':
            return folder + 'Tel-Aviv';
        case 'London':
            return folder + 'London';
        case 'Amsterdam':
            return folder + 'Amsterdam';
        case 'Paris':
            return folder + 'Paris';
        case 'Barcelona':
            return folder + 'Barcelona';
        case 'Berlin':
            return folder + 'Berlin';
        default:
            return folder + 'Default';
    }
}


module.exports = {
    config: config,
    isSystemPhoto: isSystemPhoto,
    getRandomCityPhoto: getRandomCityPhoto
};