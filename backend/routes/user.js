const express = require('express')
const userRouter = express.Router()
const builder = require('../builder')

userRouter.get('/', async (req, res)=>{
    const users = await builder.select({id : 'user_id', fname : 'fname', mname : 'mname', lname: 'lname', username: 'username', password: 'password', position: 'position'}).from('bank_accounttbl')
    res.status(200).json(users)
  })