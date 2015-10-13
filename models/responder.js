/**
 *
 */
var fs = require('fs');
var path = require('path');

var idf = require('./idf');
var settings = require('./settings');
var reader = require('./reader');
var stoplist = require('./stoplist');

// answer
function answer( reader ) {
    this.penalty_ = 0;
    this.words_ = [];
    this.s_ = reader.text();

    var tthis = this;
    reader.do( function(word) {
        var norm_word = idf.normalise(word);
        var idf_val = idf.get(norm_word);
        var word_arr = [norm_word, idf_val];
        tthis.words_.push( word_arr );
    });

    this.size = function() {
        return this.words_.length;
    };
    this.penalise = function() {
        ++this.penalty_;
    };
    this.penalty = function() {
        return this.penalty_;
    };
    this.text = function() {
        return this.s_;
    };
    this.words = function() {
        return this.words_;
    };

} // answer



// ctor
function responder( options ) {
    if (undefined == options) {
        options = {};
    }
    this.answers_ = [];
    this.backoffs_ = [];
    this.backoffs_pos_ = [];
    this.stoplist = new stoplist();

    this.file_model_ = options["file_idf_model"] || settings.default_idf_model_file;
    this.file_answers_ = options["file_answers"] || settings.default_answers_file;
    this.file_backoffs_ = options["file_backoff"] || settings.default_backoffs_file;
    this.file_stoplist_ = options["file_stoplist"] || settings.default_stoplist_file;
}

responder.prototype.init = function() {
    try {
        if ( !idf.loaded() ) {
            idf.load( this.file_model_ );
        }
        this.load_answers( this.file_answers_ );
        this.load_backoffs( this.file_backoffs_ );
        this.stoplist.init( this.file_stoplist_ );
    }catch(err){
        throw err;
    }
};

//
responder.prototype.answer = function( reader ) {
    // load query
    var query_words = [];
    reader.do( function(word) {
        var idf_val = idf.get(word);
        query_words.push( [idf.normalise(word), idf_val] );
    });
    var best = null;
    var best_penalty = Number.MAX_VALUE;
    var best_score = -1;

    //console.log( "Trying [%s] answers", this.answers_.length );
    for ( var i = 0; i < this.answers_.length; ++i ) {
        var a = this.answers_[i];
        var score = this.score(query_words, a);
        if (score > best_score && a.penalty() <= best_penalty) {
            best_score = score;
            best = a;
            best_penalty = a.penalty();
        }
    }
    console.log( "Best score: [%s], text: [%s]", best_score, best.text() );
    if ( best_score > settings.min_match ) {
        best.penalise();
        return best.text();
    }

    //console.log( "No suitable answer found." );
    return null;
};

// load answers
responder.prototype.score = function( query_words, answer ) {

    //
    function in_query( w ) {
        for ( var i = 0; i < query_words.length; ++i ) {
            var qw = query_words[i];
            if ( qw[0] === w ) {
                return qw;
            }
        }
        return null;
    }

    //
    var score = 0;
    var fade = 1;
    var words = answer.words();
    for ( var i = 0; i < words.length; ++i ) {
        var aw = words[i];
        // too frequent
        if ( this.stoplist.contains(aw[0]) ) {
            continue;
        }

        var qw = in_query( aw[0] );
        if ( null != qw ) {
            score = qw[1] * aw[1] * fade;
        }
        fade *= settings.fade_factor;
    }

    var norm_score = score / Math.sqrt(answer.size());

    if ( 1 < score ) {
        //console.log("Norm score [%s], score [%s], norm [%s], answer [%s]", norm_score, score, Math.sqrt(answer.size()), answer.text());
    }
    // Normalize answer size
    return norm_score;

};


responder.prototype.loaded = function() {
    if ( 0 == this.backoffs_.length ) {
        return false;
    }
    if ( 0 == this.answers_.length ) {
        return false;
    }
    // assume stoplist is already loaded :)
    return true;
};

// load answers
responder.prototype.load_answers = function( file_str ) {
    file_str = path.join(__dirname, file_str);
    var tthis = this;

    // now now, this is not node.js friendly but it is done only once
    fs.readFile(file_str, 'utf8', function(err, data) {
        if (err) {
            throw err;
        }
        var answers = data.split(settings.answers_splitter);
        for ( var i = 0; i < answers.length; ++i ) {
            var a = answers[i];
            if ( 0 == a.length ) {
                continue;
            }
            tthis.answers_.push(
                new answer(
                    new reader(a)
                )
            );
        }
        console.info( "File answers [%s] loaded, size [%s]", file_str, tthis.answers_.length );
    });
};

// load answers
responder.prototype.load_backoffs = function( file_str ) {
    file_str = path.join(__dirname, file_str);
    var tthis = this;
    // now now, this is not node.js friendly but it is done only once
    fs.readFile(file_str, 'utf8', function(err, data) {
        if (err) {
            throw err;
        }
        tthis.backoffs_ = data.split(/[\n\r]+/);

        function shuffle(o){
            for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
            return o;
        };

        shuffle( tthis.backoffs_ );
        console.info( "File backoffs [%s] loaded, size [%s]", file_str, tthis.backoffs_.length );
    });

};

// get the idf
responder.prototype.get_backoff = function() {
    return this.backoffs_[this.backoffs_pos_++ % this.backoffs_.length];
};

// export the model
module.exports = responder;
