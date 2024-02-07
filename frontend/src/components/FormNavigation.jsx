import React from "react";
import Button from "@mui/material/Button";

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
        <Button
          variant="contained"
          color="primary"
          onClick={props.onBackClick}
        >
          Back
        </Button>
      )}

      <Button type="submit" variant="contained" color="primary">
        {props.isLastStep ? "Submit" : "Next"}
      </Button>
    </div>
  );
};

export default FormNavigation;
