const express = require('express')
const bankRouter = express.Router()
const builder = require('../builder')

bankRouter.get('/', async (req, res)=>{
  const banks = await builder.select({id : 'bank_account_id', name : 'bank_name', check_location : 'check_location'}).from('bank_accounttbl')
  res.status(200).json(banks)
})


module.exports = bankRouter