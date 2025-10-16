import * as yup from "yup";
import {
  AddOutlined,
  CheckCircleOutlineRounded,
  DeleteOutline,
  RemoveCircleOutline,
  AttachFile,
} from "@mui/icons-material";
import { FormStep } from "../../../components/MultiStepForm1";
import {
  Autocomplete,
  Grid,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Box,
  styled,
  Typography,
  TableContainer,
  Paper,
} from "@mui/material";
import { createContext, useEffect, useRef, useState } from "react";
import MultiStepForm1 from "../../../components/MultiStepForm1";
import * as ejs from "ejs";
import { Bounce, toast } from "react-toastify";
import voucherHTMLTemplate from "../../../assets/voucher.html?raw";
import c2gLogo from "../../../assets/c2g_logo_nb.png";
import dayjs from "dayjs";
import { grey } from "@mui/material/colors";
import LoanRequirementsForm from "./LoanRequirementsForm";
import LoanDetailsForm from "./LoanDetailsForm";
import DeductionDetailsForm from "./DeductionDetailsForm";
import SummaryForm from "./SummaryForm";
import VoucherForm from "./VoucherForm";
import VoucherPrint from "./VoucherPrint";

export const LoanFormContext = createContext(null);

export const loanRequirementSchema = yup.object({
  voucher_number: yup.string().required("voucher_number is required"),
  check_date: yup.date().required(),
  customer_name: yup.string().required(),
  check_number: yup.string().required(),
  bank_name: yup.string().required(),
  check_issued_name: yup.string().required(),
  collateral: yup.string().required(),
  loan_category: yup.string().required(),
  loan_facility: yup.string().required("loan facilities is required"),
});

export const loanDetailsSchema = yup.object({
  principal_amount: yup.number().required().moreThan(0),
  interest_rate: yup.number().required().moreThan(0),
  loan_details: yup.array(
    yup.object({
      dueDate: yup.date().required(),
      bank_name: yup.string().required(),
      interest: yup.number().positive().moreThan(0),
      amortization: yup.number().positive().moreThan(0),
    })
  ),
});

export const deductionSchema = yup.object({
  deduction: yup.array(
    yup.object({
      amount: yup.number().positive().moreThan(0),
    })
  ),
});

export const voucherSchema = yup.object({
  prepared_by: yup.string().required(),
  checked_by: yup.string().required(),
  approved_by: yup.string().required(),
  voucher: yup.array(
    yup.object({
      name: yup.string().required(),
    })
  ),
});

export const numberFormat = Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function ComboBox(props) {
  const { inputChange, nameField, idfield, err, label, ...otherProps } = props; // Destructure to separate custom props
  const comboRef = useRef();

  return (
    <Autocomplete
      {...otherProps} // Only spread valid Autocomplete props
      fullWidth
      ref={comboRef}
      onInputChange={(e, v) => {
        if (e && e.type === "click") {
          inputChange(
            { name: comboRef.current.getAttribute("name"), id: idfield },
            { id: e.target.id, value: v }
          );
        }
      }}
      variant="standard"
      name={nameField}
      renderInput={(params) => (
        <TextField
          {...params}
          error={err && Boolean(err[nameField])}
          label={label}
        />
      )}
    />
  );
}

export function TextInput(props) {
  const { name, change, error } = props;
  return (
    <TextField
      fullWidth
      variant="outlined"
      {...props}
      onChange={(e) => change(e, name)}
      error={error && Boolean(error[name])}
    />
  );
}

