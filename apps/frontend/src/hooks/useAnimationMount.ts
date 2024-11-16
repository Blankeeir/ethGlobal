// hooks/useAnimatedMount.ts
import { useEffect, useState } from 'react';
import { useAnimationControls } from 'framer-motion';

export const useAnimatedMount = (isVisible: boolean) => {
  const [shouldRender, setShouldRender] = useState(false);
  const controls = useAnimationControls();

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      controls.start('visible');
    } else {
      controls.start('exit').then(() => {
        setShouldRender(false);
      });
    }
  }, [isVisible, controls]);

  return { shouldRender, controls };
};