/**
 *
 */

// ctor
function reader(text) {
    this.s_ = text;
}

// get the idf
reader.prototype.do = function( ftor ) {
    var words = this.s_.split( /[\s\.,\(\)“„"\-]+/);
    for ( var i = 0; i < words.length; ++i ) {
        var word = words[i];
        if ( 0 == word.length ) {
            continue;
        }
        ftor(word);
    }
};
reader.prototype.text = function() {
    return this.s_;
};
// export the model
module.exports = reader;
