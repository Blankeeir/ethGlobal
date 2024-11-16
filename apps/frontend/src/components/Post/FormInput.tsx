// apps/frontend/src/components/Form/FormInput.tsx
import React from 'react';
import { 
  TextField, 
  TextFieldProps,
  FormControl} from '@mui/material';
import { Controller, Control, FieldValues} from 'react-hook-form';

interface FormInputProps extends Omit<TextFieldProps, 'name'> {
  name: string;
  control: Control<FieldValues>;
  label: string;
  rules?: object;
}

export const FormInput: React.FC<FormInputProps> = ({
  name,
  control,
  label,
  rules,
  ...props
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({
        field: { onChange, value, ref },
        fieldState: { error }
      }) => (
        <FormControl fullWidth error={!!error}>
          <TextField
            {...props}
            label={label}
            value={value || ''}
            onChange={onChange}
            inputRef={ref}
            error={!!error}
            helperText={error?.message}
          />
        </FormControl>
      )}
    />
  );
};
