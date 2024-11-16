// components/UserProfile/Profile.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Avatar,
  Text,
  VStack,
  useColorModeValue,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useUserData } from '../../hooks/useUserData';
import { ExplorePosts } from '../ExplorePosts';
import { BuddyList } from '../BuddyList';
import { EditProfileModal } from './EditProfileModal';

export const Profile = () => {
  const { address } = useParams();
  const { profile, loading } = useUserData(address!);
  const [isEditing, setIsEditing] = useState(false);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (loading) return <Box>Loading...</Box>;

  return (
    <Box maxW="7xl" mx="auto" px={{ base: 4, md: 8 }} py={8}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          bg={bgColor}
          shadow="lg"
          rounded="lg"
          p={6}
          mb={8}
        >
          <Flex direction={{ base: 'column', md: 'row' }} align="center">
            <Avatar
              size="2xl"
              name={profile.ensName || profile.address}
              src={profile.avatar}
              mb={{ base: 4, md: 0 }}
            />
            <VStack
              ml={{ base: 0, md: 8 }}
              align={{ base: 'center', md: 'start' }}
              spacing={2}
            >
              <Text fontSize="2xl" fontWeight="bold">
                {profile.ensName || `${profile.address.slice(0, 6)}...${profile.address.slice(-4)}`}
              </Text>
              {profile.bio && (
                <Text color="gray.600">{profile.bio}</Text>
              )}
              <Button
                colorScheme="blue"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            </VStack>
          </Flex>
        </Box>

        <Tabs variant="enclosed">
          <TabList>
            <Tab>Posts</Tab>
            <Tab>Connections</Tab>
            <Tab>Events</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <ExplorePosts userAddress={address} />
            </TabPanel>
            <TabPanel>
              <BuddyList userAddress={address} />
            </TabPanel>
            <TabPanel>
              <EventList userAddress={address} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </motion.div>

      <EditProfileModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        profile={profile}
      />
    </Box>
  );
};