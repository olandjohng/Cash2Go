import React, { useEffect, useState } from "react"
import { useTheme } from "@emotion/react"
import { Formik, Form, useField } from "formik"
import * as Yup from "yup"
import { Button, Checkbox, FormControlLabel, Grid, Tooltip } from "@mui/material"
import Textfield from "../../../components/FormUI/Textfield"
import { tokens } from "../../../theme"
import { toast, Bounce } from "react-toastify"
import { useNavigate, useParams } from "react-router-dom"
import "react-toastify/dist/ReactToastify.css"
import { useSequence } from "../../../hooks/useSequence" // ← Add this import

const INITIAL_FORM_STATE = {
  sequenceType: "",
  description: "",
  prefix: "",
  suffix: "",
  startingValue: 1,
  isActive: true,
}

const FORM_VALIDATION = Yup.object().shape({
  sequenceType: Yup.string().required("Required"),
  description: Yup.string(),
  prefix: Yup.string(),
  suffix: Yup.string(),
  startingValue: Yup.number()
    .min(1, "Must be at least 1")
    .required("Required"),
  isActive: Yup.boolean(),
})

const ActiveCheckBox = ({ name }) => {
  const [field, meta] = useField(name)

  return (
    <FormControlLabel
      sx={{ color: "white" }}
      label="Active"
      control={<Checkbox {...field} checked={field.value} />}
    />
  )
}

export default function SequenceForm({ onSequenceAdded, onClosePopup }) {
  const { sequenceType } = useParams()
  const theme = useTheme()
  const colors = tokens(theme.palette.mode)
  const navigate = useNavigate()

  const [initialValues, setInitialValues] = useState(INITIAL_FORM_STATE)
  
  // ← Use the custom hook
  const { getAllSequences, createSequence, updateSequence } = useSequence()

  useEffect(() => {
    if (sequenceType) {
      const fetchSequence = async () => {
        try {
          const sequences = await getAllSequences() // ← Use hook method
          const sequence = sequences.find((s) => s.sequenceType === sequenceType)
          if (sequence) {
            setInitialValues({
              sequenceType: sequence.sequenceType,
              description: sequence.description || "",
              prefix: sequence.prefix || "",
              suffix: sequence.suffix || "",
              startingValue: sequence.currentValue,
              isActive: Boolean(sequence.isActive),
            })
          }
        } catch (err) {
          console.error("Error fetching data:", err)
          toast.error("Failed to load sequence data", {
            position: "top-right",
            theme: "colored",
            transition: Bounce,
          })
        }
      }
      fetchSequence()
    }
  }, [sequenceType, getAllSequences])

  const handleSubmit = async (values, actions) => {
    try {
      let response
      if (sequenceType) {
        // Update existing sequence
        response = await updateSequence(sequenceType, values) // ← Use hook method
      } else {
        // Create new sequence
        response = await createSequence(values) // ← Use hook method
      }
      
      onSequenceAdded()
      onClosePopup()
      navigate("/sequence")

      toast.success(response.message || "Sequence saved successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        transition: Bounce,
      })
    } catch (err) {
      toast.error(err.message || "Error occurred. Please try again.", {
        position: "top-right",
        transition: Bounce,
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
      })
      actions.setSubmitting(false)
    }
  }

  const handleCancel = () => {
    onClosePopup()
    navigate("/sequence")
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={FORM_VALIDATION}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {(formikProps) => (
        <Form>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Textfield
                name="sequenceType"
                label="Sequence Type"
                disabled={!!sequenceType}
              />
            </Grid>
            <Grid item xs={12}>
              <Textfield name="description" label="Description" />
            </Grid>
            <Grid item xs={6}>
              <Textfield name="prefix" label="Prefix" />
            </Grid>
            <Grid item xs={6}>
              <Textfield name="suffix" label="Suffix" />
            </Grid>
            {!sequenceType && (
              <Grid item xs={12}>
                <Textfield
                  name="startingValue"
                  label="Starting Value"
                  type="number"
                />
              </Grid>
            )}
            <Grid item>
              <ActiveCheckBox name="isActive" />
            </Grid>
          </Grid>
          <Grid container justifyContent="flex-end" spacing={1} mt={2}>
            <Grid item>
              <Tooltip title="Cancel" placement="top">
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  sx={{
                    backgroundColor: colors.blueAccent[700],
                    color: colors.grey[100],
                    borderColor: colors.grey[400],
                    "&:hover": {
                      borderColor: colors.grey[400],
                      backgroundColor: colors.grey[700],
                    },
                  }}
                >
                  Cancel
                </Button>
              </Tooltip>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                type="submit"
                disabled={formikProps.isSubmitting} // ← Add disabled state
                sx={{
                  backgroundColor: colors.blueAccent[700],
                  color: colors.grey[100],
                  borderColor: colors.grey[400],
                  "&:hover": {
                    borderColor: colors.grey[400],
                    backgroundColor: colors.grey[700],
                  },
                }}
              >
                {sequenceType ? "Update" : "Submit"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  )
}