let express = require('express');
let router = express.Router();
let jwt = require('jsonwebtoken');
let Requests = require('./../models/Request');
let moment = require('moment');


let now = moment.utc().valueOf();


router.get('/get-data', function (req, res, next) {
    let token = req.query.token;
    jwt.verify(token, "swaps", function (err, decoded) {
        if (err) {
            console.log("error");
        }
        let expierd = decoded.expiresIn - now;
        if (expierd < 0) {
            res.status(200).json({message: "token expired sorry"});
        }
        else {
            //give him the review page
        }
    });
});


router.post('/post-rev', function (req, res, next) {
     token = req.query.token;
    jwt.verify(token, "swaps", function (err, decoded) {
        if (err) {
            console.log("error");
        }
        Requests.findOne({_id: decoded.reqId}, function (err, request) {
            if (decoded.user === "1") {
                //Review belongs to user 1
                //save review to user
                request.update({tokenUser1: 'done'}).then(function () {
                    console.log('user 1 gave review')
                })
            }
            else {
                //Review belongs to user 2
                //save review to user
                request.update({tokenUser2: 'done'}).then(function () {
                    console.log('user 2 gave review')
                })
            }
        });
    });
});

module.exports = router;