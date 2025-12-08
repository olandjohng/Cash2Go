const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const uploadRouter = express.Router();
const builder = require('../builder');
const dayjs = require('dayjs');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel files allowed.'));
    }
  }
});

const parseExcelDate = (serial) => {
  if (!serial) return null;
  if (typeof serial === 'string') {
    const parsed = dayjs(serial);
    return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null;
  }
  const utc_days = Math.floor(serial - 25569);
  const date = new Date(utc_days * 86400 * 1000);
  return dayjs(date).format('YYYY-MM-DD');
};

// Main upload endpoint - processes all 4 sheets
uploadRouter.post('/bulk', upload.single('file'), async (req, res) => {
  const trx = await builder.transaction();
  
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const results = {
      loan_headers: { success: 0, failed: 0, errors: [] },
      loan_details: { success: 0, failed: 0, errors: [] },
      payments: { success: 0, failed: 0, errors: [] },
      payment_history: { success: 0, failed: 0, errors: [] }
    };

    // ID mapping: Excel temp ID -> Real DB ID
    const headerIdMap = {}; // { excelId: dbId }
    const detailIdMap = {}; // { excelId: dbId }

    console.log('\n=== Starting Bulk Upload ===\n');

    // ========================================
    // STEP 1: Process loan_header sheet
    // ========================================
    console.log('STEP 1: Processing loan_header...');
    const headerSheet = workbook.Sheets['loan_header'];
    if (!headerSheet) {
      throw new Error('Sheet "loan_header" not found');
    }

    const headers = xlsx.utils.sheet_to_json(headerSheet);
    console.log(`Found ${headers.length} loan headers`);

    for (let i = 0; i < headers.length; i++) {
      const row = headers[i];
      try {
        const excelHeaderId = row.loan_header_id;
        
        const loanHeader = {
          pn_number: row.pn_number,
          customer_id: row.customer_id || null,
          transaction_date: parseExcelDate(row.transaction_date),
          bank_account_id: row.bank_account_id || null,
          check_issued_name: row.check_issued_name,
          check_number: row.check_number,
          check_date: parseExcelDate(row.check_date),
          collateral_id: row.collateral_id || null,
          loan_category_id: row.loan_category_id || null,
          loan_facility_id: row.loan_facility_id || null,
          principal_amount: parseFloat(row.principal_amount) || 0,
          interest_rate: parseFloat(row.interest_rate) || 0,
          total_interest: parseFloat(row.total_interest) || 0,
          term: parseInt(row.term) || 0,
          term_type: row.term_type || 'months',
          date_granted: parseExcelDate(row.date_granted),
          status_code: row.status_code || 'On Going',
          voucher_number: row.voucher_number,
          renewal_id: row.renewal_id || 0,
          renewal_amount: parseFloat(row.renewal_amount) || 0,
          prepared_by: row.prepared_by,
          checked_by: row.checked_by,
          approved_by: row.approved_by,
          co_maker_id: row.co_maker_id || null,
          has_second_check: row.has_second_check || 0,
          bank_name_2: row.bank_name_2,
          check_number_2: row.check_number_2,
          check_date_2: parseExcelDate(row.check_date_2),
          remarks: row.remarks
        };

        const [dbHeaderId] = await trx('loan_headertbl').insert(loanHeader);
        headerIdMap[excelHeaderId] = dbHeaderId;
        
        console.log(`  ✓ Header ${excelHeaderId} -> DB ID ${dbHeaderId} (${row.pn_number})`);
        results.loan_headers.success++;
      } catch (error) {
        console.error(`  ✗ Header row ${i + 2}:`, error.message);
        results.loan_headers.failed++;
        results.loan_headers.errors.push({ row: i + 2, error: error.message });
      }
    }

    // ========================================
    // STEP 2: Process loan_detail sheet
    // ========================================
    console.log('\nSTEP 2: Processing loan_detail...');
    const detailSheet = workbook.Sheets['loan_detail'];
    if (!detailSheet) {
      throw new Error('Sheet "loan_detail" not found');
    }

    const details = xlsx.utils.sheet_to_json(detailSheet);
    console.log(`Found ${details.length} loan details`);

    for (let i = 0; i < details.length; i++) {
      const row = details[i];
      try {
        const excelDetailId = row.loan_detail_id;
        const excelHeaderId = row.loan_header_id;
        const realHeaderId = headerIdMap[excelHeaderId];

        if (!realHeaderId) {
          throw new Error(`Header ID ${excelHeaderId} not found in mapping`);
        }

        const loanDetail = {
          loan_header_id: realHeaderId,
          check_date: parseExcelDate(row.check_date),
          check_number: row.check_number,
          bank_account_id: row.bank_account_id || null,
          monthly_amortization: parseFloat(row.monthly_amortization) || 0,
          monthly_interest: parseFloat(row.monthly_interest) || 0,
          monthly_principal: parseFloat(row.monthly_principal) || 0,
          accumulated_penalty: parseFloat(row.accumulated_penalty) || 0,
          due_date: parseExcelDate(row.due_date),
          net_proceeds: row.net_proceeds ? parseFloat(row.net_proceeds) : null
        };

        const [dbDetailId] = await trx('loan_detail').insert(loanDetail);
        detailIdMap[excelDetailId] = dbDetailId;
        
        console.log(`  ✓ Detail ${excelDetailId} -> DB ID ${dbDetailId} (Header: ${excelHeaderId})`);
        results.loan_details.success++;
      } catch (error) {
        console.error(`  ✗ Detail row ${i + 2}:`, error.message);
        results.loan_details.failed++;
        results.loan_details.errors.push({ row: i + 2, error: error.message });
      }
    }

    // ========================================
    // STEP 3: Process payment sheet
    // ========================================
    console.log('\nSTEP 3: Processing payment...');
    const paymentSheet = workbook.Sheets['payment'];
    if (!paymentSheet) {
      throw new Error('Sheet "payment" not found');
    }

    const payments = xlsx.utils.sheet_to_json(paymentSheet);
    console.log(`Found ${payments.length} payments`);

    for (let i = 0; i < payments.length; i++) {
      const row = payments[i];
      try {
        const excelDetailId = row.loan_detail_id;
        const realDetailId = detailIdMap[excelDetailId];

        if (!realDetailId) {
          throw new Error(`Detail ID ${excelDetailId} not found in mapping`);
        }

        const payment = {
          loan_detail_id: realDetailId,
          principal_payment: parseFloat(row.principal_payment) || 0,
          interest_payment: parseFloat(row.interest_payment) || 0,
          payment_amount: parseFloat(row.payment_amount) || 0,
          payment_type: row.payment_type || 'CHECK',
          penalty_amount: parseFloat(row.penalty_amount) || 0,
          payment_status_id: row.payment_status_id || 1,
          receiptno: row.receiptno,
          OR_no: row.OR_no,
          remarks: row.remarks,
          bank: row.bank,
          checkno: row.checkno
        };

        await trx('paymenttbl').insert(payment);
        
        console.log(`  ✓ Payment for Detail ${excelDetailId} -> DB Detail ID ${realDetailId}`);
        results.payments.success++;
      } catch (error) {
        console.error(`  ✗ Payment row ${i + 2}:`, error.message);
        results.payments.failed++;
        results.payments.errors.push({ row: i + 2, error: error.message });
      }
    }

    // ========================================
    // STEP 4: Process payment_history sheet
    // ========================================
    console.log('\nSTEP 4: Processing payment_history...');
    const historySheet = workbook.Sheets['payment_history'];
    if (!historySheet) {
      throw new Error('Sheet "payment_history" not found');
    }

    const histories = xlsx.utils.sheet_to_json(historySheet);
    console.log(`Found ${histories.length} payment histories`);

    for (let i = 0; i < histories.length; i++) {
      const row = histories[i];
      try {
        const excelDetailId = row.loan_detail_id;
        const realDetailId = detailIdMap[excelDetailId];

        if (!realDetailId) {
          throw new Error(`Detail ID ${excelDetailId} not found in mapping`);
        }

        const paymentHistory = {
          loan_detail_id: realDetailId,
          payment_principal: parseFloat(row.payment_principal) || 0,
          payment_interest: parseFloat(row.payment_interest) || 0,
          payment_penalty: parseFloat(row.payment_penalty) || 0,
          payment_date: parseExcelDate(row.payment_date),
          payment_type: row.payment_type || 'CHECK',
          payment_receipt: row.payment_receipt,
          remarks: row.remarks,
          bank: row.bank,
          check_no: row.check_no,
          check_date: parseExcelDate(row.check_date),
          attachment: row.attachment
        };

        await trx('payment_historytbl').insert(paymentHistory);
        
        console.log(`  ✓ History for Detail ${excelDetailId} -> DB Detail ID ${realDetailId}`);
        results.payment_history.success++;
      } catch (error) {
        console.error(`  ✗ History row ${i + 2}:`, error.message);
        results.payment_history.failed++;
        results.payment_history.errors.push({ row: i + 2, error: error.message });
      }
    }

    // Commit transaction
    await trx.commit();
    console.log('\n=== Upload Complete - Transaction Committed ===\n');

    res.json({ success: true, results });
  } catch (error) {
    await trx.rollback();
    console.error('\n=== Upload Failed - Transaction Rolled Back ===');
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = uploadRouter;