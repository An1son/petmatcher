'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useState } from 'react';

export function SwipeCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = '',
}) {
  const [exitX, setExitX] = useState(0);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Visual indicators for swipe direction
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_, info) => {
    const threshold = 100;

    if (info.offset.x > threshold) {
      setExitX(500);
      onSwipeRight?.();
    } else if (info.offset.x < -threshold) {
      setExitX(-500);
      onSwipeLeft?.();
    }
  };

  return (
    <motion.div
      className={`absolute cursor-grab active:cursor-grabbing ${className}`}
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Like indicator */}
      <motion.div
        className="absolute top-8 left-8 z-10 rounded-lg border-4 border-green-500 px-4 py-2 text-2xl font-bold text-green-500 -rotate-12"
        style={{ opacity: likeOpacity }}
      >
        LIKE
      </motion.div>

      {/* Pass indicator */}
      <motion.div
        className="absolute top-8 right-8 z-10 rounded-lg border-4 border-red-500 px-4 py-2 text-2xl font-bold text-red-500 rotate-12"
        style={{ opacity: passOpacity }}
      >
        PASS
      </motion.div>

      {children}
    </motion.div>
  );
}
