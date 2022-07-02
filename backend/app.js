const express = require('express');
const app = express();

const { mongoose } = require('./db/mongoose');

const bodyParser = require('body-parser');

const { List, Task } = require('./db/models');

const APPLICATION_PORT = 3000;

app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', (request, response) => {
    response.send("Hello World!");
});

app.get('/lists', (request, response) => {
    List.find({}).then((lists) => {
        response.send(lists);
    });
});

app.post('/lists', (request, response) => {
    let newListTitle = request.body.title;

    let newList = new List({
        title: newListTitle
    });

    newList.save().then((listDocument) => {
        response.send(listDocument);
    });
});

app.patch('/lists/:id', (request, response) => {
    List.findOneAndUpdate({ _id: request.params.id },
        { $set: request.body }).then(() => {
            response.sendStatus(200);
        });
});

app.delete('/lists/:id', (request, response) => {
    List.findOneAndRemove({ _id: request.params.id }).then((removedListDocument) => {
        response.send(removedListDocument);
    });
});

app.get('/lists/:listId/tasks', (request, response) => {
    Task.find({ _listId: request.params.listId }).then((tasks) => {
        response.send(tasks);
    });
});

app.post('/lists/:listId/tasks', (request, response) => {
    let newTask = new Task({
        title: request.body.title,
        _listId: request.params.listId
    });

    newTask.save().then((newTaskDocument) => {
        response.send(newTaskDocument);
    });
});

app.patch('/lists/:listId/tasks/:taskId', (request, response) => {
    Task.findOneAndUpdate({
        _id: request.params.taskId,
        _listId: request.params.listId
    },
        { $set: request.body }).then(() => {
            response.send({"message": "task updated with success!"});
        });
});

app.delete('/lists/:listId/tasks/:taskId', (request, response) => {

    Task.findOneAndDelete({
        _id: request.params.taskId,
        _listId: request.params.listId
    }).then((removedListDocument) => {
        response.send(removedListDocument);
    });

});

app.listen(APPLICATION_PORT, () => {
    console.log("Server is listening on port " + APPLICATION_PORT);
});