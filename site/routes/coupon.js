let express = require('express');
let router = express.Router();
let Q = require('q');
let Data = require('../user_data/data.js');
let moment = require('moment');
let config = require('../config');
let User = require('../models/User.js');
let Coupon = require('../models/Coupon.js');

const WEEK = 1000 * 60 * 60 * 24 * 7;

let error = {
    error: true,
    message: ''
};

router.post('/createCoupon', function (req, res, next) {
    let password = req.query.password;
    if(password !== config.ADMIN_PASSWORD){
        let error={message: "No Access"};
        res.json(error);
        return;
    }
    if(!req.body.coupon.expiration){
        req.body.coupon.expiration = moment.utc().valueOf() + 2 * WEEK;
    }
    let coupon = new Coupon(req.body.coupon);
    coupon.save(function (err, _coupon) {
        if (err) return res.json(err);
        res.json(_coupon);
    });
});

router.post('/redeemCoupon', function (req, res, next) {
    let userId = req.user._id;
    let code = req.body.code;
    Coupon.findOne({code: code})
        .exec(function (err, coupon) {
        if (err || !coupon){
            error.message = "No coupon found";
            return res.json(error);
        }
        let now = moment.utc().valueOf();
        if(now > coupon.expiration || coupon.users.indexOf(userId.toString()) != -1){
            error.message = "Coupon Expired";
            return res.json(error);
        }
        User.findOneAndUpdate({_id: userId}, { $inc: { credit: coupon.amount}}, {new: true, projection: Data.getVisibleUserData().restricted})
            .populate({
                path: 'community',
                select: Data.getCommunityData(),
            })
            .populate({
                path: 'reviews',
                populate: {path: 'reviewer', select: 'firstName image city country'},
            })
            .populate({
                path: 'requests',
                match: {status: {$ne: Data.getRequestStatus().canceled}},
                select: Data.getRequestData(),
                populate: [{path: 'user1', select: Data.getRequestUserData(), match: {_id: {$ne: userId}} },{path: 'user2', select: Data.getRequestUserData(), match: {_id: {$ne: userId}} }]
            })
            .exec(function (err, user) {
                if (err) return next(err);
                res.json({user: user, amount: coupon.amount});
                coupon.users.push(user._id);
                coupon.save();
            });
    });
});

module.exports = router;