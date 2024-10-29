const express = require('express')
const expensesRouter = express.Router()
const builder = require('../builder')
const dayjs = require('dayjs')

expensesRouter.get('/', async (req, res) => {
  try {
    const expenseHeader = await builder('expenses_header').select('*')
    
    const format = expenseHeader.map(v => ({
      ...v,
      date: dayjs(v.date).format("MM-DD-YYYY"),
      check_details : `${v.bank}-${v.check_number}`
    }))
    
    res.status(200).json(format)
    
  } catch (error) {
    res.status(500).end()
  }
})

expensesRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const expenses_details = await builder('expenses_details').select({ title : 'account_title'}, 'credit', 'debit').innerJoin('account_titletbl', 'expenses_details.account_title_id', 'account_titletbl.account_title_id').where('expenses_header_id', Number(id))
    
    const format_details = expenses_details.map(v => ({
      ...v, 
      debit : Number(v.debit),
      credit : Number(v.credit)
    }))

    const [expenses_header] = await builder('expenses_header').select(
      {
        borrower : 'payee',
        voucherNumber : 'voucher_number'
      },
      'date',
      'check_number',
      'check_date',
      'bank',
      'voucher_number',
      'prepared_by',
      'checked_by',
      'approved_by'
    ).where('id', Number(id))
  
    res.status(200).json({...expenses_header, details : format_details})
    
  } catch (error) {
    res.status(500).end()
  }
})

expensesRouter.post('/', async (req, res) => {
  const { header, details } = req.body
  try {
    // return
    const expense = await builder('expenses_header').insert(header)
    if(expense) {
      const format = details.map(v => ({...v, expenses_header_id : expense[0]}))
      // console.log(format)
      await builder('expenses_details').insert(format)
      res.status(200).end()
    }
  } catch (error) {

    res.status(500).end()
  }
})


module.exports = expensesRouter