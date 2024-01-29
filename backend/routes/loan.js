const express = require('express')
const loanRouter = express.Router()
const builder = require('../builder')
const {getLoanList, getLoan, saveLoan} = require('../controller/loanController')

const LoanStatus = {
  RENEWED : 'Renewed',
  RECALCULATED : 'Recalculated',
  ONGOING : 'On Going',
  LOANRENEWAL: 'Loan Renewal'
}

async function createPnNumber(header){
  const qCategoryCode = await builder.select({ code : 'code'}).from('loan_categorytbl').where('loan_category_id', header.loan_category_id)
  const qFacilityCode = await builder.select({ code : 'code'}).from('loan_facilitytbl').where('loan_facility_id', header.loan_facility_id)
  const qCustomerPnNumber = await builder.select({id : 'pn_number'}).from('loan_headertbl').where('customer_id', header.customer_id)

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

  return `${categoryCode}-${id}-${header.customer_id}-${year}`

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
  
  const {header, deduction, details} = req.body

  const pnNumber = await createPnNumber(req.body.header)
  // console.log(req.body)
  const totalInterest = details.reduce((accumulator, current) => accumulator + Number(current.interest), 0)

  const deductionHistory = await builder.select('*').from('loan_deductiontbl')

  console.log(details)
  console.log(deductionHistory)
  await builder.transaction(async t =>{
    
    const id = await builder('loan_headertbl').insert({
      pn_number : pnNumber,
      customer_id : header.customer_id,
      transaction_date : header.transaction_date,
      bank_account_id : header.bank_account_id,
      collateral_id : header.collateral_id,
      loan_category_id : header.loan_category_id,
      loan_facility_id : header.loan_facility_id,
      principal_amount : header.principal_amount,
      interest_rate : header.interest_rate,
      total_interest : totalInterest,
      term_month : details.length, 
      date_granted : header.date_granted,
      status_code : LoanStatus.ONGOING,
      check_issued_name : header.check_issued_name,
      voucher_number : header.voucher_number,
      renewal_id : 0,
      renewal_amount : 0
    }, '*').transacting(t)
    
    const loanDetailsMap = details.map(v => { 
      return{
        loan_header_id : id[0],
        check_date : v.dueDate.split('T')[0],
        check_number : Number(v.checkNumber),
        bank_account_id : Number(v.bank),
        monthly_amortization : Number(v.amortization),
        monthly_interest : Number(v.interest),
        monthly_principal : Number(v.principal),
        accumulated_penalty : 0
      }
    })

    const loanDetails = await builder.insert(loanDetailsMap).into('loan_detail').transacting(t)
      
    const deductionFormat = deduction.map((v) =>{
      for (const d of deductionHistory) {
        if(v.name === d.deduction_type){
          return {
            loan_deduction_id : d.loan_deduction_id,
            loan_header_id : id[0],
            amount : v.amount
          }
        }
      }
    })

    await builder.insert(deductionFormat).into('loan_deduction_historytbl').transacting(t)

    res.status(200).json({
      id : id[0], 
      pnNumber : pnNumber,
      totalInterest : totalInterest,
      status_code : LoanStatus.ONGOING
    })
  })
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