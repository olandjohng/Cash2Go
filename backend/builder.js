const knex = require('knex')

const HOST = 'localhost'
const USER = 'root'
const PASSWORD = 'root'
const DATABASE = 'web_loan_db'


const builder = knex({
  client: 'mysql2',
  connection: {
    host : HOST,
    port : 3306,
    user : USER,
    password : PASSWORD,
    database : DATABASE
  }
});

module.exports = builder