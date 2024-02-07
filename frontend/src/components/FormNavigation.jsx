import React from "react";
import Button from "@mui/material/Button";
import { tokens } from "../theme";

const FormNavigation = (props) => {
  return (
    <div
      style={{
        display: "flex",
        marginTop: 50,
        justifyContent: "space-between",
      }}
    >
      {props.hasPrevious && (
        <Button variant="outlined" color="primary" onClick={props.onBackClick}>
          Back
        </Button>
      )}

      <Button type="submit" variant="outlined" color="primary">
        {props.isLastStep ? "Submit" : "Next"}
      </Button>
    </div>
  );
};

export default FormNavigation;
