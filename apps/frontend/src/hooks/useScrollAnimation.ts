// hooks/useScrollAnimation.ts
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useAnimationControls } from 'framer-motion';

export const useScrollAnimation = (threshold: number = 0.1) => {
  const controls = useAnimationControls();
  const [ref, inView] = useInView({ threshold });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return { ref, controls, inView };
};