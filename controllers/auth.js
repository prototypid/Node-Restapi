const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const User = require("../models/user");

exports.signUp = (req, res, next) => {
  const errors = validationResult(req);
  console.log("Validation Errors: ", errors);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  // hash Password
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        name: name,
        email: email,
        password: hashedPassword,
      });
      return user.save();
    })
    .then((result) => {
      res
        .status(201)
        .json({ message: "User created Successfully!", userId: result._id });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let currentUser;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error("Invalid Email or Password.");
        error.statusCode = 401; // not authenticated
        throw error;
      }

      currentUser = user;

      // validata password
      return bcrypt.compare(password, post.password);
    })
    .then((passwordMatched) => {
      if (!passwordMatched) {
        const error = new Error("Invalid Email or Password");
        error.statusCode = 401;
        throw error;
      }

      // generate webToken
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};
