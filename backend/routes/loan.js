const express = require('express')
const loanRouter = express.Router()
const builder = require('../builder')
const weekOfYear = require('dayjs/plugin/weekOfYear')
const dayjs = require('dayjs')
const {getLoanList, getLoan, saveLoan} = require('../controller/loanController')
const { upload } = require('../middleware/multerMiddleware')
dayjs.extend(weekOfYear)
const multer = require('multer')
const collections = require('./collections')
const { formatName } = require('../utils/utils')


const LoanStatus = {
  RENEWED : 'Renewed',
  RESTRUCTURED : 'Restructured',
  ONGOING : 'On Going',
  LOANRENEWAL: 'Loan Renewal'
}

async function createPnNumber(req){
  try {
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
    
  } catch (error) {
    console.log(err)
    
  }
  return undefined
}

const attachment = upload.single('loan_attachment')


loanRouter.get('/', getLoanList)

const convertEmpty = (name) => name !== '' ? name : ''

loanRouter.get('/voucher/:id', async (req, res) => {
  const {id} = req.params
  
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'Invalid loan ID provided' })
  }

  try {
    // ✅ Query directly from loan_headertbl instead of view
    const loanHeader = await builder
      .select(
        'lh.*',
        'c.clname',
        'c.cfname', 
        'c.cmname'
      )
      .from('loan_headertbl as lh')
      .leftJoin('customertbl as c', 'lh.customer_id', 'c.customerid')
      .where('lh.loan_header_id', id)
      .first()

    if (!loanHeader) {
      return res.status(404).json({ error: `Loan not found for ID: ${id}` })
    }

    // Get voucher details
    const voucherDetails = await builder
      .select(
        'v.*',
        'at.account_title'
      )
      .from('vouchertbl as v')
      .leftJoin('account_titletbl as at', 'v.account_title_id', 'at.account_title_id')
      .where('v.loan_header_id', id)

    // Get bank details
    const bankInfo = await builder
      .select('bank_name')
      .from('bank_accounttbl')
      .where('bank_account_id', loanHeader.bank_account_id)
      .first()

    // Format details for voucher
    const details = voucherDetails.map((v) => ({
      name: v.account_title,
      title: v.account_title,
      credit: v.credit_amount, 
      debit: v.debit_amount
    }))

    // Format customer name
    const lastname = loanHeader.clname?.split(',') || ['']
    const firstName = convertEmpty(loanHeader.cfname)
    const extName = lastname[1] ? lastname[1] : ''
    const midInitial = convertEmpty(loanHeader.cmname)
    const fullname = `${lastname[0]}, ${firstName} ${midInitial} ${extName}`.trim()

    // Handle second check
    let bankName2 = null
    if (loanHeader.has_second_check && loanHeader.bank_account_id_2) {
      const bank2 = await builder
        .select('bank_name')
        .from('bank_accounttbl')
        .where('bank_account_id', loanHeader.bank_account_id_2)
        .first()
      bankName2 = bank2?.bank_name
    }

    const voucherInfo = {
      details: details,
      prepared_by: loanHeader.prepared_by,
      approved_by: loanHeader.approved_by,
      checked_by: loanHeader.checked_by,
      check_details: `${bankInfo?.bank_name || ''}-${loanHeader.check_number || ''}`,
      check_details_2: loanHeader.has_second_check 
        ? `${bankName2 || ''}-${loanHeader.check_number_2 || ''}` 
        : null,
      check_date_2: loanHeader.has_second_check && loanHeader.check_date_2
        ? dayjs(loanHeader.check_date_2).format('MM-DD-YYYY') 
        : null,
      has_second_check: loanHeader.has_second_check || false,
      check_date: loanHeader.check_date,
      borrower: fullname,
      date: dayjs(loanHeader.date_granted).format('MM-DD-YYYY'),
      voucherNumber: loanHeader.voucher_number || 'N/A',
      remarks: loanHeader.remarks || ''
    }

    res.status(200).json(voucherInfo)
    
  } catch (error) {
    console.error('Voucher API Error:', error)
    res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})


