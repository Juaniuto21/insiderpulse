import React from 'react';
import { ChartDataPoint, TimeRange } from '../types';
import { Settings2, ChevronDown } from './IconComponents';

interface StockChartProps {
  data: ChartDataPoint[];
  activeRange: TimeRange;
  onSetRange: (range: TimeRange) => void;
}

const StockChart: React.FC<StockChartProps> = ({ data, activeRange, onSetRange }) => {
  const timeRanges: { key: TimeRange; label: string }[] = [
    { key: "1D", label: "1D" },
    { key: "5D", label: "5D" },
    { key: "1M", label: "1M" },
    { key: "6M", label: "6M" },
    { key: "AA", label: "AA" },
    { key: "1A", label: "1A" },
    { key: "5A", label: "5A" },
    { key: "Todo", label: "Todo" },
  ];

  const renderChartContainer = (content: React.ReactNode) => (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-4">
      <div className="flex items-center justify-between flex-wrap gap-y-2 mb-4">
          <div className="flex items-center gap-1 flex-wrap">
              {timeRanges.map(range => (
                  <button key={range.key} onClick={() => onSetRange(range.key)} className={`px-3 py-1 text-sm rounded transition-colors ${range.key === activeRange ? 'bg-emerald-500/20 text-white font-semibold' : 'text-gray-400 hover:bg-white/10'}`}>
                      {range.label}
                  </button>
              ))}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                  <label htmlFor="key-events-toggle" className="cursor-pointer">Eventos clave</label>
                  <div className="bg-gray-700 rounded-full w-10 h-5 relative cursor-pointer">
                      <input type="checkbox" id="key-events-toggle" className="sr-only peer" defaultChecked />
                      <div className="w-4 h-4 bg-white rounded-full absolute top-[2px] left-[2px] transition-transform peer-checked:transform peer-checked:translate-x-5 peer-checked:bg-emerald-400"></div>
                  </div>
              </div>
               <button className="hover:text-white transition-colors" aria-label="Tipo de gráfico"><ChevronDown className="w-5 h-5"/></button>
               <button className="hover:text-white transition-colors" aria-label="Configuración de gráfico"><Settings2 className="w-5 h-5"/></button>
          </div>
      </div>
      {content}
    </div>
  );

  if (!data || data.length < 2) {
    return renderChartContainer(
      <div className="h-[450px] flex items-center justify-center text-gray-500">
        No hay datos de gráfico disponibles para este rango de tiempo.
      </div>
    );
  }
  
  const lastPoint = data[data.length - 1];
  const firstPoint = data[0];
  const isPositive = lastPoint.price >= firstPoint.price;
  const chartColor = isPositive ? '#34D399' : '#F87171';
  const chartGradientColor = isPositive ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)';
  const lastPriceRectColor = isPositive ? '#10B981' : '#EF4444';

  const width = 800;
  const height = 450;
  const margin = { top: 20, right: 65, bottom: 80, left: 60 };
  const chartHeight = height - margin.top - margin.bottom;
  const chartWidth = width - margin.left - margin.right;
  const volumeHeight = 50;
  const priceChartHeight = chartHeight - volumeHeight - 20;

  const prices = data.map(d => d.price);
  const volumes = data.map(d => d.volume || 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const maxVolume = Math.max(...volumes);

  const getX = (index: number) => margin.left + (index / (data.length - 1)) * chartWidth;
  const getY = (price: number) => margin.top + priceChartHeight - ((price - minPrice) / (maxPrice - minPrice)) * priceChartHeight;

  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.price)}`).join(' ');

  const areaPath = `${path} L ${getX(data.length - 1)} ${margin.top + priceChartHeight} L ${margin.left} ${margin.top + priceChartHeight} Z`;
  
  const yAxisTicks = Array.from({ length: 5 }, (_, i) => minPrice + (i / 4) * (maxPrice - minPrice));

  const getXAxisLabels = () => {
      if (data.length <= 1) return [];

      if (activeRange === '1D') {
          return data.filter((_, i) => i % 2 === 0).map((d, i, arr) => ({ label: d.time, x: getX(i * 2) }));
      }
      
      const maxLabels = 7;
      const step = Math.max(1, Math.floor(data.length / maxLabels));
      const labels = [];
      for (let i = 0; i < data.length; i += step) {
          let label = data[i].time;
          const date = new Date(label);
          if (activeRange === '5A' || activeRange === 'Todo') {
              label = date.getFullYear().toString();
          } else if (activeRange === '1A' || activeRange === 'AA' || activeRange === '6M') {
              label = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
          } else if (activeRange === '1M') {
             label = date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
          }
          labels.push({ label, x: getX(i) });
      }
      return labels;
  };
  const xAxisLabels = getXAxisLabels();

  return renderChartContainer(
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={chartGradientColor} stopOpacity="0.5" />
          <stop offset="100%" stopColor={chartGradientColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y-axis labels and grid lines */}
      {yAxisTicks.map((tick, i) => (
          <g key={i} className="text-gray-500">
              <text x={margin.left - 10} y={getY(tick)} textAnchor="end" alignmentBaseline="middle" fill="currentColor" fontSize="12">{tick.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</text>
              <line x1={margin.left} y1={getY(tick)} x2={width - margin.right} y2={getY(tick)} stroke="#374151" strokeDasharray="2,2" />
          </g>
      ))}

      {/* X-axis labels */}
      {xAxisLabels.map(({ label, x }, i) => (
           <text key={i} x={x} y={height - margin.bottom + 20} textAnchor="middle" fill="#718096" fontSize="12">{label}</text>
      ))}

      {/* Price Area */}
      <path d={areaPath} fill="url(#areaGradient)" />
      {/* Price Line */}
      <path d={path} fill="none" stroke={chartColor} strokeWidth="2" />

      {/* Current Price Marker */}
      <g transform={`translate(${getX(data.length - 1)}, ${getY(lastPoint.price)})`}>
        <line x1="0" y1="0" x2={-(chartWidth)} y2="0" stroke={chartColor} strokeDasharray="3,3" />
        <circle r="5" fill="#A78BFA" stroke="white" strokeWidth="2" />
      </g>
      <rect x={getX(data.length - 1)} y={getY(lastPoint.price)-10} width={margin.right} height="20" fill={lastPriceRectColor}/>
      <text x={getX(data.length - 1)+5} y={getY(lastPoint.price)+4} fill="white" fontSize="12" fontWeight="bold">{lastPoint.price.toFixed(2)}</text>


      {/* Volume Bars */}
      {data.map((d, i) => {
        const barHeight = maxVolume > 0 ? ((d.volume || 0) / maxVolume) * volumeHeight : 0;
        return (
          <rect
            key={i}
            x={getX(i) - (chartWidth / (data.length - 1) / 2) + 2}
            y={height - margin.bottom - barHeight}
            width={Math.max(1, (chartWidth / (data.length - 1)) - 4)}
            height={barHeight}
            fill="#4A5568"
          />
        );
      })}
    </svg>
  );
};

export default StockChart;