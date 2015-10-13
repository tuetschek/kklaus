/**
 * Created by jm on 2/9/2015.
 */

//
exports.default_idf_model_file = "../assets/model-okfiles-5-3.csv.gz";
exports.idf_unknown = 11;

exports.default_answers_file = "../assets/answers.txt";
exports.answers_splitter = /(\r?\n){2,}/;

exports.default_backoffs_file = "../assets/backoffs.txt";

exports.default_stoplist_file = "../assets/stoplist.txt";

// prefix length - must match with loaded model
exports.prefix_len = 5;
exports.threshold_freq = 3;

exports.min_match = 1;

exports.fade_factor = 0.995;
