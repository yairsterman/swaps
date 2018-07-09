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
            console.log(err);
            res.status(404).json({message: err});
        }
        else {
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
                            if (decoded.user === "1") {
                                if (!request.tokenUser1) {
                                    res.status(200).json({verified: false, message: "already gave review"});
                                }
                                else {
                                    res.status(200).json({verified: true, user: request.user2});
                                }
                            }
                            else {
                                if (!request.tokenUser2) {
                                    res.status(200).json({verified: false, message: "already gave review"});
                                }
                                else {
                                    res.status(200).json({verified: true, user: request.user1});
                                }
                            }
                        }
                    });
            }
        }
    });
});


//update all review as well

router.post('/postReview', function (req, res) {
    let token = req.body.token;
    jwt.verify(token, config.jwtSecret, function (err, decoded) {
        if (err) {
            console.log(err);
            res.status(404).json({message: err});
        }
        else {
            let now = moment.utc().valueOf();
            let expired = decoded.expiresIn - now;
            if (expired < 0) {
                res.status(200).json({verified: false});
            }
            else {
                Requests.findOne({_id: decoded.reqId}, function (err, request) {
                    let id = decoded.user === "1" ? request.user2 : request.user1;
                    let me = decoded.user === "1" ? request.user1 : request.user2;
                    let token = decoded.user === "1" ? 'tokenUser1' : 'tokenUser2';
                    let update = {};
                    update [token] = null;
                    User.findOne({_id: id}, function (err, user) {
                        User.findOne({_id: me}, function (err, me) {
                            // User.findOne({_id: "5af8287e98dcd20190854315"}, function (err, me) {
                            if (err) return err;
                            if (!user) {
                                res.status(200).json({verified: false});
                            }
                            else if (!req.user) {
                                res.status(200).json({verified: false, message: "you must log in first"});
                            }
                            else if (req.user.id !== me.id) {
                                res.status(200).json({
                                    verified: false,
                                    message: "you must log in as " + me.firstName + " " + me.lastName
                                });
                            }
                            else {
                                let rev = {
                                    rating: req.body.rating,
                                    name: req.user.firstName,
                                    city: req.user.city,
                                    review: req.body.review,
                                    image: req.user.image,
                                    _id: req.user.id,
                                    date: moment.utc().format("MMMM YYYY")
                                };

                                user.reviews.push(rev);
                                user.save().then(function () {
                                    console.log("saved review");
                                });
                                request.update(update).then(function () {
                                    console.log("updated request");
                                    res.status(200).json({
                                        verified: true})
                                });
                            }
                        });
                    });
                });
            }
        }
    });
});


router.post('/sendMessage', function (req, res) {
    let token = req.body.token;
    jwt.verify(token, config.jwtSecret, function (err, decoded) {
        if (err) {
            console.log(err);
            res.status(404).json({message: err});
        }
        else {
            let now = moment.utc().valueOf();
            let expired = decoded.expiresIn - now;
            if (expired < 0) {
                res.status(200).json({verified: false});
            }
            else {
                Requests.findOne({_id: decoded.reqId}, function (err, request) {
                    let id = decoded.user === "1" ? request.user2 : request.user1;
                    let me = decoded.user === "1" ? request.user1 : request.user2;
                    User.findOne({_id: id}, function (err, user) {
                        User.findOne({_id: me}, function (err, me) {
                        // User.findOne({_id: "5af8287e98dcd20190854315"}, function (err, me) {
                            if (err) return err;
                            if (!user) {
                                res.status(200).json({verified: false});
                            }
                            else if (!req.user) {
                                res.status(200).json({verified: false, message: "you must log in first"});
                            }
                            else if (req.user.id !== me.id) {
                                res.status(200).json({
                                    verified: false,
                                    message: "you must log in as " + me.firstName + " " + me.lastName
                                });
                            }
                            else {
                                res.status(200).json({verified: true, recipient: user.id});
                            }
                        });
                    });
                })
                    ;
                }
            }
        }
    );
});

module.exports = router;