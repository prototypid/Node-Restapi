const jwt = require("jsonwebtoken");

const config = require("../utils/config");

module.exports = (req, res, next) => {
  const header = req.get("Authorization");
  if (!header) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  const token = header.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, config.jwt_secret);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }

  // token doesn't match
  if (!decodedToken) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }

  // valid token
  req.userId = decodedToken.userId;
  next();
};
