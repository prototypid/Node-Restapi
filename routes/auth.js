const express = require("express");
const { body } = require("express-validator");

const User = require("../models/user");
const authController = require("../controllers/auth");

const router = express.Router();

// POST /auth/signup
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
  authController.signUp
);

// POST /auth/login
router.post("/login", authController.login);

router.get("/status", isAuth, authController.getUserStatus);

router.patch(
  "/status",
  isAuth,
  [body("status").trim().not().isEmpty()],
  authController.updateUserStatus
);

module.exports = router;
