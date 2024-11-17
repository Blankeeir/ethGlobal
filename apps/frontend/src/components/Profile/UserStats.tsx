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
  Skeleton,
  chakra,
  shouldForwardProp as chakraShouldForwardProp,
} from '@chakra-ui/react';
import { isValidMotionProp } from 'framer-motion';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { FiUsers, FiMessageCircle, FiFileText, FiHeart } from 'react-icons/fi';
const MotionStat = chakra(motion.div, {
  shouldForwardProp: (prop: string) => isValidMotionProp(prop) || chakraShouldForwardProp(prop),
  baseStyle: {
    ...Stat.defaultProps,
  },
});


interface StatsCardProps {
  title: string;
  stat: number;
  icon: React.ElementType;
  helpText?: string;
  isVisible: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, stat, icon, helpText, isVisible }) => {
  const controls = useAnimation();
  const shouldRender = isVisible;
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
          <Icon as={icon} color="blue.500" />
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
      icon: FiUsers,
      helpText: "New connections made today"
    },
    {
      title: "Weekly Activity",
      stat: stats?.dateRange?.week || 0,
      icon: FiMessageCircle,
      helpText: "Active conversations this week"
    },
    {
      title: "Total Posts",
      stat: stats?.posts || 0,
      icon: FiFileText,
      helpText: "Content shared"
    },
    {
      title: "Community Impact",
      stat: stats?.likes || 0,
      icon: FiHeart,
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
function useAnimatedCounter(stat: number, duration: number) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTime: number;
    const animateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * stat));
      
      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };
    
    requestAnimationFrame(animateCount);
  }, [stat, duration]);

  return count;
}

function useUserData(userId: string | undefined) {
  const [stats, setStats] = React.useState<{
    dateRange?: { today: number; week: number };
    posts?: number;
    likes?: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Simulated API call - replace with actual API call
        const response = await fetch(`/api/users/${userId}/stats`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching user stats:', error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  return { stats, loading };
}
