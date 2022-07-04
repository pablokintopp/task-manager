const mongoose = require("mongoose");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const jwtSecret = "rkRnnOgpXls64BGgX47GpmcDlsvo3cJDyociQBoTWmU7ld8KcORr0Hy";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 3,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  sessions: [
    {
      token: {
        type: String,
        required: true,
      },
      expiresAt: {
        type: Number,
        required: true,
      },
    },
  ],
});

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = this.toObject();

  return _.omit(userObject, ["password", "sessions"]);
};

UserSchema.methods.generateAccessAuthToken = function () {
  const user = this;
  return new Promise((resolve, reject) => {
    jwt.sign(
      { _id: user._id.toHexString() },
      jwtSecret,
      { expiresIn: "30m" },
      (error, token) => {
        if (error) {
          console.log("Error on generateAccessAuthToken", error);
          reject(error);
        } else {
          resolve(token);
        }
      }
    );
  });
};

UserSchema.methods.generateRefreshAuthToken = function () {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(64, (error, buffer) => {
      if (error) {
        console.log("Error on generateRefreshAuthToken", error);
        reject(error);
      } else {
        let refreshToken = buffer.toString("hex");
        resolve(refreshToken);
      }
    });
  });
};

UserSchema.methods.createSession = function () {
  let user = this;
  return user
    .generateRefreshAuthToken()
    .then((refreshToken) => {
      return saveSessionToDatabase(user, refreshToken);
    })
    .then((refreshToken) => {
      return refreshToken;
    })
    .catch((error) => {
      console.log("Error on createSession", error);
      return Promise.reject(error);
    });
};

UserSchema.statics.findByIdAndToken = function (_id, token) {
  const User = this;
  return User.findOne({
    _id,
    "sessions.token": token,
  });
};

UserSchema.statics.findByCredentials = function (email, password) {
  let User = this;
  return User.findOne({ email }).then((user) => {
    if (user == undefined) {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (error, result) => {
        if (result) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
};

UserSchema.statics.hasRefreshTokenExpired = function (expiresAt) {
  let secondsSinceEpoch = Date.now() / 1000;
  return expiresAt <= secondsSinceEpoch;
};

UserSchema.pre("save", function (next) {
  let user = this;
  let saltLenght = 10;

  if (user.isModified("password")) {
    bcrypt.genSalt(saltLenght, (error, salt) => {
      bcrypt.hash(user.password, salt, (error, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

let saveSessionToDatabase = (user, refreshToken) => {
  return new Promise((resolve, reject) => {
    let expiresAt = generateRefreshTokenExpiryTime();

    user.sessions.push({ token: refreshToken, expiresAt: expiresAt });

    user
      .save()
      .then(() => {
        return resolve(refreshToken);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

let generateRefreshTokenExpiryTime = (daysUntilExpire = 10) => {
  let secondsUntilExpire = daysUntilExpire * 24 * 60 * 60;
  return Date.now() / 1000 + secondsUntilExpire;
};

UserSchema.statics.getJWTSecret = () => {
  return jwtSecret;
};

const User = mongoose.model("User", UserSchema);

module.exports = { User };
