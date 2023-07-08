const express = require("express");
const { body } = require("express-validator");

const User = require("../models/user");
const authControllers = require("../controllers/auth");

const router = express.Router();

router.post(
  "/signup",
  [
    body("name").trim().isLength({ min: 3 }).not().isEmpty(),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email.")
      .normalizeEmail()
      .withMessage("some")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("E-mail address already in use!!");
          }
        });
      }),
    body("password").trim().isLength({ min: 5 }),
  ],
  authControllers.signUp
);

module.exports = router;
