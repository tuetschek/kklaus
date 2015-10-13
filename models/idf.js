/**
 *
 */
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');

var settings = require('./settings');


// ctor
function Model() {
    this.d_ = {};
    this.prefix_len_ = settings.prefix_len;
}

// load from gz
Model.prototype.load = function( file_str ) {
    file_str = path.join(__dirname, file_str);
    var buf = zlib.gunzipSync(fs.readFileSync(file_str));
    var lines = new Buffer(buf).toString().split(/[\r\n]+/g);
    for ( var i = 0; i < lines.length; ++i ) {
        var parts = lines[i].split(",");
        this.d_[parts[0]] = parseFloat( parts[1] );
    }
    console.info( "File idf [%s] loaded, size [%s]", file_str, Object.keys(this.d_).length );
};

Model.prototype.loaded = function() {
    return 0 != Object.keys(this.d_).length;
};

// get first N chars
Model.prototype.normalise = function( word ) {
    if ( word.length > this.prefix_len_ ) {
        word = word.substring(0, this.prefix_len_);
    }
    return word.toLowerCase();
};

// get the idf
Model.prototype.get = function( word ) {
    //console.log( "idf size [%s]", this.d_.length );
    var word = this.normalise( word );
    //console.log( "[%s]", this.d_["vstup"] );
    return this.d_[word] || settings.idf_unknown;
};

// TODO create_model

// export the model
module.exports = new Model();
