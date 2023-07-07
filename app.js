const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const config = require("./utils/config");

const feedRoutes = require("./routes/feed");

const MONGODB_URI = `mongodb://${config.database_username}:${config.database_password}@${config.database_host}:${config.database_port}/${config.database_name}?authSource=admin&w=1`;

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Controll-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(8080);
  })
  .catch((err) => console.log(err));