loanRouter.get('/renew/:id', async (req, res) => {
  try {
    
    const renewLoan = await builder('view_loan_renew').select('*').where('loan_header_id', req.params.id).first()
  
    const fullname = formatName(renewLoan)
  
    const format = {
      loan_header_id: renewLoan.loan_header_id, 
      customer_id : renewLoan.customer_id,
      PrincipalBalance : Number(renewLoan.PrincipalBalance),
      PenaltyBalance :  Number(renewLoan.PenaltyBalance),
      InterestBalance: Number(renewLoan.InterestBalance),
      Balance : Number(renewLoan.Balance),
      customer_name : fullname
    }
    
    res.status(200).json(format)
  } catch (error) {
    console.log(error)
  }
})

loanRouter.post('/renew', async (req, res) => {
 
  const pnNumber = await createPnNumber(req.body)

  const {loan_details, voucher, deduction, loan_facility } = req.body
  
  const totalInterest = loan_details.reduce((acc, cur) => acc + Number(cur.interest), 0)
  
  try {
    const {is_rediscount} = await builder('loan_facilitytbl').select('is_rediscount').where('description', loan_facility).first()

    await builder.transaction(async (t) => {
      // update old loan 
      await t('loan_headertbl').where({ loan_header_id : req.body.loan_header_id}).update({status_code : LoanStatus.RENEWED}, ['loan_header_id'])
      // insert new loan
      const term = term_type === 'months' ? loan_details.length : dayjs(loan_details[0].dueDate).diff(dayjs(), 'day') + 1
      
      const loanHeaderId = await t('loan_headertbl').insert({
        pn_number : pnNumber,
        check_number :  req.body.check_number,
        term_type : req.body.term_type,
        check_date : req.body.check_date,
        prepared_by : req.body.prepared_by,
        approved_by : req.body.approved_by,
        checked_by : req.body.checked_by,
        customer_id : req.body.customer_id,
        transaction_date : req.body.transaction_date,
        bank_account_id : Number(req.body.bank_account_id),
        collateral_id : req.body.collateral_id,
        loan_category_id : req.body.loan_category_id,
        loan_facility_id : req.body.loan_facility_id,
        principal_amount : Number(req.body.principal_amount),
        interest_rate : Number(req.body.interest_rate),
        date_granted : req.body.date_granted,
        check_issued_name : req.body.check_issued_name,
        voucher_number : req.body.voucher_number,
        total_interest : totalInterest,
        term : term, 
        status_code : LoanStatus.ONGOING,
        renewal_id : req.body.loan_header_id,
        renewal_amount : req.body.Balance
      }, ['loan_header_id'] )

      const loanDetailsMap = loan_details.map(v => {
        if(term_type === 'days') {
          return {
            loan_header_id : id[0],
            due_date : v.dueDate.split('T')[0],
            check_date : v.check_date,
            due_date : v.dueDate,
            check_number : Number(v.checkNumber),
            bank_account_id : Number(v.bank_account_id),
            // monthly_amortization : Number(v.amortization),
            monthly_interest : is_rediscount ? 0 : Number(v.interest),
            monthly_principal : Number(v.principal),
            net_proceeds : Number(v.net_proceeds),
            accumulated_penalty : 0
          }
        }
  
        return{
          loan_header_id : id[0],
          due_date : v.dueDate.split('T')[0],
          // check_date : v.check_date,
          check_number : Number(v.checkNumber),
          bank_account_id : Number(v.bank_account_id),
          monthly_amortization : Number(v.amortization),
          monthly_interest : is_rediscount ? 0 : Number(v.interest),
          monthly_principal : Number(v.principal),
          accumulated_penalty : 0
        }
      })

      await t('loan_detail').insert(loanDetailsMap)

      if(deduction.length > 0) {
        await t('loan_deduction_historytbl').insert(
          deduction.map((v) => ({
            loan_deduction_id : v.id,
            loan_header_id : loanHeaderId[0],
            amount : v.amount
        })))
      }
      
      await t('vouchertbl').insert(
        voucher.map((v) => ({
          account_title_id : +v.id,
          debit_amount : +v.debit,
          credit_amount : +v.credit,
          loan_header_id : loanHeaderId[0]
        })
      ))

      res.status(200).json({
        renewal_id : req.body.loan_header_id,
        loan : {
          loan_header_id : loanHeaderId[0],
          date_granted : req.body.transaction_date,
          name : req.body.customer_name,
          pn_number : pnNumber,
          principal_amount : req.body.principal_amount,
          total_interest : totalInterest,
          bank_name : req.body.bank_name,
          loancategory : req.body.loan_category,
          loanfacility : req.body.loan_facility,
          loan_term : `${loan_details.length} ${req.body.term_type}`,
          status_code : LoanStatus.ONGOING,
        }
      })
    })

  }catch(e) {
    console.log(e)
  }
})

