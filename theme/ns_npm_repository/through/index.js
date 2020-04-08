const through2 = require('through2').obj;

const emit = function(cb) {
    return (_, data) => {
        if (_ === 'end') {
            cb();
        } else if (_ === 'error') {
            cb(data);
        } else if (_ === 'data') {
            this.push(data);
        }
    };
};

const through = (onFile, onEnd) => {
    return through2(
        function(file, type, cb) {
            onFile.apply({ emit: emit.apply(this, [cb]) }, [file]);
            cb();
        },
        function(cb) {
            if (!onEnd) {
                return cb();
            }
            return onEnd.apply({ emit: emit.apply(this, [cb]) });
        }
    ).on('data', function() {}); // This is needed because the stream pauses and does not fire the "end" event if there is nothing listening for data
};

module.exports = through;
