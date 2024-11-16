// useScrollAnimation.ts
import { useAnimation, AnimationControls } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

interface UseScrollAnimationReturn {
  ref: (node?: Element | null) => void;
  controls: AnimationControls;
}

export const useScrollAnimation = (): UseScrollAnimationReturn => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1, // Adjust this value as needed
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else {
      controls.start('hidden');
    }
  }, [controls, inView]);

  return { ref, controls };
};
