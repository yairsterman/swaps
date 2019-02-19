let express = require('express');
let router = express.Router();
let Q = require('q');
let Data = require('../user_data/data.js');
let config = require('../config');
let Community = require('../models/Community.js');


router.post('/createCommunity', function (req, res, next) {
    let password = req.query.password;
    if(password !== config.ADMIN_PASSWORD){
        let error={message: "No Access"};
        res.json(error);
        return;
    }
    let community = new Community(req.body.community);
    community.save(function (err, _community) {
        if (err) return res.json(err);
        res.json(_community);
    });
});

router.get('/getCommunity/:code', function (req, res, next) {
    Community.findOne({code: req.params.code}, {name: true}, function (err, _community) {
        if (err) return res.json(err);
        res.json(_community);
    });
});

module.exports = router;