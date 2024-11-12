// apps/frontend/src/hooks/useProfileData.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/ProfileService';
import { ProfileFormData } from '../schemas/validation';
import { useToast } from '@chakra-ui/react';

export const useProfileData = (address?: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const {
    data: profile,
    isLoading,
    error
  } = useQuery({
    queryKey: ['profile', address],
    queryFn: () => address ? profileService.getProfile() : null,
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: transactions } = useQuery({
    queryKey: ['transactions', address],
    queryFn: () => address ? profileService.getTransactions() : null,
    enabled: !!address,
  });

  const { data: activities } = useQuery({
    queryKey: ['activities', address],
    queryFn: () => address ? profileService.getActivities() : null,
    enabled: !!address,
  });

  const updateProfile = useMutation({
    mutationFn: (data: Partial<ProfileFormData>) => {
      if (!address) throw new Error('Address is required');
      return profileService.updateProfile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', address] });
      toast({
        title: 'Profile updated',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    },
  });

  return {
    profile,
    transactions,
    activities,
    isLoading,
    error,
    updateProfile: updateProfile.mutate,
    isUpdating: updateProfile.status === 'pending',
  };
};