loanRouter.get('/recalculate/:id', async (req, res) => {
  try {
    const [header, col] = await builder.raw(`
    select 
      v_h.loan_header_id,
      v_h.customer_id, v_h.cfname, v_h.cmname, clname,
      h.bank_account_id, v_h.bank_name, 
      h.collateral_id, v_h.collateral, 
      h.loan_facility_id, v_h.loanfacility as loan_facility,
      h.loan_category_id, v_h.loancategory as loan_category, 
      h.check_number, h.check_date, h.check_issued_name,
      p.PrincipalBalance, p.PenaltyBalance, p.InterestBalance, p.Balance
    from view_loan_header as v_h 
    inner join loan_headertbl as h 
      on h.loan_header_id = v_h.loan_header_id
    inner join new_payment as p 
      on v_h.loan_header_id = p.loan_header_id 
    where v_h.loan_header_id = ?`,
    [ Number(req.params.id) ])
    const fullname = formatName(header[0])

    res.send({...header[0], customer_name : fullname})
  } catch (error) {
    console.log(error)
  }
})

loanRouter.post('/recalculate', async (req, res) => {
  // console.log(pnNumber)
  const {loan_details, voucher, deduction,  } = req.body

  const pnNumber =  await createPnNumber(req.body)

  const totalInterest = loan_details.reduce((acc, cur) => acc + Number(cur.interest), 0)

  
  // console.log(req.body.loan_facility_id)
  try {
    
    const isRediscounting = await builder('loan_facilitytbl').select('is_rediscount').first()
    
    await builder.transaction(async (t) => { 
      
      await t('loan_headertbl').where({ loan_header_id : req.body.loan_header_id}).update({status_code : LoanStatus.RESTRUCTURED}, ['loan_header_id'])
  
      const loanHeaderId = await t('loan_headertbl').insert({
        pn_number : pnNumber,
        check_number :  req.body.check_number,
        term_type : req.body.term_type,
        check_date : req.body.check_date,
        prepared_by : req.body.prepared_by,
        approved_by : req.body.approved_by,
        checked_by : req.body.checked_by,
        customer_id : req.body.customer_id,
        transaction_date : req.body.transaction_date,
        bank_account_id : Number(req.body.bank_account_id),
        collateral_id : req.body.collateral_id,
        loan_category_id : req.body.loan_category_id,
        loan_facility_id : req.body.loan_facility_id,
        principal_amount : Number(req.body.principal_amount),
        interest_rate : Number(req.body.interest_rate),
        date_granted : req.body.date_granted,
        check_issued_name : req.body.check_issued_name,
        voucher_number : req.body.voucher_number,
        total_interest : totalInterest,
        term : loan_details.length, 
        status_code : LoanStatus.ONGOING,
        renewal_id : req.body.loan_header_id,
        renewal_amount : req.body.Balance
      }, ['loan_header_id'] )
      
      const loanDetailsMap = loan_details.map(v => { 
        if(term_type === 'days') {
          return {
            loan_header_id : id[0],
            due_date : v.dueDate.split('T')[0],
            check_date : v.check_date,
            due_date : v.dueDate,
            check_number : Number(v.checkNumber),
            bank_account_id : Number(v.bank_account_id),
            // monthly_amortization : Number(v.amortization),
            monthly_interest : isRediscounting ? 0 : Number(v.interest),
            monthly_principal : Number(v.principal),
            net_proceeds : Number(v.net_proceeds),
            accumulated_penalty : 0
          }
        }
        return {
          loan_header_id : loanHeaderId[0],
          check_date : v.dueDate.split('T')[0],
          check_number : Number(v.checkNumber),
          bank_account_id : Number(v.bank_account_id),
          monthly_amortization : Number(v.amortization),
          monthly_interest : isRediscounting ? 0 : Number(v.interest),
          monthly_principal : Number(v.principal),
          accumulated_penalty : 0
        }
      })

      await t('loan_detail').insert(loanDetailsMap)
      
      await t('vouchertbl').insert(
        voucher.map((v) => ({
          account_title_id : +v.id,
          debit_amount : +v.debit,
          credit_amount : +v.credit,
          loan_header_id : loanHeaderId[0]
        })
      ))

      const response = {
        renewal_id : req.body.loan_header_id,
        loan : {
          loan_header_id : loanHeaderId[0],
          date_granted : req.body.transaction_date,
          name : req.body.customer_name,
          pn_number : pnNumber,
          principal_amount : req.body.principal_amount,
          total_interest : totalInterest,
          bank_name : req.body.bank_name,
          loancategory : req.body.loan_category,
          loanfacility : req.body.loan_facility,
          loan_term : `${loan_details.length} ${req.body.term_type}`,
          status_code : LoanStatus.ONGOING,
        }
      }
      res.status(200).json(response)
    })
  } catch (error) {
    console.log(`ERROR: ${error}`)
  }
})

