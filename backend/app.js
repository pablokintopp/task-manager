const express = require("express");
const app = express();

const { mongoose } = require("./db/mongoose");

const bodyParser = require("body-parser");

const { List, Task, User } = require("./db/models");
const { response } = require("express");

const APPLICATION_PORT = 3000;
const HEADER_REFRESH_TOKEN_NAME = "x-refresh-token";
const HEADER_ACCESS_TOKEN_NAME = "x-access-token";

app.use(bodyParser.json());

/**CORS */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  res.header("Access-Control-Expose-Headers", [
    HEADER_ACCESS_TOKEN_NAME,
    HEADER_REFRESH_TOKEN_NAME,
  ]);
  next();
});

app.get("/", (request, response) => {
  response.send("Hello World!");
});

app.get("/lists", (request, response) => {
  List.find({}).then((lists) => {
    response.send(lists);
  });
});

app.post("/lists", (request, response) => {
  let newListTitle = request.body.title;

  let newList = new List({
    title: newListTitle,
  });

  newList.save().then((listDocument) => {
    response.send(listDocument);
  });
});

app.patch("/lists/:id", (request, response) => {
  List.findOneAndUpdate(
    { _id: request.params.id },
    { $set: request.body }
  ).then(() => {
    response.sendStatus(200);
  });
});

app.delete("/lists/:id", (request, response) => {
  List.findOneAndRemove({ _id: request.params.id }).then(
    (removedListDocument) => {
      response.send(removedListDocument);
    }
  );
});

app.get("/lists/:listId/tasks", (request, response) => {
  Task.find({ _listId: request.params.listId }).then((tasks) => {
    response.send(tasks);
  });
});

app.post("/lists/:listId/tasks", (request, response) => {
  let newTask = new Task({
    title: request.body.title,
    _listId: request.params.listId,
  });

  newTask.save().then((newTaskDocument) => {
    response.send(newTaskDocument);
  });
});

app.patch("/lists/:listId/tasks/:taskId", (request, response) => {
  Task.findOneAndUpdate(
    {
      _id: request.params.taskId,
      _listId: request.params.listId,
    },
    { $set: request.body }
  ).then(() => {
    response.send({ message: "task updated with success!" });
  });
});

app.delete("/lists/:listId/tasks/:taskId", (request, response) => {
  Task.findOneAndDelete({
    _id: request.params.taskId,
    _listId: request.params.listId,
  }).then((removedListDocument) => {
    response.send(removedListDocument);
  });
});

app.post("/user", (request, response) => {
  let body = request.body;
  let newUser = new User(body);
  signInUser(newUser, request, response);
});

app.post("/user/login", (request, response) => {
  let email = request.body.email;
  let password = request.body.password;

  User.findByCredentials(email, password).then((user) => {
    signInUser(user, request, response);
  });
});

app.listen(APPLICATION_PORT, () => {
  console.log("Server is listening on port " + APPLICATION_PORT);
});

let signInUser = (user, request, response) => {
  user
    .save()
    .then(() => {
      return user.createSession();
    })
    .then((refreshToken) => {
      return user.generateAccessAuthToken().then((accessToken) => {
        return { accessToken, refreshToken };
      });
    })
    .then((authToken) => {
      response
        .header(HEADER_REFRESH_TOKEN_NAME, authToken.refreshToken)
        .header(HEADER_ACCESS_TOKEN_NAME, authToken.accessToken)
        .send(user);
    })
    .catch((error) => {
      console.log(error);
      response.status(400).send(error);
    });
};

/** SESSION VERIFICATION */
let verifySession = (request, response, next) => {
  let refreshToken = request.header(HEADER_REFRESH_TOKEN_NAME);
  let _id = request.header("_id");

  User.findByIdAndToken(_id, refreshToken)
    .then((user) => {
      if (user == undefined) {
        return Promise.reject({ error: "Authentication for the user failed!" });
      }

      request.user_id = user._id;
      request.userObject = user;
      request.refreshToken = refreshToken;

      let isSessionValid = user.sessions.some(
        (session) =>
          session.token === refreshToken &&
          User.hasRefreshTokenExpired(session.expiresAt) === false
      );

      if (isSessionValid) {
        next();
      } else {
        return Promise.reject({ error: "User session is invalid!" });
      }
    })
    .catch((error) => {
      response.status(401).send(error);
    });
};

app.get("/user/me/access-token", verifySession, (request, response) => {
  request.userObject
    .generateAccessAuthToken()
    .then((accessToken) => {
      response
        .header(HEADER_ACCESS_TOKEN_NAME, accessToken)
        .send({ accessToken });
    })
    .catch((error) => {
      response.status(400).send(error);
    });
});
