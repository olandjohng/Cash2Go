const builder = require('../builder')

async function getLoanList (req, res) {
  // {
  //   id : 'h.loan_header_id',
  //   id_number: 'h.pn_number',
  //   f_name: 'c.cfname',
  //   l_name: 'c.clname',
  //   principal : 'h.principal_amount',
  //   date : 'h.date_granted',
  //   code : 'h.status_code',  
  // }
  const loans = await builder.select(
    'loan_header_id',
    'pn_number',
    'customername',
    'bank_name_pdc',
    'loancategory',
    'loanfacility',
    'principal_amount',
    'total_interest',
    'date_granted',
    'status_code',
  )
  .from('view_loanheader')
  
  res.status(200).json(loans)
}


async function getLoan(req, res) {

  const {id} = req.params
  // UNSETTLED
  const loans = await builder.select(
    'loan_detail_id',
    'check_date',
    'monthly_principal',
    'monthly_interest',
    'monthly_amortization',
    'description'
  ).from('view_detail_payment ').where('loan_header_id', '=', id)
  
  const updatedLoan = loan.map((item) => ({
    ...item,
    description: item.description || 'UNSETTLED',
  }));

  res.status(200).send(updatedLoan)
}

async function saveLoan(req, res){
}

module.exports = { getLoan, getLoanList, saveLoan }