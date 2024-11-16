// EventList.tsx
import React from 'react';
import {
  VStack,
  Box,
  Text,
  HStack,
  Button,
  Badge,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Divider, 
} from '@chakra-ui/react';

import { useDisclosure } from '../../hooks/useDisclosure';
import { FiFilter, FiCalendar, FiUsers, FiMessageCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../../hooks/useEvents';
import { JoinEventModal } from './modals/JoinEventModal';

interface EventListProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const EventList: React.FC<EventListProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  const { events, loading, joinEvent } = useEvents();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const categories = [
    { id: 'all', name: 'All Events' },
    { id: 'text-chat', name: 'Text Chat' },
    { id: 'support-group', name: 'Support Groups' },
    { id: 'meditation', name: 'Meditation' },
    { id: 'workshop', name: 'Workshops' },
  ];

  const handleJoinEvent = async (eventId: string, requiresIdentity: boolean) => {
    if (requiresIdentity) {
      onOpen(); // Open confirmation modal
    } else {
      await joinEvent(eventId);
      navigate(`/event/${eventId}`);
    }
  };

  const EventCard: React.FC<any> = ({ event }) => (
    <Box
      p={4}
      bg={useColorModeValue('gray.50', 'gray.700')}
      borderRadius="md"
      borderWidth={1}
      borderColor={borderColor}
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="bold">{event.name}</Text>
          <Badge colorScheme={event.requiresIdentity ? 'red' : 'green'}>
            {event.requiresIdentity ? 'Identity Required' : 'Anonymous'}
          </Badge>
        </HStack>
        
        <Text color="gray.500" noOfLines={2}>{event.description}</Text>
        
        <HStack spacing={4}>
          <HStack>
            <FiCalendar />
            <Text fontSize="sm">{new Date(event.startTime * 1000).toLocaleDateString()}</Text>
          </HStack>
          <HStack>
            <FiUsers />
            <Text fontSize="sm">{event.participantCount} participants</Text>
          </HStack>
        </HStack>

        <Button
          onClick={() => handleJoinEvent(event.id, event.requiresIdentity)}
          colorScheme="blue"
          leftIcon={<FiMessageCircle />}
        >
          Join Event
        </Button>
      </VStack>
    </Box>
  );

  return (
    <Box p={6} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="xl" fontWeight="bold">Events & Communities</Text>
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FiFilter />}
              variant="ghost"
              aria-label="Filter events"
            />
            <MenuList>
              {categories.map((category) => (
                <MenuItem
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  fontWeight={selectedCategory === category.id ? 'bold' : 'normal'}
                >
                  {category.name}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </HStack>

        <Divider />

        {loading ? (
          <Text textAlign="center">Loading events...</Text>
        ) : (
          <VStack spacing={4}>
            {events
              .filter(event => selectedCategory === 'all' || event.category === selectedCategory)
              .map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
          </VStack>
        )}
      </VStack>

      <JoinEventModal isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};
