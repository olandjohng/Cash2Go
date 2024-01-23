const express = require('express')
const deductionRouter = express.Router()
const builder = require('../builder')

deductionRouter.get('/', async (req, res) =>{
    const deduction = await builder.select({id : 'loan_deduction_id', deductionType : 'deduction_type'}).from('loan_deductiontbl')
    res.status(200).json(deduction)
  })

  deductionRouter.get('/read/:id', async (req, res) =>{
    const id = req.params.id;
    const deduction = await builder.select({id : 'loan_deduction_id', deductionType : 'deduction_type'}).from('loan_deductiontbl')
    .where('loan_deduction_id', id)
    res.status(200).json(deduction)
  })

  deductionRouter.post('/new', async (req, res)=>{
    const id = await builder('loan_deductiontbl').insert({
      deduction_type : req.body.deductionType
    }, ['loan_deduction_id'])
    console.log(id)
    res.status(200).json({id : id[0]})
  })
  
  deductionRouter.put('/edit/:id', async (req, res)=>{
    // const {deduction} = req.body
    const id = req.params.id;
    //TODO handle error
    const update = await builder('loan_deductiontbl')
    .where('loan_deduction_id', id)
    .update({
      // Borrower Info
      deduction_type : req.body.deductionType
    })
    
    res.status(200).send()
    
  })

  module.exports = deductionRouter