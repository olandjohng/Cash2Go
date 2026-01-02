const knex = require("knex");

module.exports = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306, // ← Changed from 4000 to 3306
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "loan_db",
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: true }
        : false,
  },
  pool: { min: 0, max: 10 },
});
