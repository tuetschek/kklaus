/**
 *
 */
var fs = require('fs');
var settings = require('./models/settings');
var zlib = require('zlib');
var reader = require('./models/reader');
var idf = require('./models/idf');

// has not been really tested
function create( files, output_file ) {
    var word_freq = {};
    // for all input files, increment document frequency of each of their words
    for ( var i = 0; i < files.length; ++i ) {
        var file = files[i];
        console.log("Working on [%s]", file);
        var contents = fs.readFileSync(file, {encoding: "UTF-8"});
        var doc_words = new Set();

        new reader(contents).do(function (word) {
            word = idf.normalise(word);
            if (!doc_words.has(word)) {
                doc_words.add(word);
                if (!word_freq.hasOwnProperty(word)) {
                    word_freq[word] = 0;
                }
                word_freq[word] += 1;
            }
        });
    }

    // store word,tf-idf
    var buf = "";
    for (var word in word_freq) {
        if (word_freq.hasOwnProperty(word)) {
            var freq = word_freq[word];
            if ( freq > settings.threshold_freq ) {
                var tf_idf = Math.log( files.length/ freq );
                buf += word + "," + tf_idf + "\n";
            }
        }
    }
    fs.createWriteStream(output_file).write( zlib.gzipSync(buf) );
}

// ========================
// "main"
// ========================

// handle params
var dir = process.argv[2];
var out = process.argv[3];
if ( undefined == dir || undefined == out ) {
    console.log( "Invalid input parameters: input_dir output_file" );
    process.exit(code=1);
}
console.log( "Reading files from [%s], output to [%s]", dir, out );

// get files from specified dir
var all_files = fs.readdirSync( dir );
var files = [];
for ( var i = 0; i < all_files.length; ++i ) {
    var name = dir + '/' + all_files[i];
    if ( fs.statSync(name).isFile() ){
        files.push(name);
    }
}

// create it
create( files, out );