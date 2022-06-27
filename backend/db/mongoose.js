const mongoose = require('mongoose');

const DB_URL = 'mongodb://localhost:27017/TaskManager';

mongoose.Promise = global.Promise;

mongoose.connect(DB_URL, { useNewUrlParser: true }).then(() => {
    console.log("Connected to MongoDB successfully!");
}).catch((error) => {
    console.log("Error while attempting to connect to mongoDB", e);
});

// mongoose.set('useCreateIndex', true);
// mongoose.set('useFindAndModify', false);

module.exports = {
    mongoose
};