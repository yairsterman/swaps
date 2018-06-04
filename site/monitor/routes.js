var express = require('express');
var router = express.Router();
let jwt = require('jsonwebtoken');


router.get('/get-data', function (req, res, next) {
    let token = req.body.token;
    jwt.verify(token, "swaps", function (err, decoded) {
        if (err) {
            console.log("error");
        }
        let requestID = (decoded.data.substring(0, (decoded.data.length - 1)));
        let user = (decoded.data.substring((decoded.data.length - 1), (decoded.data.length)));
        if(decoded.expiresIn)
        Requests.findOne({_id: requestID}, function (err, request) {
            if (user === "1") {
                //Review belongs to user 1
                request.update({tokenUser1: 'done'}).then(function () {
                    console.log('user 1 gave review')
                })
            }
            else {
                //Review belongs to user 2
                request.update({tokenUser2: 'done'}).then(function () {
                    console.log('user 2 gave review')
                })
            }
        });
    });
});


module.exports = router;