/**
 *
 */
var responder = require('./responder');
var reader = require('./reader');

var people = {
    "KK": new responder()
};
people["KK"].init();


//
function InvalidArgs(message) {
    this.message = (message || "input parameters invalid");
}
InvalidArgs.prototype = new Error();
//
function NotFinishedLoading(message) {
    this.message = (message || "not finished loading");
}
NotFinishedLoading.prototype = new Error();

exports.chatter = {

    ask: function(person, question) {
        if ( null == person ) {
            throw new InvalidArgs( "no person specified" );
        }
        if ( null == question ) {
            throw new InvalidArgs( "no question specified" );
        }

        if ( !(person in people) ) {
            console.log( "Creating person [%s]", person );
            // todo specific files model/answers/backoff
            people[person] = new responder();
            people[person].init();
        }
        if ( !people[person].loaded() ) {
            throw new NotFinishedLoading();
        }
        var answer = people[person].answer( new reader(question) );
        return answer;
    },

    // just say something very smart
    play_politician: function(person) {
        return people[person].get_backoff();
    }

};
