const express = require('express')
const customerRouter = express.Router()
const builder = require('../builder')

customerRouter.get('/', async (req, res) =>{
  const customers = await builder.select({
    id : 'customerid',
    f_name : 'cfname',
    m_name : 'cmname',
    l_name : 'clname',
    contactNo : 'contactno',
    address : 'address',
    gender : 'gender',
  }).from({ c : 'customertbl'})

  res.status(200).send(customers)
})

customerRouter.get('/info', async (req, res)=>{
  const customers = await builder.select('*').from('customertbl')
  res.status(200).send(customers)
})

customerRouter.get('/info/:id', async (req, res)=>{
  const {id} = req.params
  const customers = await builder.select('*').from('customertbl').where('customerid', id)
  res.status(200).send(customers[0])
})

module.exports = customerRouter