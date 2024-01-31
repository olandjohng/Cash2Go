
import TextField from "@mui/material/TextField";
import { useField } from "formik";

const InputField = ({ label, ...props }) => {
  const [field, meta] = useField(props.name);

  return (
    <TextField
      fullWidth
      label={label}
      {...field}
      {...props}
      error={meta.touched && Boolean(meta.error)}
      helperText={meta.touched && meta.error}
    />
  );
};

export default InputField;
