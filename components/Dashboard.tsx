
import React, { useMemo, useState } from 'react';
import { MoodLogEntry, HealthMetric, AIInsight, Mood } from '../types';
import { MOOD_CONFIG, ICONS, HedgehogIP, StressBar } from '../constants';
import DailyTasks from './DailyTasks';
import ChatWithXiaoning from './ChatWithXiaoning';
import { setDailyChatDone, getDailyChatDone, getDailyRelaxDone } from '../lib/dailyTaskStorage';
import { getConsecutiveDays } from '../lib/streak';

type TabId = 'dashboard' | 'relax' | 'health';

interface DashboardProps {
  moodLogs: MoodLogEntry[];
  healthData: HealthMetric[];
  onTabChange: (tab: TabId) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ moodLogs, healthData, onTabChange }) => {
  const [showChat, setShowChat] = useState(false);
  const latestHR = useMemo(() => {
    if (healthData.length === 0) return null;
    return healthData[healthData.length - 1].heartRate;
  }, [healthData]);

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
    if (avgStress <= 30) return { text: "狀態優秀", sub: "51ms", color: "text-emerald-500" };
    if (avgStress <= 60) return { text: "輕鬆平靜", sub: "42ms", color: "text-cyan-500" };
    if (avgStress <= 85) return { text: "感到焦慮", sub: "28ms", color: "text-amber-500" };
    return { text: "壓力過載", sub: "12ms", color: "text-rose-500" };
  }, [avgStress]);

  const insights: AIInsight[] = useMemo(() => {
    const list: AIInsight[] = [
      {
        title: "每日專注力",
        description: "你的專注力正處於峰值。現在是進行深度工作的最佳時機。",
        type: 'advice'
      },
      {
        title: "睡眠趨勢",
        description: "監測到持續 7 小時以上的深度睡眠。請保持這個節奏！",
        type: 'positive'
      }
    ];

    if (avgStress > 80) {
      list.unshift({
        title: "壓力預警",
        description: "當前狀態提示壓力較高，小夥伴建議先做 5 分鐘森林漫步放鬆一下。",
        type: 'warning'
      });
    }

    return list;
  }, [avgStress]);

  const islandWeather = useMemo(() => {
    if (avgStress <= 30) return { label: '晴朗', emoji: '☀️', bg: 'from-amber-100/50 to-violet-100/30' };
    if (avgStress <= 60) return { label: '多雲', emoji: '⛅', bg: 'from-slate-100/50 to-violet-100/30' };
    if (avgStress <= 85) return { label: '陰天', emoji: '☁️', bg: 'from-slate-200/50 to-rose-100/30' };
    return { label: '需要放鬆', emoji: '🌧️', bg: 'from-rose-100/50 to-violet-100/30' };
  }, [avgStress]);

  const todayEnergy = [getDailyChatDone(), getDailyRelaxDone()].filter(Boolean).length;
  const streak = getConsecutiveDays(moodLogs);

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-700">
      {showChat && (
        <ChatWithXiaoning moodLogs={moodLogs} onBack={() => setShowChat(false)} />
      )}

      <section className={`rounded-[2.5rem] p-5 border border-violet-100/40 bg-gradient-to-br ${islandWeather.bg}`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#7c6ba8' }}>寧靜島</span>
          <span className="text-2xl" title={islandWeather.label}>{islandWeather.emoji}</span>
        </div>
        <p className="text-slate-600 text-xs mt-1 font-medium">島上天氣反映你的內心狀態 · {islandWeather.label}</p>
        <p className="text-slate-500 text-xs mt-2 font-bold">今日寧靜能量：{todayEnergy}/2</p>
        {todayEnergy === 2 && (
          <p className="text-emerald-600 text-xs mt-1 font-black">今日任務全完成！島上會慢慢變美。</p>
        )}
        {streak >= 3 && (
          <p className="text-violet-600 text-xs mt-1 font-black">連續 {streak} 天記錄，小寧很開心～</p>
        )}
      </section>

      <section className="glass-warm rounded-[2.5rem] p-8 text-center relative overflow-hidden flex flex-col items-center border border-violet-100/40">
        <div className="absolute top-0 right-0 p-6">
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#9b87c4' }}>寧靜島 · 小寧</span>
        </div>
        
        <p className="text-slate-500 text-sm font-medium mb-4">嗨，你今天的狀態</p>
        
        <button 
          onClick={() => {
            const messages = [
              '今天也要加油哦！🌸',
              '小寧一直陪著你呢 💜',
              '深呼吸，放輕鬆～',
              '你做得很棒！✨',
              '記得休息一下喔 🌿'
            ];
            const msg = messages[Math.floor(Math.random() * messages.length)];
            alert(msg);
          }}
          className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <HedgehogIP stressLevel={avgStress} size={160} />
        </button>
        
        <div className="mt-6 space-y-1">
          <h2 className={`text-4xl font-black tracking-tight ${statusInfo.color}`}>
            {statusInfo.text} <span className="text-xl opacity-60">· {statusInfo.sub}</span>
          </h2>
        </div>

        <div className="w-full max-w-[240px] mt-8">
          <StressBar value={avgStress} />
          <div className="flex justify-between mt-2 px-1 text-[10px] font-black text-slate-300 uppercase tracking-tighter">
            <span>壓力過載</span>
            <span>身心平衡</span>
            <span>狀態優秀</span>
          </div>
        </div>

        <button
          onClick={() => { setDailyChatDone(); setShowChat(true); }}
          className="mt-6 w-full py-3 rounded-2xl font-bold text-white shadow-lg"
          style={{ background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' }}
        >
          和小寧聊聊
        </button>
      </section>

      <DailyTasks
        onGoChat={() => { setDailyChatDone(); setShowChat(true); }}
        onGoRelax={() => onTabChange('relax')}
      />

      {moodStats && (
        <section className="rounded-[2.5rem] p-6 text-white flex items-center justify-between shadow-lg animate-in slide-in-from-left duration-500 delay-200" style={{ background: 'linear-gradient(135deg, #9b87c4 0%, #7c6ba8 100%)' }}>
          <div className="space-y-1">
            <span className="text-[10px] font-black opacity-80 uppercase tracking-widest">近期心情</span>
            <h4 className="text-xl font-black">持續{MOOD_CONFIG[moodStats].label}</h4>
            <p className="text-[10px] opacity-90 leading-tight max-w-[150px]">根據最近 10 次心情記錄</p>
          </div>
          <div className="text-5xl drop-shadow-lg">{MOOD_CONFIG[moodStats].emoji}</div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-warm rounded-[2rem] p-5 flex items-center gap-4 border border-violet-100/30">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(216, 204, 235, 0.5)', color: '#7c6ba8' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">即時心率</p>
            <p className="text-lg font-black text-slate-800">{latestHR ?? '--'} <span className="text-xs font-normal opacity-40">bpm</span></p>
          </div>
        </div>
        <div className="glass-warm rounded-[2rem] p-5 flex items-center gap-4 border border-violet-100/30">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(230, 220, 250, 0.6)', color: '#8b7ab8' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20"/><path d="M10 4V2"/><path d="M14 4V2"/><path d="M12 11V6"/><path d="M12 20v-5"/><path d="M19 20V10c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v10"/><path d="M9 20v-5h6v5"/></svg>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">睡眠質量</p>
            <p className="text-lg font-black text-slate-800">92 <span className="text-xs font-normal opacity-40">%</span></p>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="font-black text-slate-800 px-2 uppercase text-xs tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#9b87c4' }}></div>
          小夥伴建議
        </h3>
        {insights.map((insight, idx) => (
          <div 
            key={idx} 
            className={`p-5 rounded-[2rem] border flex gap-4 animate-in slide-in-from-bottom duration-500 ${
              insight.type === 'warning' ? 'bg-rose-50/80 border-rose-100' : 
              insight.type === 'positive' ? 'bg-emerald-50/80 border-emerald-100' : 
              'glass-warm border-violet-100/40'
            }`}
          >
            <div className={`p-2.5 rounded-2xl h-fit ${
              insight.type === 'warning' ? 'bg-rose-100 text-rose-600' : 
              insight.type === 'positive' ? 'bg-emerald-100 text-emerald-600' : 
              'bg-violet-100 text-violet-700'
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
