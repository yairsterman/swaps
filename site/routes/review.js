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


//update all review as well

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
                let id = decoded.user === "1" ? request.user2 : request.user1;
                let token = decoded.user === "1" ? 'tokenUser1' : 'tokenUser2';
                let update = {};
                update [token] = null;
                User.findOne({id: id}, function (err, user) {
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
                                image: req.user.image,
                                _id: req.user.id,
                                date: moment.utc().format("MMMM YYYY")
                            };

                            user.reviews.push(rev);
                            user.save();
                            request.update(update);
                        }
                    }
                });
            });
        }
    });
});

module.exports = router;