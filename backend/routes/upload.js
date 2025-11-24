// ============================================
// COMPLETE FILE: backend/routes/upload.js
// Copy this ENTIRE file and replace your upload.js
// ============================================
const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const uploadRouter = express.Router();
const builder = require("../builder");
const dayjs = require("dayjs");

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only Excel files allowed."));
    }
  },
});

// Parse Excel date serial number to JavaScript Date
const parseExcelDate = (serial) => {
  if (!serial) return null;
  if (typeof serial === "string") {
    // If already a string, try to parse it
    const parsed = dayjs(serial);
    return parsed.isValid() ? parsed.format("YYYY-MM-DD") : null;
  }
  // Excel date serial number
  const utc_days = Math.floor(serial - 25569);
  const date = new Date(utc_days * 86400 * 1000);
  return dayjs(date).format("YYYY-MM-DD");
};

// Upload loan transactions
uploadRouter.post("/loans", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName =
      workbook.SheetNames.find((name) => name.toUpperCase().includes("LOAN")) ||
      workbook.SheetNames[0];

    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

    console.log(`Processing ${data.length} rows from sheet: ${sheetName}`);

    const results = { success: 0, failed: 0, errors: [], skipped: 0 };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      try {
        // Get PN number and check if valid
        const pnNumber = String(row["PN NUMBER"] || "").trim();
        const principal = parseFloat(row["PRINCIPAL"]) || 0;
        const term = parseInt(row["TERM"]) || 0;

        console.log(
          `Row ${i + 2}: PN=${pnNumber}, Principal=${principal}, Term=${term}`
        );

        // Skip invalid rows
        if (
          !pnNumber ||
          pnNumber.toUpperCase().includes("NUMBER") ||
          pnNumber.toUpperCase() === "PN NUMBER" ||
          principal === 0 ||
          term === 0
        ) {
          results.skipped++;
          console.log(`  -> Skipped (invalid data)`);
          continue;
        }

        const loanHeader = {
          pn_number: pnNumber,
          customer_id: row["CUSTOMER_ID"] || null,
          transaction_date: parseExcelDate(row["DATE"]),
          bank_account_id: row["BANK_ID"] || null,
          check_issued_name: row["BORROWER'S NAME"] || "",
          check_number: row["CHECK"] || "",
          check_date: parseExcelDate(row["DATE"]),
          principal_amount: principal,
          interest_rate: parseFloat(row["RATE"]) || 0,
          total_interest: parseFloat(row["INTEREST"]) || 0,
          term: term,
          term_type: "months",
          date_granted:
            parseExcelDate(row["DATE GRANTED"]) || parseExcelDate(row["DATE"]),
          status_code: row["STATUS"] || "On Going",
          voucher_number: row["VOUCHER"] || "",
          loan_category_id: row["CATEGORY_ID"] || null,
          loan_facility_id: row["FACILITY_ID"] || null,
        };

        const netProceeds = parseFloat(row["NET"]) || 0;

        console.log("  -> Inserting loan header...");
        const [loanHeaderId] = await builder("loan_headertbl").insert(
          loanHeader
        );
        console.log(`  -> Created loan_header_id: ${loanHeaderId}`);

        // Create loan details based on term
        const monthlyPayment =
          (loanHeader.principal_amount + loanHeader.total_interest) /
          loanHeader.term;
        const monthlyInterest = loanHeader.total_interest / loanHeader.term;
        const monthlyPrincipal = loanHeader.principal_amount / loanHeader.term;

        const loanDetails = [];
        for (let month = 0; month < loanHeader.term; month++) {
          loanDetails.push({
            loan_header_id: loanHeaderId,
            check_date: loanHeader.check_date,
            check_number: loanHeader.check_number,
            bank_account_id: loanHeader.bank_account_id,
            monthly_amortization: monthlyPayment.toFixed(2),
            monthly_interest: monthlyInterest.toFixed(2),
            monthly_principal: monthlyPrincipal.toFixed(2),
            accumulated_penalty: 0,
            due_date: dayjs(loanHeader.date_granted)
              .add(month + 1, "month")
              .format("YYYY-MM-DD"),
            net_proceeds: month === 0 ? netProceeds : null,
          });
        }

        await builder("loan_detail").insert(loanDetails);
        console.log(`  -> Created ${loanDetails.length} loan details`);

        results.success++;
      } catch (error) {
        console.error(`  -> Error on row ${i + 2}:`, error.message);
        results.failed++;
        results.errors.push({ row: i + 2, error: error.message });
      }
    }

    console.log("Upload results:", results);
    res.json({ success: true, results });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload payment transactions
