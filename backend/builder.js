const knex = require("knex");
require("dotenv").config();

// const HOST = "srv1365.hstgr.io";
// const USER = "u215434580_c2goAdmin";
// const PASSWORD = "!cash2goAdminP@ssw0rd";
// const DATABASE = "u215434580_c2go";

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
