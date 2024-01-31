import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Container, Grid } from "@mui/material";
import Textfield from "../../../components/FormUI/Textfield";

const INITIAL_FORM_STATE = {
  name: "",
  check_location: "",
};

const FORM_VALIDATION = Yup.object().shape({
  name: Yup.string().required("Required"),
  check_location: Yup.string().required("Required"),
});

export default function BankForm() {
  return (
    <Formik
      initialValues={{ ...INITIAL_FORM_STATE }}
      validationSchema={FORM_VALIDATION}
      onSubmit={(values) => {
        console.log(values);
      }}
    >
      <Form>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Textfield name="name" label="Bank Name" />
          </Grid>
          <Grid item xs={12}>
            <Textfield name="check_location" label="Location" />
          </Grid>
        </Grid>
      </Form>
    </Formik>
  );
}
