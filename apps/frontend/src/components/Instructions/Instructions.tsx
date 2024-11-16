// components/Instructions.tsx
import React from 'react';
import { 
  SimpleGrid, 
  Button, 
  Text, 
  Icon, 
  useColorModeValue 
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, Activity } from 'lucide-react';
// import { AnimatedContainer } from '../Animations/AnimatedContainer';

export const Instructions: React.FC = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.700');

  const instructions = [
    {
      title: 'Chat with Buddies',
      description: 'Chat with our verified buddies, make friends, seek help, or just have a casual conversation',
      icon: ShoppingBag,
      path: '/marketplace',
    },
    {
      title: 'Post Something',
      description: 'Post anything you like here, share your thoughts, ideas, or anything you want to share with the community',
      icon: Package,
      path: '/submit',
    },
    {
      title: 'Events and Community',
      description: 'Join the live chat rooms here organized by your buddies, improve your mental health by surrounding yourself with positive people',
      icon: Activity,
      path: '/tracking',
    },
  ];

  return (
    // <AnimatedContainer
    //   variant="slide"
    //   staggerChildren
    //   staggerDelay={0.1}
    //   animateOnScroll
    //   threshold={0.2}
    // >
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        {instructions.map((instruction) => (
          <Button
            key={instruction.title}
            onClick={() => navigate(instruction.path)}
            variant="outline"
            size="lg"
            height="auto"
            p={8}
            w="full"
            bg={bgColor}
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={4}
            _hover={{
              transform: 'translateY(-4px)',
              transition: 'transform 0.2s'
            }}
          >
            <Icon as={instruction.icon} boxSize={8} />
            <Text fontSize="lg" fontWeight="bold">
              {instruction.title}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {instruction.description}
            </Text>
          </Button>
        ))}
      </SimpleGrid>
    // </AnimatedContainer>
  );
};
