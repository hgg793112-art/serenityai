
import React from 'react';
import { HealthMetric } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface HealthTrendsProps {
  healthData: HealthMetric[];
}

const HealthTrends: React.FC<HealthTrendsProps> = ({ healthData }) => {
  const chartData = healthData.map(d => ({
    ...d,
    date: new Date(d.timestamp).toLocaleDateString('zh-CN', { weekday: 'short' })
  }));

  const latestData = healthData.length > 0 ? healthData[healthData.length - 1] : null;
  const todaySteps = latestData?.steps ? (latestData.steps / 1000).toFixed(1) + 'k' : '--';
  const currentHR = latestData?.heartRate ?? '--';
  const sleepHours = latestData?.sleepHours ? latestData.sleepHours.toFixed(1) + 'h' : '--';

  return (
    <div className="p-6 space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-warm rounded-2xl p-4 border border-violet-100/30 text-center shadow-sm">
          <span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest">今日步數</span>
          <span className="text-xl font-black text-slate-800">{todaySteps}</span>
        </div>
        <div className="glass-warm rounded-2xl p-4 border border-violet-100/30 text-center shadow-sm">
          <span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest">即時心率</span>
          <span className="text-xl font-black text-red-500">{currentHR}</span>
        </div>
        <div className="glass-warm rounded-2xl p-4 border border-violet-100/30 text-center shadow-sm">
          <span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest">睡眠時長</span>
          <span className="text-xl font-black" style={{ color: '#7c6ba8' }}>{sleepHours}</span>
        </div>
      </div>

      <div className="glass-warm rounded-[2.5rem] p-8 shadow-sm h-[320px] border border-violet-100/40">
        <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 rounded-full" style={{ background: '#9b87c4' }}></span>
          活動量趨勢
        </h3>
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9b87c4" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#9b87c4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 900}} />
            <Tooltip 
              contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900 }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
            />
            <Area type="monotone" dataKey="steps" stroke="#7c6ba8" fillOpacity={1} fill="url(#colorSteps)" strokeWidth={4} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-warm rounded-[2.5rem] p-8 shadow-sm h-[320px] border border-violet-100/40">
        <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-red-400 rounded-full"></span>
          靜息心率
        </h3>
        <ResponsiveContainer width="100%" height="80%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 900}} />
            <Tooltip 
              contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900 }}
            />
            <Line type="monotone" dataKey="heartRate" stroke="#f87171" strokeWidth={4} dot={{ r: 5, fill: '#f87171', strokeWidth: 3, stroke: '#fff' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HealthTrends;
