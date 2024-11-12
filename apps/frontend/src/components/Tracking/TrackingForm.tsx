// components/TrackingForm.tsx
import React from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';

import { useForm } from 'react-hook-form';
import { useSupplyChain } from '../../hooks/useSupplyChain';
import { ProductFormData } from '../../schemas';
interface TrackingFormProps {

  tokenId: string;

  onSubmit: (event: React.FormEvent) => void;

}

export const TrackingForm: React.FC<TrackingFormProps> = ({ tokenId }) => {
  const { addTracking } = useSupplyChain(tokenId);
  const { register, handleSubmit } = useForm<ProductFormData>();

  const onSubmit = async (data: ProductFormData) => {
    addTracking({
      ...data,
      envKeys: ['temperature', 'humidity'],
      envValues: [data.temperature.toString(), data.humidity.toString()],
      handler: '',
      status: ''
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={4}>
        <FormControl>
          <FormLabel>Location</FormLabel>
          <Input {...register('location', { required: true })} />
        </FormControl>

        <FormControl>
          <FormLabel>Handler</FormLabel>
          <Input {...register('handler', { required: true })} />
        </FormControl>

        <FormControl>
          <FormLabel>Temperature (°C)</FormLabel>
          <NumberInput>
            <NumberInputField {...register('temperature', { required: true })} />
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel>Humidity (%)</FormLabel>
          <NumberInput>
            <NumberInputField {...register('humidity', { required: true })} />
          </NumberInput>
        </FormControl>

        <Button 
          type="submit" 
          colorScheme="blue" 
        >
          Add Tracking Data
        </Button>
      </VStack>
    </form>
  );
};