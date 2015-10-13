/**
 *
 */
var fs = require('fs');
var path = require('path');

var idf = require('./idf');

// ctor
function stoplist() {
    this.arr = [];
}

//
stoplist.prototype.init = function( file_str ) {
    file_str = path.join(__dirname, file_str);

    var tthis = this;

    // now now, this is not node.js friendly but it is done only once
    fs.readFile(file_str, 'utf8', function(err, data) {
        if (err) {
            throw err;
        }
        var stops = data.split(" ");
        for ( var i = 0; i < stops.length; ++i ) {
            var w = stops[i];
            tthis.arr.push(idf.normalise(w));
        }
        console.log( "File stoplist [%s] loaded, size[%s]", file_str, tthis.arr.length );
    });

};

// get answer
stoplist.prototype.contains = function( w ) {
    return 0 <= this.arr.indexOf( w );
};

// export the model
module.exports = stoplist;
