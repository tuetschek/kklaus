var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.json( {
        author: 'based on cyberklaus by Václav Novák',
        version: '1.0'
    } );
});

module.exports = router;
