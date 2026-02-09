
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

  return (
    <div className="p-6 space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/60 glass rounded-3xl p-4 border-none text-center shadow-sm">
          <span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest">今日步数</span>
          <span className="text-xl font-black text-slate-800">8.4k</span>
        </div>
        <div className="bg-white/60 glass rounded-3xl p-4 border-none text-center shadow-sm">
          <span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest">当前心率</span>
          <span className="text-xl font-black text-red-500">72</span>
        </div>
        <div className="bg-white/60 glass rounded-3xl p-4 border-none text-center shadow-sm">
          <span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest">睡眠时长</span>
          <span className="text-xl font-black text-indigo-600">7.5h</span>
        </div>
      </div>

      <div className="bg-white/60 glass rounded-[3rem] p-8 shadow-sm h-[320px]">
        <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
          活动量趋势
        </h3>
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 900}} />
            <Tooltip 
              contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900 }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
            />
            <Area type="monotone" dataKey="steps" stroke="#6366f1" fillOpacity={1} fill="url(#colorSteps)" strokeWidth={4} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white/60 glass rounded-[3rem] p-8 shadow-sm h-[320px]">
        <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-red-400 rounded-full"></span>
          静息心率监测
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
