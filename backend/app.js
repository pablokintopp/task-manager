const express = require("express");
const app = express();

const { mongoose } = require("./db/mongoose");

const bodyParser = require("body-parser");

const { List, Task, User } = require("./db/models");

const jwt = require("jsonwebtoken");

const APPLICATION_PORT = 3000;
const HEADER_REFRESH_TOKEN_NAME = "x-refresh-token";
const HEADER_ACCESS_TOKEN_NAME = "x-access-token";
const HEADER_USER_ID_NAME = "_id";

app.use(bodyParser.json());

/**CORS */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE"
  );
  res.header("Access-Control-Allow-Headers", [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    HEADER_ACCESS_TOKEN_NAME,
    HEADER_REFRESH_TOKEN_NAME,
    HEADER_USER_ID_NAME,
  ]);

  res.header("Access-Control-Expose-Headers", [
    HEADER_ACCESS_TOKEN_NAME,
    HEADER_REFRESH_TOKEN_NAME,
  ]);
  next();
});

let verifyUserAuthentication = (request, response, next) => {
  let accessToken = request.header(HEADER_ACCESS_TOKEN_NAME);

  jwt.verify(accessToken, User.getJWTSecret(), (error, decoded) => {
    if (error) {
      response.status(401).send(error);
    } else {
      request.user_id = decoded._id;
      next();
    }
  });
};

app.get("/", (request, response) => {
  response.send("Hello World!");
});

app.get("/lists", verifyUserAuthentication, (request, response) => {
  List.find({
    _userId: request.user_id,
  }).then((lists) => {
    response.send(lists);
  });
});

app.post("/lists", verifyUserAuthentication, (request, response) => {
  let newListTitle = request.body.title;
  let _userId = request.user_id;
  let newList = new List({
    title: newListTitle,
    _userId: _userId,
  });

  newList.save().then((listDocument) => {
    response.send(listDocument);
  });
});

app.patch("/lists/:id", verifyUserAuthentication, (request, response) => {
  List.findOneAndUpdate(
    { _id: request.params.id, _userId: request.user_id },
    { $set: request.body }
  ).then(() => {
    response.status(200).send({ message: "OK" });
  });
});

app.delete("/lists/:id", verifyUserAuthentication, (request, response) => {
  List.findOneAndRemove({
    _id: request.params.id,
    _userId: request.user_id,
  }).then((removedListDocument) => {
    Task.deleteMany({ _listId: removedListDocument._id });
    response.send(removedListDocument);
  });
});

app.get(
  "/lists/:listId/tasks",
  verifyUserAuthentication,
  (request, response) => {
    Task.find({
      _listId: request.params.listId,
      _userId: request.user_id,
    }).then((tasks) => {
      response.send(tasks);
    });
  }
);

app.post(
  "/lists/:listId/tasks",
  verifyUserAuthentication,
  (request, response) => {
    let newTask = new Task({
      title: request.body.title,
      _listId: request.params.listId,
    });

    listBelongsToUser(request.params.listId, request.user_id).then(
      (belongsToUser) => {
        if (belongsToUser) {
          newTask.save().then((newTaskDocument) => {
            response.send(newTaskDocument);
          });
        } else {
          response
            .status(404)
            .send({ message: "List not found for current user" });
        }
      }
    );
  }
);

app.patch(
  "/lists/:listId/tasks/:taskId",
  verifyUserAuthentication,
  (request, response) => {
    listBelongsToUser(request.params.listId, request.user_id).then(
      (belongsToUser) => {
        if (belongsToUser) {
          Task.findOneAndUpdate(
            {
              _id: request.params.taskId,
              _listId: request.params.listId,
            },
            { $set: request.body }
          ).then(() => {
            response.send({ message: "task updated with success!" });
          });
        } else {
          response
            .status(404)
            .send({ message: "List not found for current user" });
        }
      }
    );
  }
);

app.delete(
  "/lists/:listId/tasks/:taskId",
  verifyUserAuthentication,
  (request, response) => {
    listBelongsToUser(request.params.listId, request.user_id).then(
      (belongsToUser) => {
        if (belongsToUser) {
          Task.findOneAndDelete({
            _id: request.params.taskId,
            _listId: request.params.listId,
          }).then((removedListDocument) => {
            response.send(removedListDocument);
          });
        } else {
          response
            .status(404)
            .send({ message: "List not found for current user" });
        }
      }
    );
  }
);

app.post("/user", (request, response) => {
  let body = request.body;
  let newUser = new User(body);
  signInUser(newUser, request, response);
});

app.post("/user/login", (request, response) => {
  let email = request.body.email;
  let password = request.body.password;

  User.findByCredentials(email, password)
    .then((user) => {
      signInUser(user, request, response);
    })
    .catch((error) => {
      User.findOne({ email }).then((user) => {
        if (user == undefined) {
          signInUser(new User({ email, password }), request, response);
        } else {
          response.status(404).send(error);
        }
      });
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

let listBelongsToUser = (listId, userId) => {
  return List.findOne({
    _id: listId,
    _userId: userId,
  }).then((listFound) => listFound != null);
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
