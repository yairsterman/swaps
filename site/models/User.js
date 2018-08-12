var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = new Schema({
    firstName: String,
    lastName: String,
    displayName: String,
    email: String,
    verifyEmailToken: String,
    password: String,
    gender: Number,
    birthday: String,
    occupation: String,
    aboutMe: String,
    facebookId: String,
    googleId: String,
    localId: String,
    image: String,
    country: String,
    city: String,
    region: String,
    address: String,
    swaps: Number,
    allowViewHome: Boolean,
    traveling: Boolean,
    travelingDest: Array,
    travelingInformation: [{
        dates: String,
        departure: Number,
        returnDate: Number,
        guests: Number,
        fullDestination: String,
        rangeLabel : String,
        startRange: Number,
        endRange: Number,
        destination: {
            city: String,
            region: String,
            country: String
        }
    }],
    IP: String,
    travelingInfo: Array,
    rating: Number,
    requests: [{ type: Schema.Types.ObjectId, ref: 'Request' }],
    notifications: Array,
    messages: Array,
    reviews: [{
        rating: Number,
        name: String,
        city: String,
        review: String,
        image: String,
        _id: String,
        date: String
    }],
    photos: Array,
    favorites: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    thingsToDo: Array,
    radius: {},
    location: {},
    apptInfo: {
        amenities: Array,
        rules: Array,
        roomType: Number,
        propertyType: Number,
        title: String,
        about: String,
        moreInfo: String,
        beds: Number,
        baths: Number,
        guests: Number,
        rooms: Number,
        bedType: Number,
    },
    verifications:{
      email: Boolean
    },
    community: {type: Schema.Types.ObjectId, ref: 'Community' },
    paymentInfo: {},
    transactions: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],
    referredBy: {
        user: {type: Schema.Types.ObjectId, ref: 'User' },
        complete: { type: Boolean, default: false }
    },
    refers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    deposit: Number,
    featured: Boolean,
    updated_at: { type: Date, default: Date.now },
});
module.exports = mongoose.model('User', UserSchema);
