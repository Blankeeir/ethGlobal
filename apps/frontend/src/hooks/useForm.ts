// apps/frontend/src/hooks/useForm.ts
import { useForm as useRHForm, UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from './useToast';

export const useForm = <T extends z.ZodType>(
  schema: T,
  options?: Omit<UseFormProps<z.infer<T>> & { onSubmit?: (data: z.infer<T>) => Promise<void> }, 'resolver'>
) => {
  const toast = useToast();
  const form = useRHForm<z.infer<T>>({
    ...options,
    resolver: zodResolver(schema)
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      if (options?.onSubmit) {
        await options.onSubmit(data);
        toast.success('Form submitted successfully');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Form submission failed');
      } else {
        toast.error('Form submission failed');
      }
    }
  });

  return {
    ...form,
    handleSubmit
  };
};