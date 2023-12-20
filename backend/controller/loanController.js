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

  // const loanHeader = await builder.select({
  //   id : 'h.loan_header_id',
  //   id_number: 'h.pn_number',
  //   f_name: 'c.cfname',
  //   l_name: 'c.clname',
  //   principal : 'h.principal_amount',
  //   date : 'h.date_granted',
  //   code : 'h.status_code',
    
  // })
  // .from({h: 'loan_headertbl'})
  // .join({ c : 'customertbl'}, function() {
  //   this.on('h.loan_header_id', '=', 'c.customerid')
  // }).where('h.loan_header_id', id)

  // const loanDetails = await builder.select(
  // {
  //   month_amort : 'monthly_amortization',
  //   month_inter : 'monthly_interest',
  //   month_prin : 'monthly_principal',  
  //   status : 'status.description',
  //   check_date : 'check_date'
  // }
  // // '*'
  // )
  // .from({ld : 'loan_detail'})
  // .leftJoin({payment : 'paymenttbl'}, function(){
  //   this.on('ld.loan_detail_id', '=', 'payment.loan_detail_id')
  // })
  // .leftJoin({status : 'payment_status'}, function(){
  //   this.on('payment.payment_status_id', '=', 'status.payment_status_id')
  // })
  // .where('ld.loan_header_id', id)
  
  // res.status(200).json({
  //   loanHeader : loanHeader[0],
  //   loanDetails : loanDetails
  // })
  const loan = await builder.select(
    'loan_detail_id',
    'check_date',
    'monthly_principal',
    'monthly_amortization',
    'description'
  ).from('view_detail_payment ').where('loan_header_id', '=', id)
  res.status(200).send(loan)
}

async function saveLoan(req, res){
}

module.exports = { getLoan, getLoanList, saveLoan }