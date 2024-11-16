// components/UserProfile/UserStats.tsx
import React from 'react';
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';

interface StatsCardProps {
  title: string;
  stat: number;
  icon: React.ReactNode;
}

function StatsCard(props: StatsCardProps) {
  const { title, stat, icon } = props;
  const animatedValue = useAnimatedCounter(stat);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Stat
        px={{ base: 2, md: 4 }}
        py={'5'}
        shadow={'xl'}
        border={'1px solid'}
        borderColor={useColorModeValue('gray.800', 'gray.500')}
        rounded={'lg'}
      >
        <Box pl={{ base: 2, md: 4 }}>
          <StatLabel fontWeight={'medium'} isTruncated>
            {title}
          </StatLabel>
          <StatNumber fontSize={'2xl'} fontWeight={'medium'}>
            {animatedValue}
          </StatNumber>
        </Box>
      </Stat>
    </motion.div>
  );
}

export const UserStats = () => {
  const { stats, loading } = useUserData();

  if (loading) return <Box>Loading...</Box>;

  return (
    <Box maxW="7xl" mx={'auto'} pt={5} px={{ base: 2, sm: 12, md: 17 }}>
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={{ base: 5, lg: 8 }}>
        <StatsCard
          title={'Today\'s Connections'}
          stat={stats.dateRange.today}
          icon={<FiUsers />}
        />
        <StatsCard
          title={'Weekly Connections'}
          stat={stats.dateRange.week}
          icon={<FiUsers />}
        />
        <StatsCard
          title={'Total Posts'}
          stat={stats.posts}
          icon={<FiFile />}
        />
        <StatsCard
          title={'Total Likes'}
          stat={stats.likes}
          icon={<FiHeart />}
        />
      </SimpleGrid>
    </Box>
  );
};
