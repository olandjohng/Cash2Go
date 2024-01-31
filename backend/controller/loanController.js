const builder = require('../builder')

async function getLoanList (req, res) {
  
  const search = req.query.search ? req.query.search : ''

  const loans = await builder.select(
    'loan_header_id',
    'pn_number',
    'customername',
    'bank_name',
    'loancategory',
    'loanfacility',
    'principal_amount',
    'total_interest',
    'date_granted',
    'status_code',
  )
  .from('view_loan_header').whereILike('customername', `%${search}%`).orWhereILike('pn_number', `%${search}%`)
  
  res.status(200).json(loans)
}

async function getLoan(req, res) {
  const {id} = req.params
  
  const loans = await builder.select(
    'loan_detail_id',
    'check_date',
    'monthly_principal',
    'monthly_interest',
    'monthly_amortization',
    'description'
  ).from('view_detail_payment ').where('loan_header_id', '=', id)
  
  const updatedLoan = loans.map((item) => ({
    ...item,
    description: item.description || 'UNSETTLED',
  }));

  res.status(200).send(updatedLoan)
}

async function saveLoan(req, res){
}

module.exports = { getLoan, getLoanList, saveLoan }