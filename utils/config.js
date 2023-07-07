const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  port: process.env.PORT,
  database_username: process.env.DATABASE_USERNAME,
  database_password: process.env.DATABASE_PASSWORD,
  database_host: process.env.DATABASE_HOST,
  database_port: process.env.DATABASE_PORT,
  database_name: process.env.DATABASE_NAME,
};