// Add this route after line 162 (after the recalculate routes)
// GET route to fetch loan data for editing
loanRouter.get('/edit/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get loan header information with customer details
    const loanHeader = await builder
      .select('*')
      .from('view_loan_header') // Using your existing view
      .where('loan_header_id', id)
      .first();

    if (!loanHeader) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Get loan details (payment schedule)
    const loanDetails = await builder
      .select('*')
      .from('loan_detail')
      .where('loan_header_id', id)
      .orderBy('due_date', 'asc');

    // Get voucher entries
    const vouchers = await builder
      .select('v.*', 'at.account_title')
      .from('vouchertbl as v')
      .join('account_titletbl as at', 'v.account_title_id', 'at.account_title_id')
      .where('v.loan_header_id', id);

    // Get deduction history
    const deductions = await builder
      .select('ldh.*', 'ld.deduction_type')
      .from('loan_deduction_historytbl as ldh')
      .join('loan_deductiontbl as ld', 'ldh.loan_deduction_id', 'ld.loan_deduction_id')
      .where('ldh.loan_header_id', id);

    // Format customer name
    const fullname = formatName(loanHeader);

    const editData = {
      loan_header_id: loanHeader.loan_header_id,
      pn_number: loanHeader.pn_number,
      customer_id: loanHeader.customer_id,
      customer_name: fullname,
      principal_amount: Number(loanHeader.principal_amount),
      interest_rate: Number(loanHeader.interest_rate),
      total_interest: Number(loanHeader.total_interest),
      date_granted: loanHeader.date_granted,
      transaction_date: loanHeader.transaction_date,
      check_number: loanHeader.check_number,
      check_date: loanHeader.check_date,
      check_issued_name: loanHeader.check_issued_name,
      voucher_number: loanHeader.voucher_number,
      bank_account_id: loanHeader.bank_account_id,
      bank_name: loanHeader.bank_name,
      collateral_id: loanHeader.collateral_id,
      collateral: loanHeader.collateral,
      loan_category_id: loanHeader.loan_category_id,
      loan_category: loanHeader.loancategory,
      loan_facility_id: loanHeader.loan_facility_id,
      loan_facility: loanHeader.loanfacility,
      term: loanHeader.term,
      term_type: loanHeader.term_type,
      status_code: loanHeader.status_code,
      prepared_by: loanHeader.prepared_by,
      approved_by: loanHeader.approved_by,
      checked_by: loanHeader.checked_by,
      co_maker_id: loanHeader.co_maker_id,
      remarks: loanHeader.remarks,
      has_second_check: loanHeader.has_second_check,
      bank_name_2: loanHeader.bank_name_2,
      check_number_2: loanHeader.check_number_2,
      check_date_2: loanHeader.check_date_2,
      loan_details: loanDetails.map(detail => ({
        loan_detail_id: detail.loan_detail_id,
        due_date: detail.due_date,
        check_number: detail.check_number,
        bank_account_id: detail.bank_account_id,
        monthly_amortization: Number(detail.monthly_amortization || 0),
        monthly_interest: Number(detail.monthly_interest),
        monthly_principal: Number(detail.monthly_principal),
        net_proceeds: Number(detail.net_proceeds || 0),
        accumulated_penalty: Number(detail.accumulated_penalty)
      })),
      vouchers: vouchers.map(voucher => ({
        id: voucher.account_title_id,
        account_title: voucher.account_title,
        debit: Number(voucher.debit_amount),
        credit: Number(voucher.credit_amount)
      })),
      deductions: deductions.map(deduction => ({
        id: deduction.loan_deduction_id,
        label: deduction.deduction_type,  // This matches what DeductionDetailsForm expects
        amount: Number(deduction.amount)
      }))
    };

    res.status(200).json(editData);
  } catch (error) {
    console.log('Error fetching loan for edit:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT route to update loan data
loanRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      voucher,
      deduction,
      loan_details,
      term_type,
      loan_facility,
      ...loanData
    } = req.body;

    // Check if loan exists and is editable
    const existingLoan = await builder
      .select('status_code')
      .from('loan_headertbl')
      .where('loan_header_id', id)
      .first();

    if (!existingLoan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Prevent editing of completed or closed loans
    if (existingLoan.status_code === 'Completed' || existingLoan.status_code === 'Closed') {
      return res.status(400).json({ message: 'Cannot edit completed or closed loans' });
    }

    const totalInterest = loan_details.reduce((acc, cur) => acc + Number(cur.interest || cur.monthly_interest), 0);
    const term = term_type === 'months' ? loan_details.length : 
                 Math.max(...loan_details.map(d => dayjs(d.dueDate || d.due_date).diff(dayjs(), 'day'))) + 1;

    await builder.transaction(async (t) => {
      // Update loan header
      await t('loan_headertbl')
        .where('loan_header_id', id)
        .update({
          check_number: loanData.check_number,
          term_type: loanData.term_type,
          check_date: loanData.check_date,
          prepared_by: loanData.prepared_by,
          approved_by: loanData.approved_by,
          checked_by: loanData.checked_by,
          customer_id: loanData.customer_id,
          transaction_date: loanData.transaction_date,
          bank_account_id: Number(loanData.bank_account_id),
          collateral_id: loanData.collateral_id,
          loan_category_id: loanData.loan_category_id,
          loan_facility_id: loanData.loan_facility_id,
          principal_amount: Number(loanData.principal_amount),
          interest_rate: Number(loanData.interest_rate),
          date_granted: loanData.date_granted,
          check_issued_name: loanData.check_issued_name,
          voucher_number: loanData.voucher_number,
          total_interest: totalInterest,
          term: term,
          co_maker_id: loanData.co_maker_id,
          remarks: loanData.remarks,
          has_second_check: loanData.has_second_check,
          bank_name_2: loanData.bank_name_2,
          check_number_2: loanData.check_number_2,
          check_date_2: loanData.check_date_2
        });

      // Delete and recreate loan details
      await t('loan_detail').where('loan_header_id', id).del();
      
      const loanDetailsMap = loan_details.map(v => {
        if (term_type === 'days') {
          return {
            loan_header_id: id,
            due_date: (v.dueDate || v.due_date).split('T')[0],
            check_date: v.check_date,
            check_number: Number(v.checkNumber || v.check_number),
            bank_account_id: Number(v.bank_account_id),
            monthly_interest: Number(v.interest || v.monthly_interest),
            monthly_principal: Number(v.principal || v.monthly_principal),
            net_proceeds: Number(v.net_proceeds || 0),
            accumulated_penalty: Number(v.accumulated_penalty || 0)
          };
        }
        
        return {
          loan_header_id: id,
          due_date: (v.dueDate || v.due_date).split('T')[0],
          check_number: Number(v.checkNumber || v.check_number),
          bank_account_id: Number(v.bank_account_id),
          monthly_amortization: Number(v.amortization || v.monthly_amortization),
          monthly_interest: Number(v.interest || v.monthly_interest),
          monthly_principal: Number(v.principal || v.monthly_principal),
          accumulated_penalty: Number(v.accumulated_penalty || 0)
        };
      });

      await t('loan_detail').insert(loanDetailsMap);

      // Update voucher entries
      if (voucher && voucher.length > 0) {
        await t('vouchertbl').where('loan_header_id', id).del();
        await t('vouchertbl').insert(
          voucher.map((v) => ({
            account_title_id: +v.id,
            debit_amount: +v.debit,
            credit_amount: +v.credit,
            loan_header_id: id
          }))
        );
      }

      // Update deduction history
      if (deduction && deduction.length > 0) {
        await t('loan_deduction_historytbl').where('loan_header_id', id).del();
        await t('loan_deduction_historytbl').insert(
          deduction.map((v) => ({
            loan_deduction_id: v.id,
            loan_header_id: id,
            amount: v.amount
          }))
        );
      }

      const response = {
        loan_header_id: id,
        date_granted: loanData.date_granted,
        name: loanData.customer_name,
        pn_number: loanData.pn_number,
        principal_amount: Number(loanData.principal_amount),
        total_interest: totalInterest,
        bank_name: loanData.bank_name,
        loancategory: loanData.loan_category,
        loanfacility: loanData.loan_facility,
        loan_term: `${term} ${loanData.term_type}`,
        status_code: loanData.status_code,
        message: 'Loan updated successfully'
      };

      res.status(200).json(response);
    });

  } catch (error) {
    console.log('Error updating loan:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

loanRouter.delete('/', async (req, res) => {
  // console.log('delete!')
  // console.log(req.body.id)
  const {id} = req.body
  if (!id) return
  try {
    const del = await builder('loan_headertbl').where('loan_header_id', id).del()
    // console.log(id, del)
    if(del){
      return res.status(200).json({id : id})
    }
  } catch (error) {
    
  }
})


loanRouter.post('/', async (req, res) => {

  const {voucher, deduction, loan_details, isCash, term_type, loan_facility, } = req.body

  function getMaxDueDate (details) {
    let max = 0
    for (const detail of details) {
      const due = dayjs(detail.dueDate).diff(dayjs(), 'day')
      if(due > max ) {
        max = due
      }
    }
    return max + 1
  }
  
  // const {is_rediscount} = await builder('loan_facilitytbl').select('is_rediscount').where('description', loan_facility).first()
  
  const pnNumber = await createPnNumber(req.body)

  const totalInterest = loan_details.reduce((acc, cur) => acc + Number(cur.interest), 0)
  
  const term = term_type === 'months' ? loan_details.length : getMaxDueDate(loan_details)
  
  try {
    await builder.transaction(async t => {
      let id = 0;
      if(!req.body.has_second_check) {
        // console.log('No second check')
        id = await builder('loan_headertbl').insert({
          pn_number : pnNumber,
          check_number :  req.body.check_number,
          term_type : req.body.term_type,
          check_date : req.body.check_date,
          prepared_by : req.body.prepared_by,
          approved_by : req.body.approved_by,
          checked_by : req.body.checked_by,
          customer_id : req.body.customer_id,
          transaction_date : req.body.transaction_date,
          bank_account_id : Number(req.body.bank_account_id),
          collateral_id : req.body.collateral_id,
          loan_category_id : req.body.loan_category_id,
          loan_facility_id : req.body.loan_facility_id,
          principal_amount : Number(req.body.principal_amount),
          interest_rate : Number(req.body.interest_rate),
          // date_granted : dayjs(req.body.date_granted).format('YYYY-MM-DD'),
          date_granted : req.body.date_granted,
          has_second_check: false,
          check_issued_name : req.body.check_issued_name,
          voucher_number : req.body.voucher_number,
          total_interest : totalInterest,
          term : term, 
          status_code : LoanStatus.ONGOING,
          renewal_id : 0,
          renewal_amount : 0,
          co_maker_id : req.body.co_maker_id,
          remarks: req.body.remarks
        }, '*').transacting(t)
      }else{
        // console.log('second check')
        id = await builder('loan_headertbl').insert({
          pn_number : pnNumber,
          check_number :  req.body.check_number,
          term_type : req.body.term_type,
          check_date : req.body.check_date,
          prepared_by : req.body.prepared_by,
          approved_by : req.body.approved_by,
          checked_by : req.body.checked_by,
          customer_id : req.body.customer_id,
          transaction_date : req.body.transaction_date,
          bank_account_id : Number(req.body.bank_account_id),
          collateral_id : req.body.collateral_id,
          loan_category_id : req.body.loan_category_id,
          loan_facility_id : req.body.loan_facility_id,
          principal_amount : Number(req.body.principal_amount),
          interest_rate : Number(req.body.interest_rate),
          // date_granted : dayjs(req.body.date_granted).format('YYYY-MM-DD'),
          date_granted : req.body.date_granted,
          check_issued_name : req.body.check_issued_name,
          voucher_number : req.body.voucher_number,
          total_interest : totalInterest,
          has_second_check: true,
          bank_name_2:  req.body.bank_name_2,
          check_number_2: req.body.check_number_2,
          check_date_2: req.body.check_date_2,
          term : term, 
          status_code : LoanStatus.ONGOING,
          renewal_id : 0,
          renewal_amount : 0,
          co_maker_id : req.body.co_maker_id,
          remarks: req.body.remarks
        }, '*').transacting(t)
        // console.log(488, id)
      }

      // console.log(481, id)
      // return 
      const loanDetailsMap = loan_details.map(v => { 
        if(term_type === 'days') {
          return {
            loan_header_id : id[0],
            due_date : v.dueDate.split('T')[0],
            check_date : v.check_date,
            due_date : v.dueDate,
            check_number : Number(v.checkNumber),
            bank_account_id : Number(v.bank_account_id),
            monthly_interest : Number(v.interest),
            monthly_principal : Number(v.principal),
            net_proceeds : Number(v.net_proceeds),
            accumulated_penalty : 0
          }
        }
  
        return{
          loan_header_id : id[0],
          due_date : v.dueDate.split('T')[0],
          // check_date : v.check_date,
          check_number : Number(v.checkNumber),
          bank_account_id : Number(v.bank_account_id),
          monthly_amortization : Number(v.amortization),
          monthly_interest : Number(v.interest),
          monthly_principal : Number(v.principal),
          accumulated_penalty : 0
        }
      })

      // await builder.insert(loanDetailsMap).into('loan_detail').transacting(t)
      //TODO : refactor 
      //TODO handle deduction id in client
      const deductionFormat = deduction.map((v) =>({
        loan_deduction_id : v.id,
        loan_header_id : id[0],
        amount : v.amount,
        process_date : new Date().toISOString().split('T')[0],
        pr_number : Number(isCash.pr_number),
        isCash : Number(isCash.value)
      }))
  
      if(deductionFormat.length > 0) {
        await builder.insert(deductionFormat).into('loan_deduction_historytbl').transacting(t)
      }
  
      const mapVoucher = voucher.map((v) => {
        return {
          account_title_id : Number(v.id),
          debit_amount : Number(v.debit),
          credit_amount : Number(v.credit),
          loan_header_id : id[0],
        }
      })
  
      const voucherId = await builder.insert(mapVoucher).into('vouchertbl').transacting(t)

      res.status(200).json({
        loan_header_id : id[0],
        date_granted : req.body.date_granted,
        name : req.body.customer_name,
        pn_number : pnNumber,
        principal_amount : Number(req.body.principal_amount),
        total_interest : totalInterest,
        bank_name : req.body.bank_name ,
        loancategory : req.body.loan_category,
        loanfacility : req.body.loan_facility,
        loan_term : `${term} ${req.body.term_type}`,
        status_code : LoanStatus.ONGOING,
      })   
  })
  } catch (error) {
    console.log(error)
  }
  
})


loanRouter.put('/details/:id', async (req, res) => {
  const {id} = req.params
  const {loan_detail_id, check_number, bank_id} = req.body
  
  try {
    const update = await builder('loan_detail').where({
      loan_header_id : id,
      loan_detail_id : loan_detail_id
    }).update({
      bank_account_id : bank_id,
      check_number : check_number
    })
    return res.status(200).send()
  } catch (error) {
    return res.status(500).send(error)
  }
})

loanRouter.get('/category', async (req, res)=>{
  const banks = await builder.select({id : 'loan_category_id', name : 'description', code : 'code'}).from('loan_categorytbl')
  res.status(200).json(banks)
  
})

loanRouter.get('/facility', async (req, res)=>{
  const banks = await builder.select({id : 'loan_facility_id', name : 'description', code : 'code'}).from('loan_facilitytbl')
  res.status(200).json(banks)
})

loanRouter.get('/collateral', async (req, res)=> {
  const col = await builder.select({id : 'collateral_id', name : 'description'}).from('collateraltbl')
  res.status(200).json(col)
})

loanRouter.get('/penalty', async (req, res) =>{
  const penalty = await builder.select({id : 'penalty_id', penaltyType : 'penalty_type'}).from('penaltytbl')
  res.status(200).json(penalty)
})

loanRouter.use('/collections', collections)


loanRouter.post('/attachment/:id', (req, res) => {
  attachment(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      res.status(500).json({success : false})
    } else if (err) {
      // An unknown error occurred when uploading.
      res.status(500).json({success : false})
    }
    const { id } = req.params
    
    if(!id) return res.status(500).json({success : false});

    try {
      const updateAttachment = await builder('loan_headertbl').where('loan_header_id', '=', id).update({
        attachment_url : req.file.path
      })
      
      // console.log(updateAttachment)
      res.status(200).json({success : true})
      
    } catch (error) {
      console.log(error)
      res.status(500).json({success : false});
    }
  })
})

loanRouter.post('/details', async (req, res, next) => {
  // res.json({success : true})
  const data = req.body
  // console.log(data)
  try {
    const loan_details = data.details.map((loan) => ({
      loan_header_id : data.header_id,
      check_number: loan.checkNumber,
      bank_account_id : loan.bank_account_id,
      monthly_amortization: loan.amortization,
      monthly_interest: loan.interest,
      monthly_principal: loan.principal,
      accumulated_penalty: 0,
      due_date: loan.dueDate,
    }))
    // console.log(loan_details)
    await builder('loan_detail').insert(loan_details)
    
    res.status(200).end()

  } catch (error) {
    res.status(500).end()
  }
  // console.log(req.body)
})
loanRouter.get('/:id', getLoan)

module.exports = { loanRouter }