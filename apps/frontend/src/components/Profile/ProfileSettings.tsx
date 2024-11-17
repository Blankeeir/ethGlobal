// apps/frontend/src/components/Profile/ProfileSettings.tsx
import React from 'react';
import {Profile} from './Profile';
import {UserProfile} from '../../util/types';
interface ProfileSettingsProps {
  profile: UserProfile;
}
import {
  VStack,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Button,
  Text,
  useToast,
  Divider,
  chakra,
  shouldForwardProp,
} from '@chakra-ui/react';
import { isValidMotionProp, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';

const MotionVStack = chakra(
  React.forwardRef<HTMLDivElement, React.ComponentProps<typeof motion.div>>((props, ref) => (
    <motion.div ref={ref} {...props} />
  )),
  {
    shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
  }
);

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile }) => {
  const toast = useToast();
  const { register, handleSubmit, formState: { isDirty, isSubmitting } } = useForm({
    defaultValues: {
      username: profile?.username || '',
      email: profile?.email || '',
      notifications: profile?.settings?.notifications || false,
      emailUpdates: profile?.settings?.emailUpdates || false,
    }
  });

  const onSubmit = async () => {
    try {
      // Update profile settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      
      toast({
        title: 'Settings updated',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Failed to update settings',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <MotionVStack
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      // transition={{ duration: 0.3 }}
      // spacing={8}
      // align="stretch"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={6} align="stretch">
          <Text fontSize="xl" fontWeight="bold">
            Profile Settings
          </Text>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <FormControl>
              <FormLabel>Username</FormLabel>
              <Input {...register('username')} />
            </FormControl>
            
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input {...register('email')} type="email" />
            </FormControl>
          </SimpleGrid>

          <Divider />

          <Text fontSize="xl" fontWeight="bold">
            Notifications
          </Text>

          <VStack spacing={4} align="stretch">
            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0}>
                Push Notifications
              </FormLabel>
              <Switch {...register('notifications')} />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0}>
                Email Updates
              </FormLabel>
              <Switch {...register('emailUpdates')} />
            </FormControl>
          </VStack>

          <Button
            type="submit"
            colorScheme="primary"
            isLoading={isSubmitting}
            disabled={!isDirty}
            alignSelf="flex-start"
          >
            Save Changes
          </Button>
        </VStack>
      </form>
    </MotionVStack>
  );
};