// apps/frontend/src/components/Form/FormSelect.tsx
import React from 'react';
import { 
  Select, 
  SelectProps,
  FormControl,
  InputLabel,
  FormHelperText,
  MenuItem
} from '@mui/material';
import { Controller, Control, FieldValues} from 'react-hook-form';

interface Option {
  value: string | number;
  label: string;
}

interface FormSelectProps extends Omit<SelectProps, 'name'> {
  name: string;
  control: Control<FieldValues>;
  label: string;
  options: Option[];
  rules?: object;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  name,
  control,
  label,
  options,
  rules,
  ...props
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({
        field: { onChange, value },
        fieldState: { error }
      }) => (
        <FormControl fullWidth error={!!error}>
          <InputLabel>{label}</InputLabel>
          <Select
            {...props}
            value={value || ''}
            onChange={onChange}
            label={label}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {error && (
            <FormHelperText>{error.message}</FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
};