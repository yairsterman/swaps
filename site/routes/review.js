let express = require('express');
let router = express.Router();
let jwt = require('jsonwebtoken');
let Requests = require('./../models/Request');
let User = require('./../models/User');
let moment = require('moment');
let config = require('./../config');


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
                    select: "firstName",
                })
                .exec(function (err, request) {
                    if (err) {
                        error.message = err;
                        res.json(error);
                    }
                    else {
                        let user = decoded.user === "1" ? request.user2 : request.user1;
                        res.status(200).json({verified: true, user: user});
                    }
                });
        }
    });
});


router.post('/postReview', function (req, res, next) {
    let token = req.body.token;
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
            Requests.findOne({_id: decoded.reqId}, function (err, request) {
                if (decoded.user === "1") {
                    //Review belongs to user 1
                    User.findOne({id: request.user2}, function (err, user) {
                        if (err) return err;
                        if (user && req.user) {
                            if (req.user.id != user.id) {
                                res.status(200).json({verified: false});
                            }
                            else {
                                let rev = {
                                    rating: req.body.rating,
                                    name: req.user.firstName,
                                    city: req.user.city,
                                    review: req.body.review,
                                };

                                user.reviews.push(rev);
                                user.save();
                                request.update({tokenUser1: null});
                            }
                        }
                    });
                }
                else {
                    //Review belongs to user 2
                    User.findOne({_id: request.user1}, function (err, user) {
                        if (err) return err;
                        if (user && req.user) {
                            if (req.user.id != user.id) {
                                res.status(200).json({verified: false});
                            }
                            else {
                                let rev = {
                                    rating: req.body.rating,
                                    name: req.user.firstName,
                                    city: req.user.city,
                                    review: req.body.review,
                                };

                                user.reviews.push(rev);
                                user.save();
                                request.update({tokenUser2: null})
                            }
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;