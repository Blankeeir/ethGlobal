// components/UserProfile/UserStats.tsx
import React from 'react';
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  useColorModeValue,
  Skeleton
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimatedMount } from '../../hooks/useAnimatedMount';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';
import { FiUsers, FiHeart, FiFileText, FiMessageCircle } from 'react-icons/fi';
import { useUserData } from '../../hooks/useUserData';

const MotionStat = motion(Stat);

interface StatsCardProps {
  title: string;
  stat: number;
  icon: React.ReactElement;
  helpText?: string;
  isVisible: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, stat, icon, helpText, isVisible }) => {
  const { shouldRender, controls } = useAnimatedMount(isVisible);
  const animatedValue = useAnimatedCounter(stat, 2);
  
  if (!shouldRender) return null;

  return (
    <MotionStat
      initial="hidden"
      animate={controls}
      exit="exit"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
      }}
      px={{ base: 2, md: 4 }}
      py={5}
      shadow="xl"
      border="1px solid"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      rounded="lg"
      bg={useColorModeValue('white', 'gray.800')}
      _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}
    >
      <Box pl={{ base: 2, md: 4 }}>
        <StatLabel display="flex" alignItems="center" gap={2} fontWeight="medium">
          <Icon as={icon.type} color="blue.500" />
          {title}
        </StatLabel>
        <StatNumber fontSize="3xl" fontWeight="medium">
          {animatedValue}
        </StatNumber>
        {helpText && (
          <StatHelpText color="gray.500">
            {helpText}
          </StatHelpText>
        )}
      </Box>
    </MotionStat>
  );
};

export const UserStats: React.FC<{ userId?: string }> = ({ userId }) => {
  const { stats, loading } = useUserData(userId);
  const statsVisible = !loading && !!stats;

  const statsConfig = [
    {
      title: "Today's Connections",
      stat: stats?.dateRange?.today || 0,
      icon: <FiUsers />,
      helpText: "New connections made today"
    },
    {
      title: "Weekly Activity",
      stat: stats?.dateRange?.week || 0,
      icon: <FiMessageCircle />,
      helpText: "Active conversations this week"
    },
    {
      title: "Total Posts",
      stat: stats?.posts || 0,
      icon: <FiFileText />,
      helpText: "Content shared"
    },
    {
      title: "Community Impact",
      stat: stats?.likes || 0,
      icon: <FiHeart />,
      helpText: "Total likes received"
    }
  ];

  if (loading) {
    return (
      <Box maxW="7xl" mx="auto" pt={5} px={{ base: 2, sm: 12, md: 17 }}>
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={{ base: 5, lg: 8 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="120px" rounded="lg" />
          ))}
        </SimpleGrid>
      </Box>
    );
  }

  return (
    <Box maxW="7xl" mx="auto" pt={5} px={{ base: 2, sm: 12, md: 17 }}>
      <AnimatePresence>
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={{ base: 5, lg: 8 }}>
          {statsConfig.map((stat, index) => (
            <StatsCard
              key={stat.title}
              {...stat}
              isVisible={statsVisible}
            />
          ))}
        </SimpleGrid>
      </AnimatePresence>
    </Box>
  );
};
