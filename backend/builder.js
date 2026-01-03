const knex = require("knex");

DB_HOST = "srv1365.hstgr.io";
DB_PORT = 3306;
DB_USER = "u215434580_c2go_old";
DB_PASSWORD = "@C2go_old";
DB_NAME = "u215434580_c2go_old";
NODE_ENV = "production";

module.exports = knex({
  client: "mysql2",
  connection: {
    host: DB_HOST,
    port: DB_PORT, // ← Changed from 4000 to 3306
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    ssl: NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
  },
  pool: { min: 0, max: 10 },
});
