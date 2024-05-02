import { Autocomplete, Box, Grid } from "@mui/material";
import SelectWrapper from "../../../components/FormUI/Select";
import EditableDataGrid from "./EditableDataGrid";
import TextfieldWrapper from "../../../components/FormUI/Textfield";
import { useEffect, useState } from "react";
import { ComboBox } from "../../loan/components/LoanForm1";

// const initialRowData = [
//   { denomination: 1000, count: 0 },
//   { denomination: 500, count: 0 },
//   { denomination: 200, count: 0 },
//   { denomination: 100, count: 0 },
//   { denomination: 50, count: 0 },
//   { denomination: 20, count: 0 },
//   { denomination: 10, count: 0 },
//   { denomination: 5, count: 0 },
//   { denomination: 1, count: 0 },
// ];

const PaymentSetup = ({cashRow, cashRowSetter, paymentData , paymentDataSetter}) => {
  
  const [banks, setBanks] = useState([]);
  const [paymentType, setPaymentType] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [showOrField, setShowOrField] = useState(false);

  const handleRowEdit = (newRow, oldRow) => {
    const updatedRow = cashRow.map((v) => {
      if(v.id == newRow.id) return newRow;
      return v
    })
    cashRowSetter(updatedRow)
    paymentDataSetter((old) => ({...old , cash_count : updatedRow}))
    return newRow
  };
  const fixedOptions = [
    { value: "CASH", label: "Cash" },
    { value: "CHECK", label: "Check" },
    { value: "ONLINE", label: "Online" },
  ];

  useEffect(() => {
    const getBanks = async () => {
      const req = await fetch(`http://localhost:8000/payments/bank`);
      const resJson = await req.json();
      setBanks(resJson);
    };
    getBanks();
  }, []);

  useEffect(() => {
    // Check if the selected bank ID is for BDO to determine OR number field visibility
    const selectedBankObject = banks.find(bank => bank.id === selectedBank);
    if (selectedBankObject && selectedBankObject.name === "BDO") {
      setShowOrField(true); // Show OR number field if selected bank is BDO
    } else {
      setShowOrField(false); // Hide OR number field for other banks
    }
  }, [selectedBank, banks]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <Grid item xs={12} marginBottom={2}>
          <SelectWrapper
            name="myFieldName"
            label="Payment Type"
            options={fixedOptions}
            variant="standard"
            value={paymentData.payment_type}
            onChange={(e) => {
              const type = e.target.value
              paymentDataSetter((old) => ({...old, payment_type : type}))
              setPaymentType(type)
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextfieldWrapper name="myText" label="Provisional Receipt" />
        </Grid>
      </Grid>
      <Grid item xs={8}>
        {paymentData.payment_type === "CASH" && (
          <Grid item xs={12} marginBottom={2}>
            <EditableDataGrid
              rowData={cashRow}
              onRowEdit={handleRowEdit}
            />
          </Grid>
        )}
        {paymentData.payment_type === "CHECK" && (
          <Grid container spacing={2}>
            <Grid item xs={4} marginBottom={2}>
              <SelectWrapper
                name="myBank"
                label="Bank"
                options={banks.map((bank) => ({
                  value: bank.id,
                  label: bank.name,
                }))}
                variant="standard"
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
              />
            </Grid>
            <Grid item xs={showOrField ? 4 : 8} marginBottom={2}>
              <TextfieldWrapper name="myCheck" label="Check No." />
            </Grid>
            {showOrField && (
              <Grid item xs={4} marginBottom={2}>
                <TextfieldWrapper name="myOr" label="OR Number" />
              </Grid>
            )}
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export default PaymentSetup;