uploadRouter.post("/payments", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName =
      workbook.SheetNames.find((name) =>
        name.toUpperCase().includes("PAYMENT")
      ) || workbook.SheetNames[0];

    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

    console.log(`Processing ${data.length} rows from sheet: ${sheetName}`);

    const results = { success: 0, failed: 0, errors: [], skipped: 0 };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      try {
        const pnNumber = String(row["PN NUMBER"] || "").trim();
        const principal = parseFloat(row["PRINCIPAL"]) || 0;

        console.log(`Row ${i + 2}: PN=${pnNumber}, Principal=${principal}`);

        // Skip invalid rows or header rows
        if (
          !pnNumber ||
          pnNumber.toUpperCase().includes("PROMISSORY") ||
          pnNumber.toUpperCase().includes("NUMBER") ||
          pnNumber.toUpperCase() === "PN NUMBER" ||
          principal === 0
        ) {
          results.skipped++;
          console.log(`  -> Skipped (invalid/header row)`);
          continue;
        }

        const paymentDate = parseExcelDate(row["DATE"]);

        console.log(`  -> Looking for loan with PN: ${pnNumber}`);
        const loanDetailResult = await builder.raw(
          `
          SELECT ld.loan_detail_id 
          FROM loan_detail ld
          INNER JOIN loan_headertbl lh ON ld.loan_header_id = lh.loan_header_id
          WHERE lh.pn_number = ?
          ORDER BY ld.due_date ASC
          LIMIT 1
        `,
          [pnNumber]
        );

        const loanDetail = loanDetailResult[0][0];

        if (!loanDetail) {
          throw new Error(
            `Loan not found for PN: ${pnNumber}. Please upload loan transaction first.`
          );
        }

        console.log(`  -> Found loan_detail_id: ${loanDetail.loan_detail_id}`);

        const checkDetails = String(row["CHECK DETAILS"] || "").split("/");

        const payment = {
          loan_detail_id: loanDetail.loan_detail_id,
          principal_payment: principal,
          interest_payment: parseFloat(row["INTEREST"]) || 0,
          payment_amount: parseFloat(row["TOTAL PAYMENT"]) || 0,
          payment_type: row["MODE OF PAYMENT"] || "CHECK",
          penalty_amount: parseFloat(row["HOLD CHARGE (PENALTY)"]) || 0,
          payment_status_id: 1,
          receiptno: row["PR"] || "",
          OR_no: row["OR"] || "",
          remarks: row["REMARKS"] || "",
          bank: checkDetails[0] || "",
          checkno: checkDetails[1] || "",
        };

        await builder("paymenttbl").insert(payment);
        console.log("  -> Payment inserted");

        const paymentHistory = {
          loan_detail_id: loanDetail.loan_detail_id,
          payment_principal: payment.principal_payment,
          payment_interest: payment.interest_payment,
          payment_penalty: payment.penalty_amount,
          payment_date: paymentDate,
          payment_type: payment.payment_type,
          payment_receipt: payment.receiptno,
          remarks: payment.remarks,
          bank: payment.bank,
          check_no: payment.checkno,
          check_date: paymentDate,
        };

        await builder("payment_historytbl").insert(paymentHistory);
        console.log("  -> Payment history inserted");

        results.success++;
      } catch (error) {
        console.error(`  -> Error on row ${i + 2}:`, error.message);
        results.failed++;
        results.errors.push({ row: i + 2, error: error.message });
      }
    }

    console.log("Upload results:", results);
    res.json({ success: true, results });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = uploadRouter;
