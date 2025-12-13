const express = require("express");
const paymentRouter = express.Router();
const builder = require("../builder");
const multer = require("multer");
const path = require("path");
const supabaseClient = require("../supabase/supabase");

const upload = multer();

paymentRouter.get("/search", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  const offset = (page - 1) * pageSize;
  // console.log('offset',   req.query.page)
  const input = req.query.search ? req.query.search : "";
  const category = req.query.category;
  // return console.log(input, cat)

  try {
    if (category === "name") {
      const [results, totalCount] = await Promise.all([
        builder
          .select("*")
          .from("new_payment")
          .where("customername", "like", `%${input.trim()}%`),
        // second
        builder
          .count("* as count")
          .from({ c: "new_payment" })
          .modify((queryBuilder) => {
            if (input.trim() !== "") {
              queryBuilder.where("customername", "like", `%${input.trim()}%`); // Filter by customer name
            }
          })
          .first(),
      ]);
      res.status(200).json({
        data: results,
        page: page + 1,
        totalCount: totalCount.count,
      });
      return;
    }

    const [results, totalCount] = await Promise.all([
      builder("view_loan_detail")
        .select(
          "new_payment.loan_header_id",
          "new_payment.pn_number",
          "customername",
          "loancategory",
          "loanfacility",
          "principal_amount",
          "total_interest",
          "date_granted",
          "TotalPrincipalPayment",
          "TotalInterestPayment",
          "TotalPenaltyPayment",
          "TotalPayment",
          "PrincipalBalance",
          "PenaltyBalance",
          "InterestBalance",
          "Balance"
        )
        .where("check_number", input.trim())
        .innerJoin(
          "new_payment",
          "view_loan_detail.loan_header_id",
          "new_payment.loan_header_id"
        ),
      // second
      builder
        .count("* as count")
        .from({ c: "new_payment" })
        .modify((queryBuilder) => {
          if (input.trim() !== "") {
            queryBuilder.where("customername", "like", `%${input.trim()}%`); // Filter by customer name
          }
        })
        .first(),
    ]);
    res.status(200).json({
      data: results,
      page: page + 1,
      totalCount: totalCount.count,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

const formatName = (item) => {
  const lastName = item["clname"].split(",");
  const firstName = item["cfname"] ? `, ${item["cfname"]}` : "";
  const middleName = item["cmname"] ? ` ${item["cmname"]}` : "";
  const extName = lastName[1] ? `${lastName[1]}` : "";

  return lastName + firstName + middleName + extName;
};

paymentRouter.get("/", async (req, res) => {
  const { date, search } = req.query;
  console.log(req.query);
  // return
  const fields = [
    "p_h.payment_history_id",
    "p.loan_detail_id",
    "payment_principal",
    "payment_interest",
    "payment_penalty",
    "p_h.payment_date",
    "p.payment_type",
    "payment_receipt",
    "p.bank",
    { check_number: "p.checkno" },
    "p.payment_amount",
    "p.remarks",
    "p.payment_type",
    builder.raw("p_h.check_date as check_date"),
    //-- loan header details
    "pn_number",
    // customer name
    // 'cfname',
    // 'cmname',
    // 'clname',
    { fullName: builder.raw(`CONCAT_WS(', ', clname, cfname, cmname)`) },
  ];
  // let payments;
  // if(search){
  const payments = await builder(builder.raw("payment_historytbl as p_h"))
    .select(fields)
    .innerJoin(
      builder.raw("paymenttbl as p"),
      "p.loan_detail_id",
      "p_h.loan_detail_id"
    )
    .innerJoin(
      builder.raw("loan_detail as l_d"),
      "p_h.loan_detail_id",
      "l_d.loan_detail_id"
    )
    .innerJoin(
      builder.raw("loan_headertbl as l_h"),
      "l_h.loan_header_id",
      "l_d.loan_header_id"
    )
    .innerJoin(
      builder.raw("customertbl as c"),
      "c.customerid",
      "l_h.customer_id"
    )
    .modify((sub) => {
      if (req.query["customer_name"])
        sub
          .whereILike("clname", `%${req.query["customer_name"].trim()}%`)
          .orWhereILike("cfname", `%${req.query["customer_name"].trim()}%`);
      else if (req.query["pn_number"])
        sub.whereILike("pn_number", `%${req.query["pn_number"].trim()}%`);
      else if (req.query["check_number"])
        sub.whereILike(
          builder.raw("p.checkno"),
          `%${req.query["check_number"].trim()}%`
        );
      else sub.havingBetween("p_h.payment_date", [date.from, date.to]);
    });

  const result = payments.map((payment) => {
    // if online or cash no check date
    if (payment.payment_type == "CASH" || payment.payment_type == "ONLINE") {
      return {
        ...payment,
        // fullName : formatName(payment),
        check_date: null,
      };
    }
    return payment;
    // {
    //   ...payment,
    //   fullName : formatName(payment)
    // }
  });
  // console.log(result)
  res.json({ data: result });
});

async function supabaseUpload(file) {
  if (file) {
    try {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const upload = await supabaseClient.storage
        .from("Attachment")
        .upload(
          `${uniqueSuffix}${path.extname(file.originalname)}`,
          file.buffer,
          {
            contentType: file.mimetype,
          }
        );
      return upload.data.fullPath;
    } catch (error) {
      console.log(error);
    }
  } else {
    return "";
  }
}

paymentRouter.post("/", upload.single("attachment"), async (req, res) => {
  const data = req.body;
  const { principal_payment, interest_payment, penalty_amount } = data;

  const bankJSON = JSON.parse(data.bank);
  const accountTitlesJSON = JSON.parse(data.account_titles);

  try {
    const fileName = await supabaseUpload(req.file);
    const processDate = new Date().toISOString().split("T")[0];

    await builder.transaction(async (t) => {
      let remaining_principal = Number(principal_payment) || 0;
      let remaining_interest = Number(interest_payment) || 0;
      let remaining_penalty = Number(penalty_amount) || 0;

      // Get all unpaid/partially paid loan details for this loan
      const loanDetails = await t("loan_detail as ld")
        .leftJoin("paymenttbl as p", "ld.loan_detail_id", "p.loan_detail_id")
        .where("ld.loan_header_id", data.loan_header_id)
        .whereRaw("(p.payment_status_id IS NULL OR p.payment_status_id != 1)")
        .select(
          "ld.loan_detail_id",
          "ld.monthly_principal",
          "ld.monthly_interest",
          "ld.accumulated_penalty",
          t.raw("COALESCE(p.principal_payment, 0) as principal_paid"),
          t.raw("COALESCE(p.interest_payment, 0) as interest_paid"),
          t.raw("COALESCE(p.penalty_amount, 0) as penalty_paid")
        )
        .orderBy("ld.due_date", "asc");

      const payment_details = [];
      let total_overpayment = 0;

      // Process each installment
      for (const detail of loanDetails) {
        if (
          remaining_principal <= 0 &&
          remaining_interest <= 0 &&
          remaining_penalty <= 0
        ) {
          break;
        }

        // Calculate what's still due (force number conversion)
        const principal_due =
          Number(detail.monthly_principal) - Number(detail.principal_paid);
        const interest_due =
          Number(detail.monthly_interest) - Number(detail.interest_paid);
        const penalty_due =
          Number(detail.accumulated_penalty) - Number(detail.penalty_paid);

        // Apply payments
        const penalty_to_apply = Math.min(
          Number(remaining_penalty),
          Number(penalty_due)
        );
        remaining_penalty =
          Number(remaining_penalty) - Number(penalty_to_apply);

        const interest_to_apply = Math.min(
          Number(remaining_interest),
          Number(interest_due)
        );
        remaining_interest =
          Number(remaining_interest) - Number(interest_to_apply);

        const principal_to_apply = Math.min(
          Number(remaining_principal),
          Number(principal_due)
        );
        remaining_principal =
          Number(remaining_principal) - Number(principal_to_apply);

        // Determine status
        const new_principal_total =
          Number(detail.principal_paid) + Number(principal_to_apply);
        const new_interest_total =
          Number(detail.interest_paid) + Number(interest_to_apply);
        const is_paid =
          new_principal_total >= detail.monthly_principal - 0.01 &&
          new_interest_total >= detail.monthly_interest - 0.01;

        const status_id = is_paid ? 1 : 4; // 1=PAID, 4=PARTIALLY PAID

        // Update or insert into paymenttbl
        const existingPayment = await t("paymenttbl")
          .where("loan_detail_id", detail.loan_detail_id)
          .first();

        if (existingPayment) {
          const new_penalty_total =
            Number(detail.penalty_paid) + Number(penalty_to_apply);
          const total_payment =
            Number(new_principal_total) +
            Number(new_interest_total) +
            Number(new_penalty_total);

          await t("paymenttbl")
            .where("loan_detail_id", detail.loan_detail_id)
            .update({
              principal_payment: Number(new_principal_total).toFixed(2),
              interest_payment: Number(new_interest_total).toFixed(2),
              penalty_amount: Number(new_penalty_total).toFixed(2),
              payment_amount: Number(total_payment).toFixed(2),
              payment_status_id: status_id,
              payment_type: data.payment_type,
              receiptno: data.pr_number,
              OR_no: data.or_number || "",
              bank: bankJSON.name,
              checkno: data.check_number || "",
              remarks: data.remarks || "",
            });
        } else {
          const total_payment =
            Number(principal_to_apply) +
            Number(interest_to_apply) +
            Number(penalty_to_apply);

          await t("paymenttbl").insert({
            loan_detail_id: detail.loan_detail_id,
            principal_payment: Number(principal_to_apply).toFixed(2),
            interest_payment: Number(interest_to_apply).toFixed(2),
            penalty_amount: Number(penalty_to_apply).toFixed(2),
            payment_amount: Number(total_payment).toFixed(2),
            payment_status_id: status_id,
            payment_type: data.payment_type,
            receiptno: data.pr_number,
            OR_no: data.or_number || "",
            bank: bankJSON.name,
            checkno: data.check_number || "",
            remarks: data.remarks || "",
          });
        }

        // Insert into payment_historytbl
        if (
          principal_to_apply > 0 ||
          interest_to_apply > 0 ||
          penalty_to_apply > 0
        ) {
          await t("payment_historytbl").insert({
            loan_detail_id: detail.loan_detail_id,
            payment_principal: principal_to_apply,
            payment_interest: interest_to_apply,
            payment_penalty: penalty_to_apply,
            payment_date: processDate,
            payment_type: data.payment_type,
            payment_receipt: data.pr_number,
            remarks: data.remarks || "",
            bank: bankJSON.name,
            check_no: data.check_number || "",
            check_date: data.check_date || null,
            attachment: fileName,
          });

          payment_details.push({
            loan_detail_id: detail.loan_detail_id,
            principal: principal_to_apply,
            interest: interest_to_apply,
            penalty: penalty_to_apply,
            status: is_paid ? "PAID" : "PARTIAL",
          });
        }
      }

      // Calculate overpayment
      total_overpayment =
        remaining_principal + remaining_interest + remaining_penalty;

      // Insert account titles if provided
      if (accountTitlesJSON.length > 0 && payment_details.length > 0) {
        const last_payment_history = await t("payment_historytbl")
          .where("loan_detail_id", payment_details[0].loan_detail_id)
          .orderBy("payment_history_id", "desc")
          .first();

        const formatAccountTitles = accountTitlesJSON.map((v) => ({
          account_title_id: v.category.id,
          credit: Number(v.credit),
          debit: Number(v.debit),
          payment_id: last_payment_history.payment_history_id,
        }));

        await t("payment_voucher").insert(formatAccountTitles);
      }

      // Handle cash denominations
      if (data.payment_type.toLowerCase() === "cash" && data.cash_count) {
        const billCount = data.cash_count.map((v) => ({
          loan_header_id: data.loan_header_id,
          loan_detail_id: payment_details[0]?.loan_detail_id || null,
          bill_type: String(v.denomination),
          bill_count: v.count,
        }));
        await t("bill_counttbl").insert(billCount);
      }

      // Get loan info for response
      const loanInfo = await t(t.raw("loan_headertbl as l_h"))
        .where("loan_header_id", data.loan_header_id)
        .select("pn_number", {
          fullName: builder.raw(`CONCAT_WS(', ', clname, cfname, cmname)`),
        })
        .innerJoin(
          builder.raw("customertbl as c"),
          "c.customerid",
          "l_h.customer_id"
        )
        .first();

      // Get last payment history ID
      const lastPaymentHistory = await t("payment_historytbl")
        .where("loan_detail_id", payment_details[0]?.loan_detail_id)
        .orderBy("payment_history_id", "desc")
        .first();

      res.status(200).json({
        payment_history_id: lastPaymentHistory?.payment_history_id,
        success: true,
        payment_date: processDate,
        payment_receipt: data.pr_number,
        fullName: loanInfo.fullName,
        pn_number: loanInfo.pn_number,
        payment_type: data.payment_type,
        bank: bankJSON.name,
        check_number: data.check_number,
        check_date: data.check_date ? data.check_date : null,
        payment_principal: Number(data.principal_payment) || 0,
        payment_interest: Number(data.interest_payment) || 0,
        payment_penalty: Number(data.penalty_amount) || 0,
        payment_amount:
          (Number(data.principal_payment) || 0) +
          (Number(data.interest_payment) || 0) +
          (Number(data.penalty_amount) || 0),
        total_applied:
          (Number(data.principal_payment) || 0) +
          (Number(data.interest_payment) || 0) +
          (Number(data.penalty_amount) || 0) -
          total_overpayment,
        overpayment: total_overpayment,
        overpayment_breakdown: {
          principal: remaining_principal,
          interest: remaining_interest,
          penalty: remaining_penalty,
        },
        details: payment_details,
        remarks: data.remarks,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

paymentRouter.get("/deductions", async (req, res) => {
  const { date, search } = req.query;
  const fields = [
    "d_h.loan_deduction_id",
    "d_h.loan_header_id",
    "amount",
    "pr_number",
    "d_h.process_date",
    "deduction_type",
    // 'l_h.customer_id',
    "l_h.pn_number",
    "cfname",
    "clname",
    "cmname",
  ];

  const deductions = await builder(
    builder.raw("loan_deduction_historytbl as d_h")
  )
    .select(fields)
    .innerJoin(
      builder.raw("loan_deductiontbl as l_d"),
      "d_h.loan_deduction_id",
      "l_d.loan_deduction_id"
    )
    .innerJoin(
      builder.raw("loan_headertbl as l_h"),
      "l_h.loan_header_id",
      "d_h.loan_header_id"
    )
    .innerJoin(
      builder.raw("customertbl as c"),
      "c.customerid",
      "l_h.customer_id"
    )
    .modify((sub) => {
      if (req.query["customer_name"])
        sub
          .whereILike("clname", `%${req.query["customer_name"]}%`)
          .orWhereILike("cfname", `%${req.query["customer_name"]}%`);
      else if (req.query["pn_number"])
        sub.whereILike("pn_number", `%${req.query["pn_number"]}%`);
      else if (req.query["pr_number"])
        sub.whereILike("pr_number", `%${req.query["pr_number"]}%`);
      else sub.havingBetween("process_date", [date.from, date.to]);
    })
    .where("isCash", true);

  const mapDeduction = new Map();

  for (const d of deductions) {
    const regType = d.deduction_type.replace(/[^a-zA-Z ]/g, "");

    const type = regType.toLowerCase().split(" ").join("_");

    if (!mapDeduction.has(d.loan_header_id))
      mapDeduction.set(d.loan_header_id, {
        id: d.loan_header_id,
        pr_number: d.pr_number,
        [type]: d.amount,
        full_name: formatName(d),
        pn_number: d.pn_number,
        process_date: d.process_date,
      });
    else
      mapDeduction.set(d.loan_header_id, {
        ...mapDeduction.get(d.loan_header_id),
        [type]: d.amount,
      });
  }
  res.send([...mapDeduction.values()]);
});

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

  try {
    const schedule = await builder("view_amortization_schedule")
      .where("loan_header_id", id)
      .orderBy("installment_number", "asc");

    res.status(200).json(schedule);
  } catch (error) {
    console.error("Error fetching amortization schedule:", error);
    res.status(500).json({ error: error.message });
  }
});

paymentRouter.get("/paymentDue/:id", async (req, res) => {
  const id = req.params.id;
  // console.log("ID:", id);

  try {
    // Define the subquery for the minimum check_date
    // TODO: add due_date payment
    const minCheckDateSubquery = builder("view_detail_payment")
      .min("due_date")
      .whereRaw("ifnull(payment_status_id, 0) != 1")
      .andWhere("loan_header_id", id)
      .as("min_check_date"); // This names the subquery result for clarity

    // Main query
    const payment = await builder
      .select(
        "loan_detail_id",
        builder.raw("monthly_principal - principal_payment as Principal_Due"),
        builder.raw("monthly_interest - interest_payment as Interest_Due"),
        builder.raw("accumulated_penalty - penalty_amount as Penalty_Due"),
        "customer_fullname",
        "pn_number",
        "due_date",
        "bank_name",
        "check_number"
      )
      .from("view_detail_payment")
      .whereRaw("ifnull(payment_status_id, 0) != 1")
      // Use the subquery within the main query
      .andWhere("due_date", "=", builder.raw(`(${minCheckDateSubquery})`))
      .andWhere("loan_header_id", "=", id);

    // console.log("Query Result:", payment); // Log the query result
    res.status(200).json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

paymentRouter.get("/bank", async (req, res) => {
  const banks = await builder
    .select({
      id: "bank_account_id",
      name: builder.raw(`IFNULL(bank_branch, bank_name)`),
    })
    .from("bank_accounttbl")
    .where("is_owner_bank", false);
  res.status(200).json(banks);
});

module.exports = paymentRouter;
