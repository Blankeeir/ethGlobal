// components/Instructions.tsx
import React from 'react';
import { 
  // Box,
  SimpleGrid, 
  Button, 
  Text, 
  Icon,
  VStack,
  Circle,
  Container,
  useColorModeValue 
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, Activity } from 'lucide-react';

export const Instructions: React.FC = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.50');
  // const iconBg = useColorModeValue('primary.50', 'primary.900');
  // const iconColor = useColorModeValue('primary.500', 'primary.200');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const instructions = [
    {
      title: 'Chat with Buddies',
      description: 'Chat with our verified buddies, make friends, seek help, or just have a casual conversation',
      icon: ShoppingBag,
      path: '/marketplace',
      gradient: 'linear(to-r, blue.400, purple.500)',
    },
    {
      title: 'Post Something',
      description: 'Post anything you like here, share your thoughts, ideas, or anything you want to share with the community',
      icon: Package,
      path: '/submit',
      gradient: 'linear(to-r, green.400, teal.500)',
    },
    {
      title: 'Events and Community',
      description: 'Join the live chat rooms here organized by your buddies, improve your mental health by surrounding yourself with positive people',
      icon: Activity,
      path: '/tracking',
      gradient: 'linear(to-r, orange.400, pink.500)',
    },
  ];

  return (
    <Container maxW="7xl" py={12}>
      <SimpleGrid 
        columns={{ base: 1, md: 3 }} 
        spacing={{ base: 6, md: 8, lg: 10 }}
      >
        {instructions.map((instruction) => (
          <Button
            key={instruction.title}
            onClick={() => navigate(instruction.path)}
            variant="unstyled"
            height="auto"
            p={0}
            w="full"
            _hover={{ transform: 'translateY(-8px)' }}
            transition="all 0.3s ease"
            role="group"
          >
            <VStack
              bg={bgColor}
              p={8}
              rounded="xl"
              borderWidth="1px"
              borderColor={borderColor}
              spacing={6}
              align="center"
              h="full"
              shadow="md"
              _hover={{
                shadow: 'xl',
              }}
            >
              <Circle
                size="60px"
                bgGradient={instruction.gradient}
                color="white"
                transition="all 0.3s ease"
                _groupHover={{
                  transform: 'scale(1.1)',
                }}
              >
                <Icon as={instruction.icon} boxSize={6} />
              </Circle>
              <VStack spacing={2} align="center">
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  transition="all 0.3s ease"
                  _groupHover={{
                    color: 'primary.500',
                  }}
                >
                  {instruction.title}
                </Text>
                <Text
                  fontSize="sm"
                  color="gray.500"
                  textAlign="center"
                  lineHeight="tall"
                >
                  {instruction.description}
                </Text>
              </VStack>
            </VStack>
          </Button>
        ))}
      </SimpleGrid>
    </Container>
  );
};