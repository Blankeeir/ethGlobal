// apps/frontend/src/components/Profile/ActivityFeed.tsx
import React from 'react';
import {
  VStack,
  Box,
  Text,
  HStack,
  Circle,
  Divider,
  chakra,
  shouldForwardProp,
} from '@chakra-ui/react';
import { isValidMotionProp, motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Package, 
  DollarSign,
  Truck,
  Clock
} from 'lucide-react';

const MotionBox = chakra(motion.div, {
  shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
});
// import { Profile } from '../../util/types';
interface Activity {
  id: string;
  type: 'purchase' | 'listing' | 'sale' | 'shipment';
  description: string;
  timestamp: string;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'purchase':
      return ShoppingCart;
    case 'listing':
      return Package;
    case 'sale':
      return DollarSign;
    case 'shipment':
      return Truck;
    default:
      return Clock;
  }
};

export const ActivityFeed: React.FC<{ activities?: Activity[] }> = ({ 
  activities 
}) => {
  if (!activities) {
    return (
      <VStack spacing={4} align="stretch">
        {[...Array(5)].map((_, i) => (
          <Box key={i} p={4} bg="white" borderRadius="lg" shadow="sm">
            <HStack spacing={4}>
              <Circle size={10} bg="gray.100" />
              <VStack align="start" flex={1}>
                <Box height="20px" width="60%" bg="gray.100" borderRadius="md" />
                <Box height="16px" width="40%" bg="gray.100" borderRadius="md" />
              </VStack>
            </HStack>
          </Box>
        ))}
      </VStack>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      {activities.map((activity, index) => {
        const Icon = getActivityIcon(activity.type);
        
        return (
          <MotionBox
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            // transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <HStack spacing={4} bg="white" p={4} borderRadius="lg" shadow="sm">
              <Circle 
                size={10} 
                bg={`${activity.type}.50`}
                color={`${activity.type}.500`}
              >
                <Icon size={20} />
              </Circle>
              
              <VStack align="start" flex={1} spacing={1}>
                <Text fontWeight="medium">
                  {activity.description}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {new Date(activity.timestamp).toLocaleString()}
                </Text>
              </VStack>
            </HStack>
            {index < activities.length - 1 && (
              <Divider orientation="vertical" h={4} mx="auto" my={2} />
            )}
          </MotionBox>
        );
      })}
    </VStack>
  );
};