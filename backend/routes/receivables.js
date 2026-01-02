const express = require("express");
const receivablesRouter = express.Router();
const builder = require("../builder");
const dayjs = require("dayjs");

// Get receivables report
receivablesRouter.get("/", async (req, res) => {
  try {
    const { from, to, asOf, groupBy = "customer" } = req.query;

    // Validate date parameters
    if (!from && !to && !asOf) {
      return res.status(400).json({
        success: false,
        message: "Please provide date filters (from/to or asOf)",
      });
    }

    // Build query
    let query = builder("loan_headertbl as lh")
      .select(
        "lh.customer_id",
        builder.raw(
          `CONCAT_WS(', ', c.clname, c.cfname, c.cmname) as customer_name`
        ),
        "c.contactno as phone_number",
        "c.address",
        builder.raw("COUNT(DISTINCT lh.loan_header_id) as total_loans"),
        builder.raw(`
          SUM(
            lh.principal_amount - 
            COALESCE((
              SELECT SUM(p.principal_payment)
              FROM loan_detail ld2
              LEFT JOIN paymenttbl p ON ld2.loan_detail_id = p.loan_detail_id
              WHERE ld2.loan_header_id = lh.loan_header_id
            ), 0)
          ) as principal_receivable
        `),
        builder.raw(`
          SUM(
            lh.total_interest - 
            COALESCE((
              SELECT SUM(p.interest_payment)
              FROM loan_detail ld2
              LEFT JOIN paymenttbl p ON ld2.loan_detail_id = p.loan_detail_id
              WHERE ld2.loan_header_id = lh.loan_header_id
            ), 0)
          ) as interest_receivable
        `),
        builder.raw(`
          SUM(
            COALESCE((
              SELECT SUM(ld2.accumulated_penalty - COALESCE(p.penalty_amount, 0))
              FROM loan_detail ld2
              LEFT JOIN paymenttbl p ON ld2.loan_detail_id = p.loan_detail_id
              WHERE ld2.loan_header_id = lh.loan_header_id
            ), 0)
          ) as penalty_receivable
        `),
        builder.raw(`
          SUM(
            (lh.principal_amount + lh.total_interest) - 
            COALESCE((
              SELECT SUM(p.payment_amount)
              FROM loan_detail ld2
              LEFT JOIN paymenttbl p ON ld2.loan_detail_id = p.loan_detail_id
              WHERE ld2.loan_header_id = lh.loan_header_id
            ), 0) +
            COALESCE((
              SELECT SUM(ld2.accumulated_penalty - COALESCE(p.penalty_amount, 0))
              FROM loan_detail ld2
              LEFT JOIN paymenttbl p ON ld2.loan_detail_id = p.loan_detail_id
              WHERE ld2.loan_header_id = lh.loan_header_id
            ), 0)
          ) as total_receivable
        `)
      )
      .innerJoin("customertbl as c", "lh.customer_id", "c.customerid")
      .where("lh.status_code", "!=", "Paid") // Only active/ongoing loans
      .groupBy(
        "lh.customer_id",
        "c.clname",
        "c.cfname",
        "c.cmname",
        "c.contactno",
        "c.address"
      );

    // Apply date filters
    if (from && to) {
      query.whereBetween("lh.date_granted", [from, to]);
    } else if (asOf) {
      query.where("lh.date_granted", "<=", asOf);
    }

    const receivables = await query;

    // Get loan details for each customer
    const dataWithLoans = await Promise.all(
      receivables.map(async (customer) => {
        let loanQuery = builder("loan_headertbl as lh")
          .select(
            "lh.loan_header_id",
            "lh.pn_number",
            "lh.date_granted",
            "lh.principal_amount",
            "lh.total_interest",
            "lh.status_code",
            builder.raw(`
              lh.principal_amount - 
              COALESCE((
                SELECT SUM(p.principal_payment)
                FROM loan_detail ld
                LEFT JOIN paymenttbl p ON ld.loan_detail_id = p.loan_detail_id
                WHERE ld.loan_header_id = lh.loan_header_id
              ), 0) as principal_balance
            `),
            builder.raw(`
              lh.total_interest - 
              COALESCE((
                SELECT SUM(p.interest_payment)
                FROM loan_detail ld
                LEFT JOIN paymenttbl p ON ld.loan_detail_id = p.loan_detail_id
                WHERE ld.loan_header_id = lh.loan_header_id
              ), 0) as interest_balance
            `),
            builder.raw(`
              COALESCE((
                SELECT SUM(ld.accumulated_penalty - COALESCE(p.penalty_amount, 0))
                FROM loan_detail ld
                LEFT JOIN paymenttbl p ON ld.loan_detail_id = p.loan_detail_id
                WHERE ld.loan_header_id = lh.loan_header_id
              ), 0) as penalty_balance
            `)
          )
          .where("lh.customer_id", customer.customer_id)
          .where("lh.status_code", "!=", "Paid");

        // Apply same date filters to loans
        if (from && to) {
          loanQuery.whereBetween("lh.date_granted", [from, to]);
        } else if (asOf) {
          loanQuery.where("lh.date_granted", "<=", asOf);
        }

        const loans = await loanQuery;

        return {
          ...customer,
          principal_receivable: Number(
            customer.principal_receivable || 0
          ).toFixed(2),
          interest_receivable: Number(
            customer.interest_receivable || 0
          ).toFixed(2),
          penalty_receivable: Number(customer.penalty_receivable || 0).toFixed(
            2
          ),
          total_receivable: Number(customer.total_receivable || 0).toFixed(2),
          loans: loans.map((loan) => ({
            ...loan,
            principal_balance: Number(loan.principal_balance || 0).toFixed(2),
            interest_balance: Number(loan.interest_balance || 0).toFixed(2),
            penalty_balance: Number(loan.penalty_balance || 0).toFixed(2),
          })),
        };
      })
    );

    // Filter out customers with zero receivables
    const filteredData = dataWithLoans.filter(
      (c) => Number(c.total_receivable) > 0
    );

    // Calculate summary
    const summary = {
      total_customers: filteredData.length,
      total_loans: filteredData.reduce(
        (sum, c) => sum + Number(c.total_loans),
        0
      ),
      total_principal_receivable: filteredData
        .reduce((sum, c) => sum + Number(c.principal_receivable), 0)
        .toFixed(2),
      total_interest_receivable: filteredData
        .reduce((sum, c) => sum + Number(c.interest_receivable), 0)
        .toFixed(2),
      total_penalty_receivable: filteredData
        .reduce((sum, c) => sum + Number(c.penalty_receivable), 0)
        .toFixed(2),
      total_receivable: filteredData
        .reduce((sum, c) => sum + Number(c.total_receivable), 0)
        .toFixed(2),
      report_date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      filters: { from, to, asOf },
    };

    res.json({
      success: true,
      summary,
      data: filteredData,
    });
  } catch (error) {
    console.error("Receivables report error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating receivables report",
      error: error.message,
    });
  }
});

