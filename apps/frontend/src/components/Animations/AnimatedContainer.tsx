// components/animations/AnimatedContainer.tsx
// explain: 
// 1. This component is a wrapper component that animates its children when they become visible in the viewport.
// 2. It uses the `framer-motion` library to create animations.
// 3. The `AnimatedContainer` component accepts the following props:
//    - `variant`: The animation variant to use (fade, slide, or scale).
//    - `isVisible`: Whether the children should be visible by default.
//    - `animateOnScroll`: Whether to animate the children when they become visible in the viewport.
//    - `threshold`: The threshold for the intersection observer.
//    - `delay`: The delay before the animation starts.
//    - `staggerChildren`: Whether to stagger the children animations.
//    - `staggerDelay`: The delay between staggered children animations.
// 4. The `AnimatedContainer` component uses the `useInView` hook from the `react-intersection-observer` library to detect when the children are visible in the viewport.
// 5. It uses the `useMergeRefs` custom hook to merge multiple refs.
// 6. It uses the `motion` component from `framer-motion` to create animations.
// 7. The `fadeVariants`, `slideVariants`, and `scaleVariants` objects define the animation variants.
// 8. The `AnimatedContainer` component renders the children with the specified animation variant and props.
// 9. It uses the `AnimatePresence` component from `framer-motion` to handle the exit animation of the children.
// 10. The `AnimatedContainer` component is used in the `Profile`, `SupplyChainTracking`, `MarketplacePreview`, and `Home` components to animate the content.


import React from 'react';
import { BoxProps } from '@chakra-ui/react';
import { motion, AnimatePresence, Variants, isValidMotionProp, HTMLMotionProps } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {chakra, forwardRef, shouldForwardProp} from '@chakra-ui/react'
// // Create a motion-compatible Chakra component
// const ChakraBox = forwardRef<BoxProps, 'div'>((props, ref) => {
//   return <Box ref={ref} {...props} />;
// });

// Combine Chakra and Motion props
type MotionBoxProps = BoxProps & HTMLMotionProps<'div'>;
const MotionBox = chakra(motion.div, {
    shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
  });

// Animation variants
const fadeVariants: Variants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};

const slideVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      type: "spring",
      stiffness: 100
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3
    }
  }
};

const scaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      type: "spring",
      stiffness: 100
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.3
    }
  }
};

// Props type for the AnimatedContainer
interface AnimatedContainerProps extends Omit<MotionBoxProps, 'transition' | 'variants'> {
  variant?: 'fade' | 'slide' | 'scale';
  isVisible?: boolean;
  animateOnScroll?: boolean;
  threshold?: number;
  delay?: number;
  staggerChildren?: boolean;
  staggerDelay?: number;
}

export const AnimatedContainer = forwardRef<AnimatedContainerProps, 'div'>(({
  variant = 'fade',
  isVisible = true,
  animateOnScroll = false,
  threshold = 0.1,
  delay = 0,
  staggerChildren = false,
  staggerDelay = 0.1,
  children,
  ...rest
}, ref) => {
  const [inViewRef, inView] = useInView({
    threshold,
    triggerOnce: true
  });

  // Combine refs
  const combinedRef = useMergeRefs(inViewRef, ref);

  const getVariants = () => {
    switch (variant) {
      case 'slide':
        return slideVariants;
      case 'scale':
        return scaleVariants;
      default:
        return fadeVariants;
    }
  };

  const containerVariants = staggerChildren ? {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: staggerDelay
      }
    }
  } : getVariants();

  const shouldAnimate = animateOnScroll ? inView : isVisible;

  return (
    <AnimatePresence mode="wait">
      {shouldAnimate && (
        <MotionBox
          ref={combinedRef}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
          {...rest}
        >
          {staggerChildren ? (
            <motion.div
              variants={{
                visible: {
                  transition: {
                    staggerChildren: staggerDelay
                  }
                }
              }}
            >
              {React.Children.map(children, (child, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0
                    }
                  }}
                >
                  {child}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            children
          )}
        </MotionBox>
      )}
    </AnimatePresence>
  );
});

// Add display name for dev tools
AnimatedContainer.displayName = 'AnimatedContainer';

// Custom hook to merge refs
function useMergeRefs<T>(...refs: (React.RefObject<T> | React.MutableRefObject<T> | React.ForwardedRef<T>)[]) {
  return React.useCallback((element: T) => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === 'function') {
        ref(element);
      } else if (ref && 'current' in ref) {
        (ref as React.MutableRefObject<T | null>).current = element;
      }
    });
  }, [refs]);
}

// Usage example:
// const MyComponent = () => {
//   return (
//     <AnimatedContainer
//       variant="slide"
//       animateOnScroll
//       p={4}
//       bg="white"
//       borderRadius="xl"
//       shadow="lg"
//     >
//       <Box>Content goes here</Box>
//     </AnimatedContainer>
//   );
// };