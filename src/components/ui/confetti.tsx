'use client';

import React from 'react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-use';

export const Confetti = () => {
  const { width, height } = useWindowSize();

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <ReactConfetti
        width={width}
        height={height}
        numberOfPieces={300}
        recycle={false}
        gravity={0.2}
        initialVelocityY={10}
        tweenDuration={5000}
        colors={['#2563eb', '#60a5fa', '#93c5fd', '#3b82f6', '#1d4ed8']}
      />
    </div>
  );
};