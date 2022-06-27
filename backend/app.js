const express = require('express');
const app = express();

const { mongoose } = require('./db/mongoose');

const bodyParser = require('body-parser');

const { List, Task } = require('./db/models');

const APPLICATION_PORT = 3000;

app.use(bodyParser.json());

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

app.listen(APPLICATION_PORT, () => {
    console.log("Server is listening on port " + APPLICATION_PORT);
});