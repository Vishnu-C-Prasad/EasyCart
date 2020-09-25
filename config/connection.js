const mongoClient = require('mongodb').MongoClient;

const state = {
    db: null
}

module.exports.connect = function (done) {
    const url = 'mongodb://localhost:27017';
    const dbName = 'EasyCart';

    mongoClient.connect(url, (err, data) => {
        if (err) {
            return done(err);
        }

        state.db = data.db(dbName);
        done();
    });
}

module.exports.get = function() {
    return state.db;
}