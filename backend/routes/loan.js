const express = require('express')
const loanRouter = express.Router()
const builder = require('../builder')
const {getLoanList, getLoan, saveLoan} = require('../controller/loanController')

const ejs = require('ejs')
const path = require('path');

const LoanStatus = {
  RENEWED : 'Renewed',
  RECALCULATED : 'Recalculated',
  ONGOING : 'On Going',
  LOANRENEWAL: 'Loan Renewal'
}

async function createPnNumber(req){
  const qCategoryCode = await builder.select({ code : 'code'}).from('loan_categorytbl').where('loan_category_id', req.loan_category_id)
  const qFacilityCode = await builder.select({ code : 'code'}).from('loan_facilitytbl').where('loan_facility_id', req.loan_facility_id)
  const qCustomerPnNumber = await builder.select({id : 'pn_number'}).from('loan_headertbl').where('customer_id', req.customer_id)

  const categoryCode = qCategoryCode[0].code + qFacilityCode[0].code
  let min = 0

  if(qCustomerPnNumber.length > 0){
    for (const PN of qCustomerPnNumber) {
      const arr = PN.id.split('-')
      if(arr[0] === categoryCode){
        min = min < Number(arr[1]) ? Number(arr[1]) : min
      }
    }
  }
  
  const count = String(min + 1)
  const id = '0000'.slice(count.length) + count
  const year = new Date().getFullYear();

  return `${categoryCode}-${id}-${req.customer_id}-${year}`

}

loanRouter.get('/', getLoanList)

loanRouter.get('/recalculate/:id', async (req, res) =>{
  console.log(req.params)
  // get the header
  const loanTYPE = LoanStatus.RECALCULATED
  const header = await builder.select({
      pn_number : 'pn_number',
      principal : 'principal_amount',
    },
    // '*'
  ).from('loan_headertbl').where('loan_header_id', req.params.id)
  const paymentDetails = await builder.sum( {payment : 'principal_payment'}).from('view_detail_payment').where('loan_header_id', req.params.id )
  
  
  console.log(paymentDetails)
  res.json(header)
})

loanRouter.post('/', async (req, res)=>{
  
  const {voucher, deduction, loan_details} = req.body
  const data =  req.body
  const pnNumber = await createPnNumber(req.body)
  const totalInterest = loan_details.reduce((acc, cur) => acc + Number(cur.interest), 0)

  const deductionHistory = await builder.select('*').from('loan_deductiontbl')
  
  const accountTitle = await builder.select('acc_title','account_title_id').from('view_account_title')

  // const mapVoucher = voucher.map((v) => {
  //   return {
  //     account_title_id : Number(v.id),
  //     debit_amount : Number(v.debit),
  //     credit_amount : Number(v.credit),
  //     loan_header_id : 1
  //   }
  
  // })
  // console.log(mapVoucher)


  await builder.transaction(async t =>{
    
    const id = await builder('loan_headertbl').insert({
      pn_number : pnNumber,
      customer_id : req.body.customer_id,
      transaction_date : req.body.transaction_date,
      bank_account_id : req.body.bank_account_id,
      collateral_id : req.body.collateral_id,
      loan_category_id : req.body.loan_category_id,
      loan_facility_id : req.body.loan_facility_id,
      principal_amount : Number(req.body.principal_amount),
      interest_rate : Number(req.body.interest_rate),
      date_granted : req.body.date_granted,
      check_issued_name : req.body.check_issued_name,
      voucher_number : req.body.voucher_number,
      total_interest : totalInterest,
      term_month : loan_details.length, 
      status_code : LoanStatus.ONGOING,
      renewal_id : 0,
      renewal_amount : 0
    }, '*').transacting(t)

    
    const loanDetailsMap = loan_details.map(v => { 
      return{
        loan_header_id : id[0],
        check_date : v.dueDate.split('T')[0],
        check_number : Number(v.checkNumber),
        bank_account_id : Number(v.bank_account_id),
        monthly_amortization : Number(v.amortization),
        monthly_interest : Number(v.interest),
        monthly_principal : Number(v.principal),
        accumulated_penalty : 0
      }
    })

    const loanDetails = await builder.insert(loanDetailsMap).into('loan_detail').transacting(t)
      
    const deductionFormat = deduction.map((v) =>{
      for (const d of deductionHistory) {
        if(v.label === d.deduction_type){
          return {
            loan_deduction_id : d.loan_deduction_id,
            loan_header_id : id[0],
            amount : Number(v.amount)
          }
        }
      }
    })
    
    await builder.insert(deductionFormat).into('loan_deduction_historytbl').transacting(t)
    
    const mapVoucher = voucher.map((v) => {
      return {
        account_title_id : Number(v.id),
        debit_amount : Number(v.debit),
        credit_amount : Number(v.credit),
        loan_header_id : id[0]
      }
    })

    const voucherId = await builder.insert(mapVoucher).into('vouchertbl').transacting(t)
    
    res.status(200).json({
      id : id[0], 
      pnNumber : pnNumber,
      totalInterest : totalInterest,
      status_code : LoanStatus.ONGOING
    })

      
})
  
    // account_title_id
    // debit_amount
    // credit_amount
    // loan_header_id

  //   res.status(200).json({
  //     id : id[0], 
  //     pnNumber : pnNumber,
  //     totalInterest : totalInterest,
  //     status_code : LoanStatus.ONGOING
  //   })


  // calculate interest
  
  // res.status(200).send()


})

loanRouter.get('/category', async (req, res)=>{
  const banks = await builder.select({id : 'loan_category_id', name : 'description', code : 'code'}).from('loan_categorytbl')
  res.status(200).json(banks)
  
})

loanRouter.get('/facility', async (req, res)=>{
  const banks = await builder.select({id : 'loan_facility_id', name : 'description', code : 'code'}).from('loan_facilitytbl')
  res.status(200).json(banks)
})

loanRouter.get('/collateral', async (req, res)=>{
  const col = await builder.select({id : 'collateral_id', name : 'description'}).from('collateraltbl')
  res.status(200).json(col)
})

loanRouter.get('/penalty', async (req, res) =>{
  const penalty = await builder.select({id : 'penalty_id', penaltyType : 'penalty_type'}).from('penaltytbl')
  res.status(200).json(penalty)
})


loanRouter.get('/:id', getLoan)

module.exports = loanRouter