const mongoose = require('mongoose');

const DB_URL = 'mongodb://root:example@mongo/TaskManager';

mongoose.Promise = global.Promise;

mongoose.connect(DB_URL, { useNewUrlParser: true }).then(() => {
    console.log("Connected to MongoDB successfully!");
}).catch((error) => {
    console.log("Error while attempting to connect to mongoDB", error);
});

// mongoose.set('useCreateIndex', true);
// mongoose.set('useFindAndModify', false);

module.exports = {
    mongoose
};
