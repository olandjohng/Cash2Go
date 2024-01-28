const express = require('express')
const accountCategoryRouter = express.Router()
const builder = require('../builder')

accountCategoryRouter.get('/', async (req, res) =>{
    const accountCategory = await builder.select({id : 'account_category_id', account_name : 'account_name'}).from('account_categorytbl')
    res.status(200).json(accountCategory)
  })

  accountCategoryRouter.get('/read/:id', async (req, res) =>{
    const id = req.params.id;
    const accountCategory = await builder.select({id : 'account_category_id', account_name : 'account_name'}).from('account_categorytbl')
    .where('account_category_id', id)
    res.status(200).json(accountCategory)
  })

  accountCategoryRouter.post('/new', async (req, res) => {
    try {
      const id = await builder('account_categorytbl').insert({
        account_name: req.body.accountCategory.account_name
      }, ['account_category_id']);
  
      res.status(200).json({ id: id[0], message: 'Account Category added successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  accountCategoryRouter.put('/edit/:id', async (req, res) => {
    try {
      const id = req.params.id;
  
      const update = await builder('account_categorytbl')
        .where('account_category_id', id)
        .update({
          account_name: req.body.accountCategory.account_name
        });
  
      if (update > 0) {
        res.status(200).json({ message: 'Account Category updated successfully' });
      } else {
        res.status(404).json({ error: 'Account Category not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  accountCategoryRouter.delete('/delete/:id', async (req, res) => {
    try {
      const id = req.params.id;
  
      const deletedCount = await builder('account_categorytbl')
        .where('account_category_id', id)
        .del();
  
      if (deletedCount > 0) {
        res.status(200).json({ message: 'Account Category deleted successfully' });
      } else {
        res.status(404).json({ error: 'Account Category not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

  module.exports = accountCategoryRouter