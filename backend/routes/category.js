const express = require('express')
const categoryRouter = express.Router()
const builder = require('../builder')

categoryRouter.get('/', async (req, res)=>{
    const banks = await builder.select({id : 'loan_category_id', name : 'description', code : 'code', type: 'type'}).from('loan_categorytbl')
    res.status(200).json(banks)
  })

  categoryRouter.get('/read/:id', async (req, res) =>{
    const id = req.params.id;
    const deduction = await builder.select({id : 'loan_category_id', name : 'description', code: 'code', type: 'type'})
                                   .from('loan_categorytbl')
                                   .where('loan_category_id', id)
    res.status(200).json(deduction)
  })

  categoryRouter.post('/new', async (req, res) => {
    try {
      const id = await builder('loan_categorytbl').insert({
        description: req.body.name,
        code: req.body.code,
        type: req.body.type
      }, ['loan_category_id']);
  
      res.status(200).json({ id: id[0], message: 'Category added successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  categoryRouter.put('/edit/:id', async (req, res) => {
    try {
      const id = req.params.id;
  
      const update = await builder('loan_categorytbl')
        .where('loan_category_id', id)
        .update({
            description: req.body.name,
            code: req.body.code,
            type: req.body.type
        });
  
      if (update > 0) {
        res.status(200).json({ message: 'Category updated successfully' });
      } else {
        res.status(404).json({ error: 'Category not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  categoryRouter.delete('/delete/:id', async (req, res) => {
    try {
      const id = req.params.id;
  
      const deletedCount = await builder('loan_categorytbl')
        .where('loan_category_id', id)
        .del();
  
      if (deletedCount > 0) {
        res.status(200).json({ message: 'category deleted successfully' });
      } else {
        res.status(404).json({ error: 'Deduction not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

  module.exports = categoryRouter