// Export to Excel endpoint
// Export to Excel endpoint
receivablesRouter.get("/export", async (req, res) => {
  try {
    const { from, to, asOf } = req.query;

    // Validate date parameters
    if (!from && !to && !asOf) {
      return res.status(400).json({
        success: false,
        message: "Please provide date filters (from/to or asOf)",
      });
    }

    // Build query
    let query = builder("loan_headertbl as lh")
      .select(
        "lh.customer_id",
        builder.raw(
          `CONCAT_WS(', ', c.clname, c.cfname, c.cmname) as customer_name`
        ),
        "c.contactno as phone_number",
        "c.address",
        builder.raw("COUNT(DISTINCT lh.loan_header_id) as total_loans"),
        builder.raw(`
          SUM(
            lh.principal_amount - 
            COALESCE((
              SELECT SUM(p.principal_payment)
              FROM loan_detail ld2
              LEFT JOIN paymenttbl p ON ld2.loan_detail_id = p.loan_detail_id
              WHERE ld2.loan_header_id = lh.loan_header_id
            ), 0)
          ) as principal_receivable
        `),
        builder.raw(`
          SUM(
            lh.total_interest - 
            COALESCE((
              SELECT SUM(p.interest_payment)
              FROM loan_detail ld2
              LEFT JOIN paymenttbl p ON ld2.loan_detail_id = p.loan_detail_id
              WHERE ld2.loan_header_id = lh.loan_header_id
            ), 0)
          ) as interest_receivable
        `),
        builder.raw(`
          SUM(
            COALESCE((
              SELECT SUM(ld2.accumulated_penalty - COALESCE(p.penalty_amount, 0))
              FROM loan_detail ld2
              LEFT JOIN paymenttbl p ON ld2.loan_detail_id = p.loan_detail_id
              WHERE ld2.loan_header_id = lh.loan_header_id
            ), 0)
          ) as penalty_receivable
        `),
        builder.raw(`
          SUM(
            (lh.principal_amount + lh.total_interest) - 
            COALESCE((
              SELECT SUM(p.payment_amount)
              FROM loan_detail ld2
              LEFT JOIN paymenttbl p ON ld2.loan_detail_id = p.loan_detail_id
              WHERE ld2.loan_header_id = lh.loan_header_id
            ), 0) +
            COALESCE((
              SELECT SUM(ld2.accumulated_penalty - COALESCE(p.penalty_amount, 0))
              FROM loan_detail ld2
              LEFT JOIN paymenttbl p ON ld2.loan_detail_id = p.loan_detail_id
              WHERE ld2.loan_header_id = lh.loan_header_id
            ), 0)
          ) as total_receivable
        `)
      )
      .innerJoin("customertbl as c", "lh.customer_id", "c.customerid")
      .where("lh.status_code", "!=", "Paid")
      .groupBy(
        "lh.customer_id",
        "c.clname",
        "c.cfname",
        "c.cmname",
        "c.contactno",
        "c.address"
      );

    // Apply date filters
    if (from && to) {
      query.whereBetween("lh.date_granted", [from, to]);
    } else if (asOf) {
      query.where("lh.date_granted", "<=", asOf);
    }

    const receivables = await query;

    // Get loan details for each customer
    const dataWithLoans = await Promise.all(
      receivables.map(async (customer) => {
        let loanQuery = builder("loan_headertbl as lh")
          .select(
            "lh.loan_header_id",
            "lh.pn_number",
            "lh.date_granted",
            "lh.principal_amount",
            "lh.total_interest",
            "lh.status_code",
            builder.raw(`
              lh.principal_amount - 
              COALESCE((
                SELECT SUM(p.principal_payment)
                FROM loan_detail ld
                LEFT JOIN paymenttbl p ON ld.loan_detail_id = p.loan_detail_id
                WHERE ld.loan_header_id = lh.loan_header_id
              ), 0) as principal_balance
            `),
            builder.raw(`
              lh.total_interest - 
              COALESCE((
                SELECT SUM(p.interest_payment)
                FROM loan_detail ld
                LEFT JOIN paymenttbl p ON ld.loan_detail_id = p.loan_detail_id
                WHERE ld.loan_header_id = lh.loan_header_id
              ), 0) as interest_balance
            `),
            builder.raw(`
              COALESCE((
                SELECT SUM(ld.accumulated_penalty - COALESCE(p.penalty_amount, 0))
                FROM loan_detail ld
                LEFT JOIN paymenttbl p ON ld.loan_detail_id = p.loan_detail_id
                WHERE ld.loan_header_id = lh.loan_header_id
              ), 0) as penalty_balance
            `)
          )
          .where("lh.customer_id", customer.customer_id)
          .where("lh.status_code", "!=", "Paid");

        // Apply same date filters to loans
        if (from && to) {
          loanQuery.whereBetween("lh.date_granted", [from, to]);
        } else if (asOf) {
          loanQuery.where("lh.date_granted", "<=", asOf);
        }

        const loans = await loanQuery;

        return {
          ...customer,
          principal_receivable: Number(
            customer.principal_receivable || 0
          ).toFixed(2),
          interest_receivable: Number(
            customer.interest_receivable || 0
          ).toFixed(2),
          penalty_receivable: Number(customer.penalty_receivable || 0).toFixed(
            2
          ),
          total_receivable: Number(customer.total_receivable || 0).toFixed(2),
          loans: loans.map((loan) => ({
            ...loan,
            principal_balance: Number(loan.principal_balance || 0).toFixed(2),
            interest_balance: Number(loan.interest_balance || 0).toFixed(2),
            penalty_balance: Number(loan.penalty_balance || 0).toFixed(2),
          })),
        };
      })
    );

    // Filter out customers with zero receivables
    const filteredData = dataWithLoans.filter(
      (c) => Number(c.total_receivable) > 0
    );

    // Calculate summary
    const summary = {
      total_customers: filteredData.length,
      total_loans: filteredData.reduce(
        (sum, c) => sum + Number(c.total_loans),
        0
      ),
      total_principal_receivable: filteredData
        .reduce((sum, c) => sum + Number(c.principal_receivable), 0)
        .toFixed(2),
      total_interest_receivable: filteredData
        .reduce((sum, c) => sum + Number(c.interest_receivable), 0)
        .toFixed(2),
      total_penalty_receivable: filteredData
        .reduce((sum, c) => sum + Number(c.penalty_receivable), 0)
        .toFixed(2),
      total_receivable: filteredData
        .reduce((sum, c) => sum + Number(c.total_receivable), 0)
        .toFixed(2),
      report_date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      filters: { from, to, asOf },
    };

    // Format data for Excel
    const excelData = filteredData.flatMap((customer) =>
      customer.loans.map((loan, index) => ({
        "Customer Name": index === 0 ? customer.customer_name : "",
        Phone: index === 0 ? customer.phone_number : "",
        "PN Number": loan.pn_number,
        "Date Granted": dayjs(loan.date_granted).format("MM/DD/YYYY"),
        "Principal Balance": Number(loan.principal_balance),
        "Interest Balance": Number(loan.interest_balance),
        "Penalty Balance": Number(loan.penalty_balance),
        "Total Receivable":
          Number(loan.principal_balance) +
          Number(loan.interest_balance) +
          Number(loan.penalty_balance),
      }))
    );

    res.json({
      success: true,
      data: excelData,
      summary,
    });
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({
      success: false,
      message: "Error exporting data",
      error: error.message,
    });
  }
});

module.exports = receivablesRouter;
