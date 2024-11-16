// pages/Profile.tsx
import React from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Avatar,
  Text,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  // Button,
  useColorModeValue,
  Skeleton,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Package, History, Settings, Activity } from 'lucide-react';
import { useWallet } from '@vechain/dapp-kit-react';
import { useProfileData } from '../../hooks/useProfileData';
// import { AnimatedContainer } from '../Animations/AnimatedContainer';
import { ProductCard } from '../ProductCard';
import { TransactionHistory } from './TransactionHistory';
import { FormattingUtils } from '@repo/utils';
import { ActivityFeed } from './ActivityFeed';
import { ProfileSettings } from './ProfileSettings';
import { Product } from '../../util/types';

import { chakra, shouldForwardProp } from '@chakra-ui/react';
import { isValidMotionProp } from 'framer-motion';
// import {ProfileData} from "../../util/types";
const MotionBox = chakra(motion.div, {
  shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
});

export interface LocalProfileData {
  username: string;
  email: string;
  settings?: {
    notifications: boolean;
    emailUpdates: boolean;
  };
  reputation?: number;
  productsCount?: number;
  totalSales?: number;
  transactionsCount?: number;
  products?: Product[];
  avatarUrl?: string;
}

export const Profile: React.FC = () => {
  const { account } = useWallet();
  const { profile = {} as LocalProfileData, isLoading } = useProfileData(account || undefined) as unknown as { profile: LocalProfileData; isLoading: boolean };
  const bgColor = useColorModeValue('white', 'gray.700');

  if (!account) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box bg={bgColor} p={8} borderRadius="xl" shadow="md" textAlign="center">
          <Text>Please connect your wallet to view your profile</Text>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      {/* <AnimatedContainer> */}
        <VStack spacing={8} align="stretch">
          {/* Profile Header */}
          <MotionBox
            bg={bgColor}
            p={8}
            borderRadius="xl"
            shadow="md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            // transition={{ duration: 0.5 }}
          >
            <HStack spacing={8}>
              <Avatar
                size="2xl"
                name={profile?.username || account}
                src={profile?.avatarUrl}
              />
              <VStack align="start" flex={1} spacing={3}>
                <Heading size="lg">
                  {profile?.username || FormattingUtils.formatAddress(account)}
                </Heading>
                <HStack spacing={4}>
                  <Badge colorScheme="green">Verified Producer</Badge>
                  <Badge colorScheme="blue">
                    Reputation: {profile?.reputation || 0}
                  </Badge>
                </HStack>
                <Text color="gray.500">{account}</Text>
              </VStack>
            </HStack>
          </MotionBox>

          {/* Stats */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} height="100px" />
              ))
            ) : (
              <>
                <StatCard
                  label="Products Listed"
                  value={profile?.productsCount || 0}
                  helpText="Active listings"
                />
                <StatCard
                  label="Total Sales"
                  value={`${profile?.totalSales || 0} VET`}
                  helpText="Lifetime earnings"
                />
                <StatCard
                  label="Transactions"
                  value={profile?.transactionsCount || 0}
                  helpText="Total transactions"
                />
              </>
            )}
          </SimpleGrid>

          {/* Tabs Section */}
          <Box bg={bgColor} p={6} borderRadius="xl" shadow="md">
            <Tabs variant="soft-rounded" colorScheme="blue">
              <TabList>
                <Tab>
                  <HStack spacing={2}>
                    <Package size={18} />
                    <Text>My Products</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <History size={18} />
                    <Text>Transaction History</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <Activity size={18} />
                    <Text>Activity</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <Settings size={18} />
                    <Text>Settings</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {isLoading ? (
                      Array(6).fill(0).map((_, i) => (
                        <Skeleton key={i} height="200px" />
                      ))
                    ) : profile?.products?.map((product: Product) => (
                      <ProductCard key={product.id} product={product} onClick={function (): void {
                        throw new Error('Function not implemented.');
                      } } />
                    ))}
                  </SimpleGrid>
                </TabPanel>

                <TabPanel>
                  <TransactionHistory />
                </TabPanel>

                <TabPanel>
                  <ActivityFeed/>
                </TabPanel>

                <TabPanel>
                  <ProfileSettings profile = {profile} />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </VStack>
      {/* </AnimatedContainer> */}
    </Container>
  );
};

// Helper Components
const StatCard: React.FC<{
  label: string;
  value: string | number;
  helpText: string;
}> = ({ label, value, helpText }) => (
  <Stat
    px={6}
    py={4}
    bg={useColorModeValue('white', 'gray.700')}
    shadow="md"
    borderRadius="lg"
  >
    <StatLabel fontSize="sm" color="gray.500">{label}</StatLabel>
    <StatNumber fontSize="2xl" fontWeight="bold">{value}</StatNumber>
    <StatHelpText>{helpText}</StatHelpText>
  </Stat>
);