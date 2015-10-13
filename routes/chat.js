var chat = require('../models/chatter');

var express = require('express');
var router = express.Router();

// not storing dialogue
router.get('/', function(req, res) {
    res.json({});
});

function ask( person, question) {
    console.log( "Requested [%s] [%s]", person, question.replace(/\s+/gm, " ") );
    try {
        var answer = chat.chatter.ask(person, question);
        if ( null == answer ) {
            console.log( "Trying a politician" );
            answer = chat.chatter.play_politician(person);
            console.log( "Politician said: [%s]", answer );
            return {
                person: person,
                question: question,
                backoff: answer
            }
        }else {
            return {
                person: person,
                question: question,
                answer: answer
            }
        }
    }catch(err) {
        return {
            error: err.message,
            stack: err.stack
        };
    }
}

router.get('/get', function(req, res) {
    var person = req.query.person;
    var question = req.query.question;
    res.json( ask(person, question) );
});

router.post('/get', function(req, res) {
    var person = req.body.person;
    var question = req.body.question;
    res.json( ask(person, question) );
});

module.exports = router;
