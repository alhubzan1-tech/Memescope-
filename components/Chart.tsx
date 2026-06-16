'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartProps {
  data?: any[];
  livePrice?: number;
}

export default function Chart({ data = [], livePrice = 0 }: ChartProps) {
  const [chartData, setChartData] = useState(data);

  useEffect(() => {
    if (data.length > 0) {
      setChartData(data);
    }
  }, [data]);

  useEffect(() => {
    if (!livePrice) return;

    const interval = setInterval(() => {
      setChartData((prev) => {
        const updated = [...prev];
        if (updated.length > 0) {
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = {
            ...last,
            price: livePrice + (Math.random() - 0.5) * 0.0001,
          };
        }
        return updated;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [livePrice]);

  if (chartData.length === 0) {
    return (
      <div className="h-64 bg-[#1a1f2e] rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No chart data</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1f2e] rounded-lg p-4 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3e" />
          <XAxis dataKey="time" stroke="#666" tick={{ fontSize: 12 }} />
          <YAxis stroke="#666" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1f2e',
              border: '1px solid #2a2f3e',
              borderRadius: '8px',
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#00d084"
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
