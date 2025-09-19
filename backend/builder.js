const knex = require("knex");
require("dotenv").config();

const HOST = "localhost";
const USER = "root";
const PASSWORD = "!Tested123";
const DATABASE = "loan_db";

const builder = knex({
  client: "mysql2",
  connection: {
    host: HOST,
    user: USER,
    password: PASSWORD,
    database: DATABASE,
    port: 3306,
    // host: process.env.DB_HOST,
    // user: process.env.DB_USERNAME,
    // password: process.env.DB_PASSWORD,
    // database: process.env.DB_DATABASE,
  },
});

module.exports = builder;
