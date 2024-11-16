// apps/frontend/src/components/Form/FormDatePicker.tsx
import React from 'react';
import { Controller, Control } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers';
import { FormControl } from '@mui/material';

export interface FormDatePickerProps {
  name: string;
  control: Control<{ [key: string]: unknown }>;
  label: string;
  rules?: object;
  minDate?: Date;
  maxDate?: Date;
}

export const FormDatePicker: React.FC<FormDatePickerProps> = ({
  name,
  control,
  label,
  rules,
  minDate,
  maxDate,
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
          <DatePicker
            label={label}
            value={value}
            onChange={onChange}
            minDate={minDate}
            maxDate={maxDate}
            slotProps={{
              textField: {
                error: !!error,
                helperText: error?.message
              }
            }}
          />
        </FormControl>
      )}
    />
  );
};
