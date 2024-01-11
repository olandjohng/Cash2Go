const knex = require('knex')

const HOST = 'localhost'
const USER = 'root'
const PASSWORD = 'web001'
const DATABASE = 'loandb'


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