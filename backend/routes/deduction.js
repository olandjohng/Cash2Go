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

  deductionRouter.post('/new', async (req, res) => {
    try {
      const id = await builder('loan_deductiontbl').insert({
        deduction_type: req.body.deductionType
      }, ['loan_deduction_id']);
  
      res.status(200).json({ id: id[0], message: 'Deduction added successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  deductionRouter.put('/edit/:id', async (req, res) => {
    try {
      const id = req.params.id;
  
      const update = await builder('loan_deductiontbl')
        .where('loan_deduction_id', id)
        .update({
          deduction_type: req.body.deductionType
        });
  
      if (update > 0) {
        res.status(200).json({ message: 'Deduction updated successfully' });
      } else {
        res.status(404).json({ error: 'Deduction not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  deductionRouter.delete('/delete/:id', async (req, res) => {
    try {
      const id = req.params.id;
  
      const deletedCount = await builder('loan_deductiontbl')
        .where('loan_deduction_id', id)
        .del();
  
      if (deletedCount > 0) {
        res.status(200).json({ message: 'Deduction deleted successfully' });
      } else {
        res.status(404).json({ error: 'Deduction not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

  module.exports = deductionRouter