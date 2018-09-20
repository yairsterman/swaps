let express = require('express');
let router = express.Router();
let jwt = require('jsonwebtoken');
let Requests = require('./../models/Request');
let User = require('./../models/User');
let Review = require('./../models/Review');
let moment = require('moment');
let config = require('./../config');

let error = {
    error : true,
    message: ''
}


router.get('/verifyToken', function (req, res, next) {
    let token = req.query.token;
    jwt.verify(token, config.jwtSecret, function (err, decoded) {
        if (err) {
            console.log("error");
        }
        let now = moment.utc().valueOf();
        let expired = decoded.expiresIn - now;
        if (expired < 0) {
            res.status(200).json({verified: false});
        }
        else {
            Requests.findOne({_id: decoded.reqId})
                .populate({
                    path: 'user' + String(3 - decoded.user),
                    select: "firstName photos image reviews rating apptInfo city country",
                })
                .exec(function (err, request) {
                    if (err) {
                        error.message = err;
                        res.json(error);
                    }
                    else {
                        if(decoded.user === "1"){
                            if(request.tokenUser1 == config.EXPIRED_TOKEN){
                               return res.status(200).json({verified: false});
                            }
                        }
                        if(decoded.user === "2"){
                            if(request.tokenUser2 == config.EXPIRED_TOKEN){
                                return res.status(200).json({verified: false});
                            }
                        }
                        let user = decoded.user === "1" ? request.user2 : request.user1;
                        res.status(200).json({verified: true, user: user});
                    }
                });
        }
    });
});


//update all review as well

router.post('/postReview', function (req, res, next) {
    if(!req.user){
        return res.status(400);
    }
    let token = req.body.token;
    jwt.verify(token, config.jwtSecret, function (err, decoded) {
        if (err) {
            return res.status(200).json({verified: false});
        }
        let now = moment.utc().valueOf();
        let expired = decoded.expiresIn - now;
        if (expired < 0) {
            return res.status(200).json({verified: false});
        }
        else {
            Requests.findOne({_id: decoded.reqId}, function (err, request) {
                let id = decoded.user === "1" ? request.user2 : request.user1;
                let reviewerId = decoded.user === "1" ? request.user1 : request.user2;
                if(reviewerId.toString() != req.user._id.toString()){ // the request user token does not belong to the logged in user
                    error.message = 'You are not permitted to write this review';
                    error.code = 411;
                    return res.json(error);
                }
                if(decoded.user === "1"){
                    if(request.tokenUser1 == config.EXPIRED_TOKEN){
                        error.message = 'You have already given a review for this swap';
                        error.code = 411;
                        return res.json(error);
                    }
                }
                if(decoded.user === "2"){
                    if(request.tokenUser2 == config.EXPIRED_TOKEN){
                        error.message = 'You have already given a review for this swap';
                        error.code = 411;
                        return res.json(error);
                    }
                }

                let token = decoded.user === "1" ? 'tokenUser1' : 'tokenUser2';
                request [token] = config.EXPIRED_TOKEN;
                User.findOne({_id: id}, function (err, user) {
                    if (err) {
                        error.message = err;
                        return res.json(error);
                    }
                    if (user && req.user) {
                        let review = new Review({
                            rating: req.body.rating,
                            review: req.body.review,
                            reviewer: req.user._id,
                            user: user._id,
                        });

                        review.save(function (err, _review){
                            if (err){
                                error.message = err;
                                return res.json(error);
                            }
                            user.reviews.push(_review._id);
                            user.rating = user.rating?((user.rating * user.reviews.length - 1) + _review.rating) / user.reviews.length: _review.rating; // new average
                            user.save();
                            request.save();
                            res.json({});
                        });
                    }
                });
            });
        }
    });
});      

module.exports = router;