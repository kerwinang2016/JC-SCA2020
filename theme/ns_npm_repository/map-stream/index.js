const through = require('through2').obj;

const map = onFile => {
    return through(function(file, type, cb) {
        onFile(file, cb);
    }).on('data', function() {}); // This is needed because the stream pauses and does not fire the "end" event if there is nothing listening for data
};

module.exports = map;
