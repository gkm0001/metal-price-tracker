
import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { HistoricalPoint, MetalType } from '../types';

interface MarketChartProps {
  data: HistoricalPoint[];
  metal: MetalType;
  currencySymbol: string;
}

const MarketChart: React.FC<MarketChartProps> = ({ data, metal, currencySymbol }) => {
  const mainColor = metal === 'gold' ? '#f6d365' : '#e2e8f0';

  return (
    <div className="w-full h-80 mt-6 bg-white/5 rounded-2xl p-4 glass">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={mainColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={mainColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            minTickGap={30}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={(val) => `${currencySymbol}${val.toLocaleString()}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
            itemStyle={{ color: mainColor }}
            formatter={(value: any) => [`${currencySymbol}${value.toLocaleString()}`, 'Price']}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={mainColor} 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MarketChart;
