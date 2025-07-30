import React from 'react';

interface SparklineProps {
  data: number[];
  positive: boolean;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

const Sparkline: React.FC<SparklineProps> = ({
  data = [],
  positive = true,
  width = 60,
  height = 20,
  strokeWidth = 1.5
}) => {
  if (data.length < 2) {
    return null;
  }

  const color = positive ? '#34D399' : '#F87171'; // emerald-400 or red-400

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  // Handle case where all data points are the same
  if (range === 0) {
    const y = height / 2;
    const path = `M 0,${y} L ${width},${y}`;
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <path d={path} stroke={color} strokeWidth={strokeWidth} fill="none" />
      </svg>
    );
  }

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / range) * height;
    return `${x},${y}`;
  });

  const path = `M ${points.join(' L ')}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={path} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

export default Sparkline;