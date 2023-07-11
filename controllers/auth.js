const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../utils/config");

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
      return bcrypt.compare(password, user.password);
    })
    .then((passwordMatched) => {
      if (!passwordMatched) {
        const error = new Error("Invalid Email or Password");
        error.statusCode = 401;
        throw error;
      }

      // generate webToken
      const token = jwt.sign(
        {
          email: currentUser.email,
          userId: currentUser._id.toString(),
        },
        config.jwt_secret,
        { expiresIn: "1h" }
      );

      res.status(200).json({
        token: token,
        userId: currentUser._id.toString(),
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.getUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ status: user.status });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  const newStatus = req.body.status;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }
    user.status = newStatus;
    await user.save();
    res.status(200).json({ message: "User updated." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
