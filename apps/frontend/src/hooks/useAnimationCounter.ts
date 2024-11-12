// hooks/useAnimatedCounter.ts
import { useState, useEffect } from 'react';
import { animate } from 'framer-motion';

export const useAnimatedCounter = (
  value: number,
  duration: number = 1,
  delay: number = 0
) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      delay,
      onUpdate: (v) => setDisplayValue(Math.round(v)),
    });

    return () => controls.stop();
  }, [value, duration, delay]);

  return displayValue;
};
