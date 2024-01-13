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
  const qCategoryCode = await builder.select({ code : 'code'}).from('loan_categorytbl').where('loan_category_id', header.loanCat)
  const qFacilityCode = await builder.select({ code : 'code'}).from('loan_facilitytbl').where('loan_facility_id', header.facility)
  const qCustomerPnNumber = await builder.select({id : 'pn_number'}).from('loan_headertbl').where('customer_id', header.customer)

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

  return `${categoryCode}-${id}-${header.customer}-${year}`

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
  
  const {header, loan, deduction, loanDeatails} = req.body

  const pnNumber = await createPnNumber(header)
  console.log(loanDeatails)
  // console.log(header.bank_id)
  // await builder.transaction(async t =>{
  //   const id = await builder('loan_headertbl').insert({
  //     pn_number : pnNumber,
  //     customer_id : header.customer,
  //     transaction_date : header.dateGranted,
  //     bank_account_id : header.bank_id,
  //     bank_account_pdc_id : header.borrower,
  //     collateral_id : header.collateral,
  //     loan_category_id : header.loanCat,
  //     loan_facility_id : header.facility,
  //     principal_amount : loan.principalAmount,
  //     interest_rate : loan.interestRate,
  //     total_interest : loan.totalInterest,
  //     term_month : loan.monthTerm, 
  //     term_day : 0,
  //     date_granted : header.dateGranted,
  //     status_code : LoanStatus.ONGOING,
  //     service_charge : deduction.serviceCharge,
  //     documentary_stamp : deduction.documentStamp,
  //     appraisal_fee : deduction.appraisalFee,
  //     notarial_fee : deduction.notarialFee,
  //     check_issued_name : header.checkName,
  //     voucher_number : header.voucherNum,
  //     renewal_id : 0,
  //     renewal_amount : 0
  //   }, '*').transacting(t)

  // })
  res.status(200).json(pnNumber)
    
  // console.log(pnNumber)
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
loanRouter.get('/deduction', async (req, res) =>{
  const deduction = await builder.select({id : 'loan_deduction_id', deductionType : 'deduction_type'}).from('loan_deductiontbl')
  res.status(200).json(deduction)
})

loanRouter.post('/deduction', async (req, res)=>{
  const {deduction} = req.body
  const id = await builder('loan_deductiontbl').insert({
    deduction_type : deduction.deductionType
  }, ['loan_deduction_id'])
  console.log(id)
  res.status(200).json({id : id[0]})

})

loanRouter.get('/:id', getLoan)

module.exports = loanRouter