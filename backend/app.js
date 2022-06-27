const express = require('express');
const app = express();

const APPLICATION_PORT = 3000;

app.get('/', (request, response) => {
    response.send("Hello World!");
});

app.get('/lists', (request, response) => {
    //ToDo return array of lists
});

app.post('/lists', (request, response) => {
    //ToDo insert new list
});

app.patch('/lists/:id', (request, response) => {
    //ToDo Update list by id
});

app.delete('/lists/:id', (request, response) => {
    //ToDo Delete list by id
});

app.listen(APPLICATION_PORT, () => {
    console.log("Server is listening on port " + APPLICATION_PORT);
})