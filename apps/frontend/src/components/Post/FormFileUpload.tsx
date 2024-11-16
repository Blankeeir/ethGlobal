// components/Form/FormFileUpload.tsx
import React from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { FormControl, FormLabel, FormErrorMessage } from '@chakra-ui/react';
import { Dropzone } from '../Dropzone';

interface FormFileUploadProps {
  name: string;
  control: Control<FieldValues>;
  label?: string;
  rules?: object;
  acceptedFileTypes?: string[];
  maxSize?: number;
  helperText?: string;
}

export const FormFileUpload: React.FC<FormFileUploadProps> = ({
  name,
  control,
  label,
  rules,
  acceptedFileTypes,
  maxSize,
  // helperText
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
        <FormControl isInvalid={!!error}>
          {label && <FormLabel>{label}</FormLabel>}
          <Dropzone
            onFileAccepted={onChange}
            acceptedFileTypes={acceptedFileTypes}
            maxSize={maxSize}
            value={value}
          />
          {error && (
            <FormErrorMessage>{error.message}</FormErrorMessage>
          )}
        </FormControl>
      )}
    />
  );
};