const express = require("express");
const paymentRouter = express.Router();
const builder = require("../builder");







paymentRouter.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;
  const search = req.query.search ? req.query.search : "";
  try {
    const [results, totalCount] = await Promise.all([
      builder
        .select({
          id: "loan_header_id",
          pn_number: "pn_number",
          customername: "customername",
          loancategory: "loancategory",
          loanfacility: "loanfacility",
          principal_amount: "principal_amount",
          total_interest: "total_interest",
          date_granted: "date_granted",
          TotalPrincipalPayment: "TotalPrincipalPayment",
          TotalInterestPayment: "TotalInterestPayment",
          TotalPayment: "TotalPayment",
          PrincipalBalance: "PrincipalBalance",
          InterestBalance: "InterestBalance",
          Balance: "Balance",
        })
        .from({ c: "new_payment" })
        .modify((queryBuilder) => {
          if (search.trim() !== "") {
            queryBuilder.where("customername", "like", `%${search.trim()}%`); // Filter by customer name
          }
        })
        .limit(pageSize)
        .offset(offset),
      builder
        .count("* as count")
        .from({ c: "new_payment" })
        .modify((queryBuilder) => {
          if (search.trim() !== "") {
            queryBuilder.where("customername", "like", `%${search.trim()}%`); // Filter by customer name
          }
        })
        .first(),
    ]);

    res.json({
      data: results,
      page: page + 1,
      totalCount: totalCount.count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

paymentRouter.post('/', (req, res) => {
  
})




paymentRouter.get("/customer", async (req, res) => {
  try {
    const customers = await builder
      .select({
        id: "customerid",
        fullname: builder.raw(
          "CONCAT_WS(', ', ??, CONCAT(??, ' ', SUBSTRING(??, 1, 1), '.'))",
          ["clname", "cfname", "cmname"]
        ),
      })
      .from({ c: "customertbl" });

    res.status(200).send(customers);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

paymentRouter.get("/read/:id", async (req, res) => {
  const id = req.params.id;
  const payment = await builder
    .select(
         'loan_detail_id'
		    ,'loan_header_id'
        ,'check_date'
        ,'monthly_principal'
        ,'monthly_interest'
        ,'monthly_amortization'
        ,'payment_type'
        ,'principal_payment'
        ,'interest_payment'
        ,'penalty_amount'
        ,'payment_amount'
        ,'Balance'
        ,'running_balance'
        ,'running_total'
    )
    .from("new_view_payment_detail") // 
    .where("loan_header_id", id)

    const updatedLoan = payment.map((item) => ({
      ...item,
      description: item.description || 'UNSETTLED',
    }));
  res.status(200).json(updatedLoan);
});

paymentRouter.get("/paymentDue/:id", async (req, res) => {
  const id = req.params.id;
  console.log("ID:", id);
  
  try {
    // Define the subquery for the minimum check_date
    const minCheckDateSubquery = builder('view_detail_payment')
      .min('check_date')
      .whereRaw('ifnull(payment_status_id, 0) != 1')
      .andWhere('loan_header_id', id)
      .as('min_check_date'); // This names the subquery result for clarity

    // Main query
    const payment = await builder
      .select(
        'loan_detail_id',
        builder.raw('monthly_principal - principal_payment as Principal_Due'),
        builder.raw('monthly_interest - interest_payment as Interest_Due'),
        builder.raw('accumulated_penalty - penalty_amount as Penalty_Due'),
        'customer_fullname',
        'pn_number',
        'check_date',
        'bank_name',
        'check_number'
      )
      .from("view_detail_payment")
      .whereRaw('ifnull(payment_status_id, 0) != ?', [1])
      // Use the subquery within the main query
      .andWhere('check_date', '=', builder.raw(`(${minCheckDateSubquery})`))
      .andWhere('loan_header_id', '=', id);

    console.log("Query Result:", payment); // Log the query result
    res.status(200).json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

paymentRouter.get('/bank', async (req, res)=>{
  const banks = await builder.select({id : 'bank_account_id', name : 'bank_name'}).from('bank_accounttbl')
  res.status(200).json(banks)
})

module.exports = paymentRouter;
