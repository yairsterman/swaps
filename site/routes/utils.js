var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
    User.find(function (err, Users) {
        if (err) return next(err);
        res.json(Users);
    });
});


module.exports = router;