const CustomerComboBox = ({ value, setter }) => {
  const ref = useRef();
  const [customers, setCustomers] = useState([]);
  let searchTimeOut = null;

  const fetchData = async (value) => {
    try {
      const request = await fetch(`/api/customers/search?name=${value}`);
      return await request.json();
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = async (event, value) => {
    if (event && event.type === "change") {
      if (value.length >= 2) {
        clearTimeout(searchTimeOut);
        searchTimeOut = setTimeout(() => {
          const req = async () => {
            try {
              const customerData = await fetchData(value);
              setCustomers(customerData);
            } catch (error) {
              console.log(error);
            }
          };
          req();
        }, 1000);
      }
    }

    if (event && event.type === "click") {
      setter((old) => {
        return {
          ...old,
          customer_name: value,
          customer_id: Number(event.target.id),
        };
      });
    }
  };

  return (
    <Autocomplete
      fullWidth
      options={customers}
      ref={ref}
      onInputChange={handleInputChange}
      value={value}
      getOptionLabel={(option) => option.name || "" || option}
      renderInput={(params) => <TextField {...params} label="Borrower Name" />}
      renderOption={(props, option) => (
        <Box {...props} component="li" key={option.id} id={option.id}>
          {option.name}
        </Box>
      )}
    />
  );
};

function LoanForm1({
  loanInitialValue,
  collaterals,
  facilities,
  banks,
  categories,
  deductions,
  accountTitle,
  setModalOpen,
  dispatcher,
  isEdit = false,
  loanId = null,
}) {
  const [formValue, setFormValue] = useState(loanInitialValue);
  const [rows, setRows] = useState([]);
  const [validationError, setValidationError] = useState(null);
  const [deductionsData, setDeductionsData] = useState([]);
  const [voucher, setVoucher] = useState(formValue.voucher);
  const [voucherWindow, setVoucherWindow] = useState(null);
  const [employees, setEmployees] = useState([]);
  const totalCredit = voucher.reduce((acc, cur) => acc + Number(cur.credit), 0);
  const totalDebit = voucher.reduce((acc, cur) => acc + Number(cur.debit), 0);

  const handleSubmit = async () => {
    console.log("=== handleSubmit Debug - START ===");
    console.log("Sample bank object:", banks[0]);
    console.log("Original formValue:", formValue);
    console.log("Original formValue.loan_details:", formValue.loan_details);

    let data;

    if (formValue.check_date_2) {
      data = {
        ...formValue,
        check_date: dayjs(formValue.check_date).format(),
        date_granted: formValue.date_granted.format(),
        transaction_date: dayjs(formValue.transaction_date).format(),
        check_date_2: formValue.check_date_2.format(),
      };
    } else {
      data = {
        ...formValue,
        check_date: dayjs(formValue.check_date).format(),
        date_granted: formValue.date_granted.format(),
        transaction_date: dayjs(formValue.transaction_date).format(),
      };
    }

    // Debug what's in data
    console.log("data.bank_name:", data.bank_name);
    console.log("data.bank_account_id:", data.bank_account_id);
    console.log("data object keys:", Object.keys(data));

    // ADD THIS: Find and set the main bank_account_id from bank_name
    if (data.bank_name) {
      console.log("Looking for bank with name:", data.bank_name);
      console.log("All banks:", banks);

      // Try to find by bank_branch first, then by name
      const mainBank = banks.find(
        (b) => b.bank_branch === data.bank_name || b.name === data.bank_name
      );

      if (mainBank) {
        data.bank_account_id = mainBank.id;
        console.log(
          "Set main bank_account_id:",
          mainBank.id,
          "for bank:",
          data.bank_name
        );
      } else {
        console.error("Could not find bank for:", data.bank_name);
        console.error(
          "Available banks:",
          banks.map((b) => ({ id: b.id, name: b.name, branch: b.bank_branch }))
        );
      }
    } else {
      console.log("NO BANK_NAME FOUND! data.bank_name is:", data.bank_name);
    }

    // ADD THIS: Find and set the main bank_account_id from bank_name
    if (data.bank_name) {
      const mainBank = banks.find(
        (b) =>
          b.bank_branch === data.bank_name || b.bank_name === data.bank_name
      );
      if (mainBank) {
        data.bank_account_id = mainBank.id;
        console.log(
          "Set main bank_account_id:",
          mainBank.id,
          "for bank:",
          data.bank_name
        );
      } else {
        console.error("Could not find bank for:", data.bank_name);
      }
    }

    const mapLoanDetails = data.loan_details.map((v) => {
      let item = {
        ...v,
        dueDate: v.dueDate.format ? v.dueDate.format() : v.dueDate,
      };

      // Add logging here to see what's happening during mapping
      console.log("Processing loan detail item:");
      console.log(
        "  item.bank_name:",
        item.bank_name,
        "type:",
        typeof item.bank_name
      );

      // bank_name now contains the bank ID (number), use it directly
      if (typeof item.bank_name === "number") {
        item = { ...item, bank_account_id: item.bank_name };
        console.log("  Set bank_account_id from number:", item.bank_account_id);
      } else if (typeof item.bank_name === "string") {
        console.log("  bank_name is string, searching for match...");
        // Fallback for old data format (string bank_branch)
        for (const b of banks) {
          if (item.bank_name === b.bank_branch) {
            item = { ...item, bank_account_id: b.id };
            console.log("  Found match! Set bank_account_id:", b.id);
            break;
          }
        }
      }

      if (item.check_date)
        return {
          ...item,
          check_date: item.check_date.format
            ? item.check_date.format()
            : item.check_date,
        };

      return { ...item };
    });

    data = { ...data, loan_details: mapLoanDetails };

    // Add this log right before the fetch
    console.log("=== handleSubmit Debug - BEFORE FETCH ===");
    console.log("Mapped loan_details:", mapLoanDetails);
    console.log("Final data being sent:", JSON.stringify(data, null, 2));

    // Determine URL and method based on edit mode
    const url = isEdit ? `/api/loans/${loanId}` : "/api/loans";
    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save loan");
      }

      const res = await response.json();

      setModalOpen(false);

      // Dispatch appropriate action based on mode
      if (isEdit) {
        dispatcher({ type: "UPDATE", loan: res });
        toast.success("Loan Updated Successfully!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
        });
      } else {
        dispatcher({ type: "ADD", loans: res });
        toast.success("Loan Saved Successfully!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
        });
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  const handleLoanRequirement = async () => {
    try {
      loanRequirementSchema.validateSync(formValue, { abortEarly: false });
    } catch (err) {
      console.dir(err);
      const errors = err.inner;
      const error = errors.reduce((acc, cur) => {
        return {
          ...acc,
          [cur.path]: true,
        };
      }, {});
      setValidationError(error);
    }
  };

  useEffect(() => {
    // Always sync rows to formValue.loan_details
    setFormValue((prev) => ({ ...prev, loan_details: [...rows] }));
  }, [rows]);

  useEffect(() => {
    const getEmployees = async () => {
      try {
        const request = await fetch("/api/employee");
        const responseJSON = await request.json();
        setEmployees(responseJSON);
      } catch (error) {
        console.log(error);
      }
    };
    getEmployees();
    // toast.error('Something went wrong!', {
    //   position: "top-right",
    //   autoClose: 3000,
    //   hideProgressBar: false,
    //   closeOnClick: true,
    //   pauseOnHover: true,
    //   draggable: true,
    //   progress: undefined,
    //   theme: "colored"
    // })
  }, []);

  // For edit mode initialization
  // Update this useEffect for edit mode initialization
  // Third useEffect - handles edit mode initialization
  useEffect(() => {
    if (
      isEdit &&
      loanInitialValue.loan_details &&
      loanInitialValue.loan_details.length > 0
    ) {
      const formattedDetails = loanInitialValue.loan_details.map(
        (detail, index) => ({
          id: index + 1,
          dueDate: dayjs(detail.dueDate || detail.due_date),
          checkNumber: detail.checkNumber || detail.check_number,
          bank_account_id: detail.bank_account_id,
          bank_name:
            banks.find((b) => b.id === detail.bank_account_id)?.bank_branch ||
            "",
          amortization: detail.amortization || detail.monthly_amortization || 0,
          interest: detail.interest || detail.monthly_interest,
          principal: detail.principal || detail.monthly_principal,
          net_proceeds: detail.net_proceeds || 0,
          check_date: detail.check_date ? dayjs(detail.check_date) : null,
        })
      );

      setRows(formattedDetails);

      // Format deductions for DeductionDetailsForm
      const formattedDeductions =
        loanInitialValue.deduction?.map((d) => ({
          id: d.id,
          label: d.label || d.name,
          name: (d.label || d.name).toLowerCase().split(" ").join("_"),
          amount: d.amount,
        })) || [];

      setDeductionsData(formattedDeductions);

      setFormValue((prev) => ({
        ...prev,
        ...loanInitialValue,
        loan_details: formattedDetails,
        deduction: formattedDeductions,
        date_granted: dayjs(loanInitialValue.date_granted),
        check_date: dayjs(loanInitialValue.check_date),
        check_date_2: loanInitialValue.check_date_2
          ? dayjs(loanInitialValue.check_date_2)
          : null,
        transaction_date: loanInitialValue.transaction_date,
        isCash: loanInitialValue.isCash || { value: false, pr_number: "" }, // Ensure isCash exists
        remarks: loanInitialValue.remarks || "",
      }));
    }
  }, [isEdit, loanInitialValue, banks]);
  // useEffect(() => {
  //   if (isEdit && loanInitialValue.loan_details) {
  //     // Convert date strings to dayjs objects for edit mode
  //     const formattedDetails = loanInitialValue.loan_details.map((detail) => ({
  //       ...detail,
  //       dueDate: dayjs(detail.dueDate),
  //       check_date: detail.check_date ? dayjs(detail.check_date) : null,
  //     }));
  //     setRows(formattedDetails);
  //   }
  // }, [isEdit, loanInitialValue]);

  const handleLoanDetails = async () => {
    console.log(210, formValue);
    try {
      loanDetailsSchema.validateSync(formValue, { abortEarly: false });
    } catch (err) {
      const errors = err.inner;

      const error = errors.reduce((acc, cur) => {
        const path = cur.path;
        if (!path.includes(".")) {
          return { ...acc, [path]: true };
        }
        return { ...acc };
      }, {});
      console.dir(err);
      setValidationError(error);
    }
  };

  const handlNetProceed = () => {
    let total = formValue.principal_amount;
    if (formValue.deduction.length > 0)
      total = formValue.deduction.reduce(
        (acc, curr) => acc - curr.amount,
        formValue.principal_amount
      );

    return total;
  };

  console.log("=== LoanForm1 Debug ===");
  console.log("formValue:", formValue);
  console.log("deductionsData:", deductionsData);
  console.log("isEdit:", isEdit);
  console.log("loanInitialValue:", loanInitialValue);

  return (
    <LoanFormContext.Provider
      value={{ formValue, setFormValue, validationError, setValidationError }}
    >
      <div style={{ width: 900, color: grey[600] }}>
        {isEdit && (
          <Typography variant="h6" sx={{ mb: 2, color: "secondary.main" }}>
            Editing Loan ID: {loanId}
          </Typography>
        )}
        <MultiStepForm1 initialFormValues={formValue} onSubmit={handleSubmit}>
          <FormStep
            stepName="Loan Requirements"
            onSubmit={handleLoanRequirement}
            values={formValue}
            schema={loanRequirementSchema}
          >
            <LoanRequirementsForm
              banks={banks}
              collaterals={collaterals}
              categories={categories}
              facilities={facilities}
            />
          </FormStep>
          <FormStep
            stepName="Loan Details"
            onSubmit={handleLoanDetails}
            schema={loanDetailsSchema}
          >
            <LoanDetailsForm banks={banks} rows={rows} setRows={setRows} />
          </FormStep>
          <FormStep
            stepName="Deduction Details"
            schema={deductionSchema}
            onSubmit={() => {
              try {
                deductionSchema.validateSync(formValue, { abortEarly: false });
              } catch (err) {
                const errors = err.inner;
                const error = errors.reduce((acc, cur) => {
                  const data = cur.path.split(".");
                  const index = data[0].charAt(data[0].length - 2);
                  return { ...acc, [deductionsData[index].name]: true };
                }, {});
                setValidationError(error);
              }
            }}
          >
            <DeductionDetailsForm
              deductions={deductions}
              deductionsData={deductionsData}
              setDeductionsData={setDeductionsData}
            />
          </FormStep>
          <FormStep
            stepName="Summary"
            onSubmit={() => {}}
            schema={yup.object({})}
          >
            <SummaryForm netProceeds={handlNetProceed} />
          </FormStep>
          <FormStep
            stepName="Voucher Details"
            schema={voucherSchema}
            onSubmit={() => {
              const nameFormat = voucher.map((v) => {
                const names = v.name.split("-");
                const format = names.filter((_, i) => i !== 0).join("-");
                return { ...v, title: format.trim() };
              });
              setVoucher(nameFormat);
              setFormValue({ ...formValue, voucher: nameFormat });
            }}
          >
            <VoucherForm
              accountTitle={accountTitle}
              voucher={voucher}
              setVoucher={setVoucher}
            />
          </FormStep>
          <FormStep
            stepName="Print Voucher"
            schema={yup.object({})}
            onSubmit={() => {}}
          >
            <VoucherPrint
              onClick={() => {
                const templateData = {
                  borrower: formValue.customer_name,
                  date: formValue.date_granted.format("MM-DD-YYYY"),
                  details: formValue.voucher,
                  voucherNumber: formValue.voucher_number,
                  logo: c2gLogo,
                  has_second_check: formValue.has_second_check,
                  check_details_2: `${formValue.bank_name_2}-${formValue.check_number_2}`,
                  check_date_2: formValue.has_second_check
                    ? dayjs(formValue.check_date_2).format("MM-DD-YYYY")
                    : null,
                  prepared_by: formValue.prepared_by,
                  approved_by: formValue.approved_by,
                  checked_by: formValue.checked_by,
                  check_details: `${formValue.bank_name}-${formValue.check_number}`,
                  check_date: dayjs(formValue.check_date).format("MM-DD-YYYY"),
                  remarks: formValue.remarks,
                };

                const voucherHTML = ejs.render(
                  voucherHTMLTemplate,
                  templateData
                );

                if (voucherWindow) {
                  voucherWindow.close();
                  const voucherTab = window.open("voucher", "Print Voucher");
                  setVoucherWindow(voucherTab);
                  if (voucherHTML) {
                    voucherTab.document.write(voucherHTML);
                  }
                } else {
                  const voucherTab = window.open("voucher", "Print Voucher");
                  setVoucherWindow(voucherTab);
                  if (voucherHTML) {
                    voucherTab.document.write(voucherHTML);
                  }
                }
              }}
            />
          </FormStep>
        </MultiStepForm1>
      </div>
    </LoanFormContext.Provider>
  );
}

export function PreviewLabel({ label, value }) {
  return (
    <Box>
      <StyledLabel sx={{ color: "ghostwhite", textAlign: 'left' }}>{value}</StyledLabel>
      <Typography
        style={{
          letterSpacing: "1px",
          textAlign: "left",
          fontSize: "smaller",
          fontStyle: "italic",
          color: "ghostwhite",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

const StyledLabel = styled("div")({
  fontWeight: "bold",
  letterSpacing: "1.5px",
  textAlign: "center",

});

export default LoanForm1;
