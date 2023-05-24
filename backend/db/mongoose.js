const mongoose = require('mongoose');

//const DB_URL = 'mongodb://root:example@0.0.0.0:27017/TaskManager';
//const DB_URL = 'mongodb://root:example@localhost:27017/TaskManager';
//const DB_URL = 'mongodb://root:example@mongo/TaskManager';
//const DB_URL = 'mongodb://mongo/TaskManager';
//const DB_URL = 'mongodb://localhost:27017/TaskManager';
//const DB_URL = 'mongodb://127.0.0.1:27017/TaskManager';
const DB_URL = 'mongodb://127.0.0.1:27777/TaskManager';

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
