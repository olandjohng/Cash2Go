import { Form, Formik } from "formik";
import React, { useState } from "react";
import FormNavigation from "./FormNavigation";
import { Step, StepLabel, Stepper } from "@mui/material";
import SuccessComponent from "./SuccessComponent"; // Import your success component

const MultiStepForm = ({ children, initialValues, onSubmit }) => {
  const [stepNumber, setStepNumber] = useState(0);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState({});
  const steps = React.Children.toArray(children);

  const [snapshot, setSnapshot] = useState(initialValues);

  const step = steps[stepNumber];
  const totalSteps = steps.length;
  const isLastStep = stepNumber === totalSteps - 1;

  const next = (values) => {
    setSnapshot(values);
    setStepNumber(stepNumber + 1);
    setCompletedSteps({ ...completedSteps, [step.props.stepName]: true });
  };

  const previous = (values) => {
    setSnapshot(values);
    setStepNumber(stepNumber - 1);
  };

  const handleSubmit = async (values, actions) => {
    if (step.props.onSubmit) {
      await step.props.onSubmit(values);
    }

    if (isLastStep) {
      await onSubmit(values, actions);
      setIsFormSubmitted(true);
    } else {
      actions.setTouched({});
      next(values);
    }
  };

  return (
    <div>
      <Formik
        initialValues={snapshot}
        onSubmit={handleSubmit}
        validationSchema={step.props.validationSchema}
      >
        {(formik) => (
          <Form>
            <Stepper activeStep={stepNumber} style={{ marginBottom: 30 }}>
              {steps.map((currentStep, index) => {
                const label = currentStep.props.stepName;
                const isStepCompleted = completedSteps[label];

                return (
                  <Step key={label} completed={isStepCompleted}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                );
              })}
            </Stepper>

            {isFormSubmitted ? (
              <SuccessComponent />
            ) : (
              <>
                {step}
                <FormNavigation
                  isLastStep={isLastStep}
                  hasPrevious={stepNumber > 0}
                  onBackClick={() => previous(formik.values)}
                />
              </>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default MultiStepForm;

export const FormStep = ({ stepName = "", children }) => children;
