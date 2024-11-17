// src/components/Profile/UserProfile.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Avatar,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Skeleton,
  Badge,
  useToast,
  Container,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Divider,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../contexts/Web3Context';
import { useFilecoinStorage } from '../../hooks/useFilecoinStorage';
import { useNFTPosts } from '../../hooks/useNFTPosts';
import { usePush } from '../../contexts/PushContext';
import { ExplorePosts } from '../Post/ExplorePosts';
import { BuddyList } from '../buddy/BuddyList';
import { EditProfileModal } from '../modals/EditProfileModal';
import { EventList } from '../event/EventList';
import { UserStats } from './UserStats';
import { UserProfile } from '@dynamic-labs/sdk-react-core';

interface ProfileData {
  address: string;
  ensName?: string;
  avatar?: string;
  bio?: string;
  buddyStatus: 'verified' | 'pending' | 'none';
  stats: {
    posts: number;
    buddies: number;
    likes: number;
    events: number;
  };
  socialLinks?: {
    twitter?: string;
    github?: string;
    website?: string;
  };
  privacyPreferences?: {
    showENS: boolean;
    allowDirectMessages: boolean;
    showActivity: boolean;
  };
}

export const Profile: React.FC = () => {
  const { address: paramAddress } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { address: currentUserAddress } = useWeb3();
  const { retrieveData, storeUserProfile } = useFilecoinStorage();
  // const { posts, loading: postsLoading } = useNFTPosts();
  const { sendNotification } = usePush();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!paramAddress) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const profileData = await retrieveData<ProfileData>(`profile-${paramAddress}`);
        
        if (profileData) {
          setProfile(profileData);
        } else {
          setProfile({
            address: paramAddress,
            buddyStatus: 'none',
            stats: {
              posts: 0,
              buddies: 0,
              likes: 0,
              events: 0
            }
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [paramAddress, retrieveData, navigate, toast]);

  const handleConnect = async () => {
    if (!profile || !currentUserAddress) return;

    try {
      // Send connection request notification
      await sendNotification(
        profile.address,
        'New Connection Request',
        `${currentUserAddress} wants to connect with you!`,
        `/profile/${currentUserAddress}`
      );

      toast({
        title: 'Request Sent',
        description: 'Connection request sent successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send connection request',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleProfileUpdate = async (updatedData: Partial<UserProfile>) => {
    if (!profile || profile.address !== currentUserAddress) return;

    try {
      const updatedProfile = {
        ...profile,
        ...updatedData,
        privacyPreferences: profile.privacyPreferences || {
          showENS: true,
          allowDirectMessages: true,
          showActivity: true
        }
      };
      await storeUserProfile(updatedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return <Box maxW="7xl" mx="auto" px={{ base: 4, md: 8 }} py={8}>
      <VStack spacing={8}>
        <Skeleton height="200px" width="100%" />
        <Skeleton height="400px" width="100%" />
      </VStack>
    </Box>;
  }

  if (!profile) return null;

  const isOwnProfile = currentUserAddress === profile.address;

  return (
    <AnimatePresence>
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Profile Header */}
          <Box
            w="full"
            bg={bgColor}
            shadow="lg"
            rounded="lg"
            p={6}
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Flex direction={{ base: 'column', md: 'row' }} align="center" justify="space-between">
              <HStack spacing={6}>
                <Avatar
                  size="2xl"
                  name={profile.ensName || profile.address}
                  src={profile.avatar}
                />
                <VStack align="start" spacing={2}>
                  <HStack>
                    <Text fontSize="2xl" fontWeight="bold">
                      {profile.ensName || `${profile.address.slice(0, 6)}...${profile.address.slice(-4)}`}
                    </Text>
                    {profile.buddyStatus === 'verified' && (
                      <Badge colorScheme="green">Verified Buddy</Badge>
                    )}
                  </HStack>
                  {profile.bio && (
                    <Text color="gray.600" maxW="md">
                      {profile.bio}
                    </Text>
                  )}
                </VStack>
              </HStack>

              {isOwnProfile ? (
                <Button
                  colorScheme="blue"
                  size="md"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <Button
                  colorScheme="blue"
                  size="md"
                  onClick={handleConnect}
                  isDisabled={profile.buddyStatus === 'pending'}
                >
                  {profile.buddyStatus === 'pending' ? 'Request Pending' : 'Connect'}
                </Button>
              )}
            </Flex>

            <Divider my={6} />

            <UserStats />
          </Box>

          {/* Tabs */}
          <Tabs
            variant="enclosed"
            colorScheme="blue"
            w="full"
            onChange={setActiveTab}
            defaultIndex={activeTab}
          >
            <TabList>
              <Tab>Posts</Tab>
              <Tab>Buddies</Tab>
              <Tab>Events</Tab>
              {isOwnProfile && <Tab>Settings</Tab>}
            </TabList>

            <TabPanels>
              <TabPanel>
                <ExplorePosts/>
              </TabPanel>
              <TabPanel>
                <BuddyList />
              </TabPanel>
              <TabPanel>
                <EventList selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
              </TabPanel>
              {isOwnProfile && (
                <TabPanel>
                  {/* Add profile settings here */}
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </VStack>

        <EditProfileModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          currentProfile={{
            name: profile?.ensName,
            bio: profile?.bio,
            avatar: profile?.avatar
          }}
        />
      </Container>
    </AnimatePresence>
  );
};