/**
 *
 */
var idf = require('./idf');


// ctor
function Model() {
    this.d_ = [];
}

// load from gz
Model.prototype.load = function( words )
{
    var len = words.length;
    for ( var i = 0; i < len; ++i ) {
        var word = idf.normalise( words[i] );
        this.d_[word] = 1 + ( this.d_[word] || 0 );
    }
    for ( i = 0; i < this.d_; ++i ) {
        this.d_[word] = this.d_[word] / len;
    }
};

// get the idf
Model.prototype.get = function( word ) {
    word = idf.normalise( word );
    return this.d_[word] || 0.0;
};

// export the model
module.exports = new Model();
