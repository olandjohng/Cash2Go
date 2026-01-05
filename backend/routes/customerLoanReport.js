const express = require("express");
const builder = require("../builder");
const customerLoanReportRouter = express.Router();

// GET: Search customers by name and get their loans summary
customerLoanReportRouter.get("/search", async (req, res) => {
  try {
    const { searchTerm } = req.query;

    if (!searchTerm || searchTerm.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search term is required",
      });
    }

    // Search customers and their loans
    const loans = await builder
      .select("*")
      .from("vw_customer_loans_summary")
      .where(function () {
        this.where("cfname", "like", `%${searchTerm}%`)
          .orWhere("cmname", "like", `%${searchTerm}%`)
          .orWhere("clname", "like", `%${searchTerm}%`)
          .orWhereRaw(
            'CONCAT(cfname, " ", COALESCE(cmname, ""), " ", clname) like ?',
            [`%${searchTerm}%`]
          );
      })
      .orderBy("date_granted", "desc");

    // Group by customer
    const groupedByCustomer = loans.reduce((acc, loan) => {
      const customerId = loan.customer_id;

      if (!acc[customerId]) {
        acc[customerId] = {
          customer_id: customerId,
          customer_name: loan.customer_name,
          address: loan.address,
          contactno: loan.contactno,
          loans: [],
        };
      }

      acc[customerId].loans.push({
        loan_header_id: loan.loan_header_id,
        pn_number: loan.pn_number,
        transaction_date: loan.transaction_date,
        date_granted: loan.date_granted,
        principal_amount: Number(loan.principal_amount),
        interest_rate: Number(loan.interest_rate),
        total_interest: Number(loan.total_interest),
        total_amount: Number(loan.total_amount),
        term: loan.term,
        term_type: loan.term_type,
        status_code: loan.status_code,
        loan_category: loan.loan_category,
        loan_facility: loan.loan_facility,
        total_principal_paid: Number(loan.total_principal_paid),
        total_interest_paid: Number(loan.total_interest_paid),
        total_penalty_paid: Number(loan.total_penalty_paid),
        principal_balance: Number(loan.principal_balance),
        interest_balance: Number(loan.interest_balance),
        // Determine if loan is ongoing or done
        loan_status:
          Number(loan.principal_balance) <= 0 ? "COMPLETED" : "ONGOING",
      });

      return acc;
    }, {});

    const customers = Object.values(groupedByCustomer);

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    console.error("Error searching customer loans:", error);
    res.status(500).json({
      success: false,
      message: "Error searching customer loans",
      error: error.message,
    });
  }
});

// GET: Get detailed loan information with payment schedules
customerLoanReportRouter.get(
  "/loan-details/:loanHeaderId",
  async (req, res) => {
    try {
      const { loanHeaderId } = req.params;

      // Get loan header information
      const loanHeader = await builder
        .select("*")
        .from("vw_customer_loans_summary")
        .where("loan_header_id", loanHeaderId)
        .first();

      if (!loanHeader) {
        return res.status(404).json({
          success: false,
          message: "Loan not found",
        });
      }

      // Get loan details with payments
      const loanDetails = await builder
        .select("*")
        .from("vw_loan_details_with_payments")
        .where("loan_header_id", loanHeaderId)
        .orderBy("due_date", "asc");

      // Get all payment history for this loan
      const paymentHistory = await builder
        .select("ph.*", "ld.due_date", "ld.monthly_amortization")
        .from("payment_historytbl as ph")
        .join("loan_detail as ld", "ph.loan_detail_id", "ld.loan_detail_id")
        .where("ld.loan_header_id", loanHeaderId)
        .orderBy("ph.payment_date", "desc");

      // Format the response
      const formattedDetails = loanDetails.map((detail) => ({
        loan_detail_id: detail.loan_detail_id,
        due_date: detail.due_date,
        monthly_amortization: Number(detail.monthly_amortization),
        monthly_interest: Number(detail.monthly_interest),
        monthly_principal: Number(detail.monthly_principal),
        accumulated_penalty: Number(detail.accumulated_penalty),
        paid_principal: Number(detail.paid_principal),
        paid_interest: Number(detail.paid_interest),
        paid_penalty: Number(detail.paid_penalty),
        principal_balance: Number(detail.principal_balance),
        interest_balance: Number(detail.interest_balance),
        payment_status: detail.payment_status,
        check_numbers: detail.check_numbers || "N/A",
      }));

      const formattedPayments = paymentHistory.map((payment) => ({
        payment_history_id: payment.payment_history_id,
        loan_detail_id: payment.loan_detail_id,
        payment_date: payment.payment_date,
        payment_principal: Number(payment.payment_principal),
        payment_interest: Number(payment.payment_interest),
        payment_penalty: Number(payment.payment_penalty),
        payment_type: payment.payment_type,
        payment_receipt: payment.payment_receipt,
        bank: payment.bank,
        check_no: payment.check_no,
        check_date: payment.check_date,
        remarks: payment.remarks,
        due_date: payment.due_date,
      }));

      res.status(200).json({
        success: true,
        data: {
          loan_header: {
            loan_header_id: loanHeader.loan_header_id,
            pn_number: loanHeader.pn_number,
            customer_name: loanHeader.customer_name,
            address: loanHeader.address,
            contactno: loanHeader.contactno,
            transaction_date: loanHeader.transaction_date,
            date_granted: loanHeader.date_granted,
            principal_amount: Number(loanHeader.principal_amount),
            interest_rate: Number(loanHeader.interest_rate),
            total_interest: Number(loanHeader.total_interest),
            total_amount: Number(loanHeader.total_amount),
            term: loanHeader.term,
            term_type: loanHeader.term_type,
            status_code: loanHeader.status_code,
            loan_category: loanHeader.loan_category,
            loan_facility: loanHeader.loan_facility,
            total_principal_paid: Number(loanHeader.total_principal_paid),
            total_interest_paid: Number(loanHeader.total_interest_paid),
            total_penalty_paid: Number(loanHeader.total_penalty_paid),
            principal_balance: Number(loanHeader.principal_balance),
            interest_balance: Number(loanHeader.interest_balance),
          },
          loan_details: formattedDetails,
          payment_history: formattedPayments,
        },
      });
    } catch (error) {
      console.error("Error fetching loan details:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching loan details",
        error: error.message,
      });
    }
  }
);

// GET: Get all customers with at least one loan (for dropdown/autocomplete)
customerLoanReportRouter.get("/customers", async (req, res) => {
  try {
    const customers = await builder
      .select("customer_id", "customer_name", "address", "contactno")
      .from("vw_customer_loans_summary")
      .groupBy("customer_id", "customer_name", "address", "contactno")
      .orderBy("customer_name", "asc");

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching customers",
      error: error.message,
    });
  }
});

module.exports = customerLoanReportRouter;
