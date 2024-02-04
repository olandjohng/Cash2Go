import { Textfield } from '@mui/material';
import { useField } from 'formik';

const DateTimePicker = ( {
    name, 
    ...otherProps
}) => {
    const [field, meta] = useField(name);

    const configDateTimePicker = {
        ...field,
        ...otherProps,
        type: 'date',
        variant: 'contained',
        fullWidth: true,
        InputLabelProps: {
            shrink: true
        }
    }

    if (meta && meta.touched && meta.error) {
        configDateTimePicker.error = true;
        configDateTimePicker.helperText = meta.error;
    }

    return (
        <Textfield {...configDateTimePicker} />
    )
}

export default DateTimePicker;