import React from 'react';

interface GrowthChartProps {
  data: { year: number; balance: number }[];
}

const GrowthChart: React.FC<GrowthChartProps> = ({ data }) => {
  if (!data || data.length < 2) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        Ajusta los valores para ver la proyección.
      </div>
    );
  }

  const chartColor = '#34D399';
  const chartGradientColor = 'rgba(52, 211, 153, 0.3)';

  const width = 800;
  const height = 320;
  const margin = { top: 20, right: 20, bottom: 40, left: 70 };
  const chartHeight = height - margin.top - margin.bottom;
  const chartWidth = width - margin.left - margin.right;

  const balances = data.map(d => d.balance);
  const minBalance = 0; // Always start y-axis at 0
  const maxBalance = Math.max(...balances);

  const getX = (year: number) => {
    const startYear = data[0].year;
    const totalYears = data[data.length - 1].year - startYear;
    return margin.left + ((year - startYear) / totalYears) * chartWidth;
  };
  const getY = (balance: number) => margin.top + chartHeight - ((balance - minBalance) / (maxBalance - minBalance)) * chartHeight;

  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.year)} ${getY(d.balance)}`).join(' ');
  const areaPath = `${path} L ${getX(data[data.length - 1].year)} ${margin.top + chartHeight} L ${margin.left} ${margin.top + chartHeight} Z`;
  
  const yAxisTicksCount = 5;
  const yAxisTicks = Array.from({ length: yAxisTicksCount + 1 }, (_, i) => (maxBalance / yAxisTicksCount) * i);
  const xAxisTicks = data.filter((_, i) => data.length < 10 || i % Math.floor(data.length / 5) === 0);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <defs>
        <linearGradient id="growthAreaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={chartGradientColor} stopOpacity="0.8" />
          <stop offset="100%" stopColor={chartGradientColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y-axis labels and grid lines */}
      {yAxisTicks.map((tick, i) => (
          <g key={i} className="text-gray-500">
              <text x={margin.left - 10} y={getY(tick)} textAnchor="end" alignmentBaseline="middle" fill="currentColor" fontSize="12">
                  ${(tick / 1000).toFixed(0)}k
              </text>
              <line x1={margin.left} y1={getY(tick)} x2={width - margin.right} y2={getY(tick)} stroke="#2D3748" strokeDasharray="2,2" />
          </g>
      ))}

      {/* X-axis labels (years) */}
      {xAxisTicks.map(({ year }, i) => (
           <text key={i} x={getX(year)} y={height - margin.bottom + 20} textAnchor="middle" fill="#718096" fontSize="12">{year}</text>
      ))}

      {/* Price Area and Line */}
      <path d={areaPath} fill="url(#growthAreaGradient)" />
      <path d={path} fill="none" stroke={chartColor} strokeWidth="2.5" />
    </svg>
  );
};

export default GrowthChart;