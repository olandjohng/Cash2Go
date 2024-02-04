const express = require('express')
const collateralRouter = express.Router()
const builder = require('../builder')

collateralRouter.get('/', async (req, res) =>{
    const collateral = await builder.select({id : 'collateral_id', description : 'description'}).from('collateraltbl')
    res.status(200).json(collateral)
  })

  collateralRouter.get('/read/:id', async (req, res) =>{
    const id = req.params.id;
    const collateral = await builder.select({id : 'collateral_id', description : 'description'}).from('collateraltbl')
    .where('collateral_id', id)
    res.status(200).json(collateral)
  })

  collateralRouter.post('/new', async (req, res) => {
    try {
      const id = await builder('collateraltbl').insert({
        description: req.body.description
      }, ['collateral_id']);
  
      res.status(200).json({ id: id[0], message: 'Collateral added successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  collateralRouter.put('/edit/:id', async (req, res) => {
    try {
      const id = req.params.id;
  
      const update = await builder('collateraltbl')
        .where('collateral_id', id)
        .update({
          description: req.body.description
        });
  
      if (update > 0) {
        res.status(200).json({ message: 'Collateral updated successfully' });
      } else {
        res.status(404).json({ error: 'Collateral not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  collateralRouter.delete('/delete/:id', async (req, res) => {
    try {
      const id = req.params.id;
  
      const deletedCount = await builder('collateraltbl')
        .where('collateral_id', id)
        .del();
  
      if (deletedCount > 0) {
        res.status(200).json({ message: 'Collateral deleted successfully' });
      } else {
        res.status(404).json({ error: 'Collateral not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

  module.exports = collateralRouter