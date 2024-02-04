import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
} from "@mui/material";
import { useField, useFormikContext } from "formik"; }

const CheckBackWrapper = ({ name, label, legend, ...otherProps }) => {
    const {setFieldValue} = useFormikContext();
    const [field, meta] = useField(name);

    const handleChange = evt => {
        const {checked} = evt.target;
        setFieldValue(name, checked);
    }
    const configCheckbox = {
        ...field,
        ...otherProps,
        onChange: handleChange,
    }

    const configFormControl = {

    };

    if (meta && meta.touched && meta.error) {
        configFormControl.error = true;
    }
  return (
    <FormControl {...configFormControl}>
      <FormLabel component= 'legend'> {legend} </FormLabel>
      <FormGroup>
        <FormControlLabel control={<Checkbox />} label={label} />
      </FormGroup>
    </FormControl>
  );
};

export default CheckBackWrapper;