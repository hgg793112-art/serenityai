
import React, { useMemo, useState } from 'react';
import { MoodLogEntry, HealthMetric, AIInsight } from '../types';
import { ICONS, HedgehogIP, StressBar } from '../constants';
import DailyTasks from './DailyTasks';
import ChatWithXiaoning from './ChatWithXiaoning';
import { setDailyChatDone } from '../lib/dailyTaskStorage';

import type { WellnessResult } from '../lib/wellnessEngine';

type TabId = 'dashboard' | 'relax' | 'health';

interface DashboardProps {
  moodLogs: MoodLogEntry[];
  healthData: HealthMetric[];
  onTabChange: (tab: TabId) => void;
  wellnessResult: WellnessResult;
  onOpenCheckin?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ moodLogs, healthData, onTabChange, wellnessResult, onOpenCheckin }) => {
  const [showChat, setShowChat] = useState(false);
  const latestHR = useMemo(() => {
    if (healthData.length === 0) return null;
    return healthData[healthData.length - 1].heartRate;
  }, [healthData]);


  const wellnessScore = wellnessResult.score;

  const statusInfo = useMemo(() => {
    if (wellnessScore > 70) return { text: "状态优秀", color: "text-emerald-500" };
    if (wellnessScore > 35) return { text: "身心平稳", color: "text-cyan-500" };
    return { text: "压力过载", color: "text-rose-500" };
  }, [wellnessScore]);

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

    if (wellnessResult.suggestion) {
      list.unshift({
        title: wellnessScore <= 35 ? "压力预警" : "小伙伴提醒",
        description: wellnessResult.suggestion,
        type: wellnessScore <= 35 ? 'warning' : 'advice',
      });
    } else if (wellnessScore <= 35) {
      list.unshift({
        title: "压力预警",
        description: "当前状态提示压力较高，小伙伴建议先做 5 分钟森林漫步放松一下。",
        type: 'warning'
      });
    }

    return list;
  }, [wellnessScore, wellnessResult.suggestion]);



  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-700">
      {showChat && (
        <ChatWithXiaoning moodLogs={moodLogs} onBack={() => setShowChat(false)} />
      )}


      <section className="glass-warm rounded-[2.5rem] p-8 text-center relative overflow-hidden flex flex-col items-center border border-violet-100/40">
        <p className="text-slate-500 text-sm font-medium mb-4">嗨，你今天的状态</p>
        
        <button 
          onClick={() => {
            const messages = [
              '今天也要加油哦！🌸',
              '小宁一直陪著你呢 💜',
              '深呼吸，放轻松～',
              '你做得很棒！✨',
              '记得休息一下喔 🌿'
            ];
            const msg = messages[Math.floor(Math.random() * messages.length)];
            alert(msg);
          }}
          className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <HedgehogIP stressLevel={wellnessScore} size={160} />
        </button>
        
        <div className="mt-6 space-y-1">
          <h2 className={`text-4xl font-black tracking-tight ${statusInfo.color}`}>
            {statusInfo.text}
          </h2>
        </div>

        <div className="w-full max-w-[240px] mt-8">
          <StressBar value={wellnessScore} />
          <div className="flex justify-between mt-2 px-1 text-[10px] font-black text-slate-300 uppercase tracking-tighter">
            <span>压力过载</span>
            <span>身心平衡</span>
            <span>状态优秀</span>
          </div>
        </div>

        <button
          onClick={() => { setDailyChatDone(); setShowChat(true); }}
          className="mt-6 w-full py-3 rounded-2xl font-bold text-white shadow-lg"
          style={{ background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' }}
        >
          和小宁聊聊
        </button>
      </section>

      <DailyTasks
        onGoChat={() => { setDailyChatDone(); setShowChat(true); }}
        onGoRelax={() => onTabChange('relax')}
        onGoCheckin={onOpenCheckin}
      />


      {latestHR !== null && (
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-warm rounded-[2rem] p-5 flex items-center gap-4 border border-violet-100/30">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(216, 204, 235, 0.5)', color: '#7c6ba8' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">即时心率</p>
              <p className="text-lg font-black text-slate-800">{latestHR} <span className="text-xs font-normal opacity-40">bpm</span></p>
            </div>
          </div>
          <div className="glass-warm rounded-[2rem] p-5 flex items-center gap-4 border border-violet-100/30">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(230, 220, 250, 0.6)', color: '#8b7ab8' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20"/><path d="M10 4V2"/><path d="M14 4V2"/><path d="M12 11V6"/><path d="M12 20v-5"/><path d="M19 20V10c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v10"/><path d="M9 20v-5h6v5"/></svg>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">睡眠时长</p>
              <p className="text-lg font-black text-slate-800">{healthData[healthData.length - 1]?.sleepHours?.toFixed(1) ?? '--'} <span className="text-xs font-normal opacity-40">h</span></p>
            </div>
          </div>
        </div>
      )}

      <section className="space-y-4">
        <h3 className="font-black text-slate-800 px-2 uppercase text-xs tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#9b87c4' }}></div>
          小伙伴建议
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
