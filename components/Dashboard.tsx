
import React, { useMemo } from 'react';
import { MoodLogEntry, HealthMetric, AIInsight, Mood } from '../types';
import { MOOD_CONFIG, ICONS, KolaIP, StressBar } from '../constants';

interface DashboardProps {
  moodLogs: MoodLogEntry[];
  healthData: HealthMetric[];
}

const Dashboard: React.FC<DashboardProps> = ({ moodLogs, healthData }) => {
  const avgStress = useMemo(() => {
    if (moodLogs.length === 0) return 25; 
    const recent = moodLogs.slice(0, 5);
    return Math.round(recent.reduce((acc, log) => acc + log.stressLevel, 0) / recent.length);
  }, [moodLogs]);

  const moodStats = useMemo(() => {
    if (moodLogs.length === 0) return null;
    const stats: Record<string, number> = {};
    moodLogs.slice(0, 10).forEach(log => {
      stats[log.mood] = (stats[log.mood] || 0) + 1;
    });
    // Find the most frequent mood
    const topMood = Object.entries(stats).sort((a, b) => b[1] - a[1])[0][0] as Mood;
    return topMood;
  }, [moodLogs]);

  const statusInfo = useMemo(() => {
    if (avgStress <= 30) return { text: "状态优秀", sub: "51ms", color: "text-emerald-500" };
    if (avgStress <= 60) return { text: "轻松平静", sub: "42ms", color: "text-cyan-500" };
    if (avgStress <= 85) return { text: "感到焦虑", sub: "28ms", color: "text-amber-500" };
    return { text: "压力过载", sub: "12ms", color: "text-rose-500" };
  }, [avgStress]);

  const insights: AIInsight[] = useMemo(() => {
    const list: AIInsight[] = [
      {
        title: "每日专注力",
        description: "你的专注力正处于峰值。现在是进行深度工作的最佳时机。",
        type: 'advice'
      },
      {
        title: "睡眠趋势",
        description: "监测到持续 7 小时以上的深度睡眠。请保持这个节奏！",
        type: 'positive'
      }
    ];

    if (avgStress > 80) {
      list.unshift({
        title: "压力预警",
        description: "当前的生物识别数据提示压力过载。Kola 建议进行 5 分钟森林漫步。",
        type: 'warning'
      });
    }

    return list;
  }, [avgStress]);

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-700">
      <section className="bg-white/40 glass rounded-[3rem] p-8 text-center relative overflow-hidden flex flex-col items-center">
        <div className="absolute top-0 right-0 p-6">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HRV 实时状态</span>
        </div>
        
        <p className="text-slate-400 text-sm font-medium mb-4">嗨 Alex，你今日压力状态为</p>
        
        <KolaIP stressLevel={avgStress} size={160} />
        
        <div className="mt-6 space-y-1">
          <h2 className={`text-4xl font-black tracking-tight ${statusInfo.color}`}>
            {statusInfo.text} <span className="text-xl opacity-60">· {statusInfo.sub}</span>
          </h2>
        </div>

        <div className="w-full max-w-[240px] mt-8">
          <StressBar value={avgStress} />
          <div className="flex justify-between mt-2 px-1 text-[10px] font-black text-slate-300 uppercase tracking-tighter">
            <span>压力过载</span>
            <span>身心平衡</span>
            <span>状态优秀</span>
          </div>
        </div>
      </section>

      {moodStats && (
        <section className="bg-indigo-600 rounded-[2.5rem] p-6 text-white flex items-center justify-between shadow-xl shadow-indigo-100 animate-in slide-in-from-left duration-500 delay-200">
          <div className="space-y-1">
            <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">近期心情基调</span>
            <h4 className="text-xl font-black">持续{MOOD_CONFIG[moodStats].label}</h4>
            <p className="text-[10px] opacity-80 leading-tight max-w-[150px]">基于您最近 10 次心情快照分析</p>
          </div>
          <div className="text-5xl drop-shadow-lg">
            {MOOD_CONFIG[moodStats].emoji}
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/60 glass rounded-[2.5rem] p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">实时心率</p>
            <p className="text-lg font-black text-slate-800">72 <span className="text-xs font-normal opacity-40">bpm</span></p>
          </div>
        </div>
        <div className="bg-white/60 glass rounded-[2.5rem] p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-500 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20"/><path d="M10 4V2"/><path d="M14 4V2"/><path d="M12 11V6"/><path d="M12 20v-5"/><path d="M19 20V10c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v10"/><path d="M9 20v-5h6v5"/></svg>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">睡眠质量</p>
            <p className="text-lg font-black text-slate-800">92 <span className="text-xs font-normal opacity-40">%</span></p>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="font-black text-slate-800 px-2 uppercase text-xs tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
          AI 智能建议
        </h3>
        {insights.map((insight, idx) => (
          <div 
            key={idx} 
            className={`p-5 rounded-[2rem] border-none shadow-sm flex gap-4 animate-in slide-in-from-bottom duration-500 ${
              insight.type === 'warning' ? 'bg-rose-50' : 
              insight.type === 'positive' ? 'bg-emerald-50' : 
              'bg-indigo-50'
            }`}
          >
            <div className={`p-2.5 rounded-2xl h-fit ${
              insight.type === 'warning' ? 'bg-rose-100 text-rose-600' : 
              insight.type === 'positive' ? 'bg-emerald-100 text-emerald-600' : 
              'bg-indigo-100 text-indigo-600'
            }`}>
              {insight.type === 'warning' ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg> : <ICONS.Brain />}
            </div>
            <div>
              <h5 className="font-black text-slate-800 text-sm">{insight.title}</h5>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{insight.description}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Dashboard;
