import React from 'react';
import { useField, useFormikContext } from 'formik';
import { Autocomplete, TextField } from '@mui/material';

const AutocompleteWrapper = ({ name, options, ...otherProps }) => {
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(name);

  const handleChange = (_event, value) => {
    // Set the value of the field to the value of the selected option, or to an empty string if no option is selected
    setFieldValue(name, value ? value.value : '');
  };

  const handleBlur = () => {
    // Set the field as touched when it loses focus, to trigger validation
    setFieldTouched(name, true);
  };

  // The option selected in the Autocomplete should be the one that matches the current field value
  const selectedOption = options.find(option => option.value === field.value) || null;

  return (
    <Autocomplete
      {...otherProps}
      id={name}
      options={options}
      getOptionLabel={(option) => option.label} // Assuming your options have a 'label' property
      value={selectedOption}
      onChange={handleChange}
      onBlur={handleBlur}
      renderInput={(params) => (
        <TextField
          {...params}
          name={name}
          variant="outlined"
          fullWidth
          error={meta.touched && Boolean(meta.error)}
          helperText={meta.touched && meta.error}
        />
      )}
      isOptionEqualToValue={(option, value) => option.value === value.value}
    />
  );
};

export default AutocompleteWrapper;