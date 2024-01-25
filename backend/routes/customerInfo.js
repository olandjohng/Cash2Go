const express = require('express')
const customerInfoRouter = express.Router()
const builder = require('../builder')

customerInfoRouter.get('/', async (req, res) => {
    try {
      const customers = await builder
        .select({
          id: 'customerid',
          fullname: builder.raw("CONCAT_WS(', ', ??, CONCAT(??, ' ', SUBSTRING(??, 1, 1), '.'))", ['clname', 'cfname', 'cmname']),
          contactNo: 'contactno',
          address: 'address',
          gender: 'gender',
        })
        .from({ c: 'customertbl' });
  
      res.status(200).send(customers);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

  customerInfoRouter.get('/read/:id', async (req, res) =>{
    const id = req.params.id;
    const deduction = await builder.select({id : 'customerid', name : 'description', code: 'code', type: 'type'})
                                   .from('customertbl')
                                   .where('customerid', id)
    res.status(200).json(deduction)
  })

  customerInfoRouter.post('/new', async (req, res) => {
    try {
      const id = await builder('customertbl').insert({
        description: req.body.category.name,
        code: req.body.category.code,
        type: req.body.category.type
      }, ['customerid']);
  
      res.status(200).json({ id: id[0], message: 'Category added successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  customerInfoRouter.put('/edit/:id', async (req, res) => {
    try {
      const id = req.params.id;
  
      const update = await builder('customertbl')
        .where('customerid', id)
        .update({
            description: req.body.category.name,
            code: req.body.category.code,
            type: req.body.category.type
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

  customerInfoRouter.delete('/delete/:id', async (req, res) => {
    try {
      const id = req.params.id;
  
      const deletedCount = await builder('customertbl')
        .where('customerid', id)
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


module.exports = customerInfoRouter