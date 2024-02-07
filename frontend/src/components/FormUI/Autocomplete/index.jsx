import { TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { useFormikContext } from 'formik';
import React from 'react';

function AutoCompleteWrapper(props) {
  const { options, name, label, id } = props;

  const formik = useFormikContext();

  return (
    <Autocomplete
      {...props}
      multiple
      options={options}
      getOptionLabel={(option) => option.title}
      onChange={(_, value) => formik.setFieldValue(name, value)}
      filterSelectedOptions
      isOptionEqualToValue={(item, current) => item.value === current.value}
      renderInput={(params) => (
        <TextField
          {...params}
          id={id}
          name={name}
          label={label}
          variant={"outlined"}
          onChange={formik.handleChange}
          error={formik.touched[name] && Boolean(formik.errors[name])}
          helperText={formik.errors[name]}
          value={formik.values[name]}
          fullWidth
        />
      )}
    />
  );
}

export default AutoCompleteWrapper;
