
import React, { useMemo, useState } from 'react';
import { MoodLogEntry, HealthMetric } from '../types';
import { HedgehogIP, StressBar } from '../constants';
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


  const wellnessScore = wellnessResult.score;

  const statusInfo = useMemo(() => {
    if (wellnessScore > 70) return { text: "状态优秀", color: "text-emerald-500" };
    if (wellnessScore > 35) return { text: "身心平稳", color: "text-cyan-500" };
    return { text: "压力过载", color: "text-rose-500" };
  }, [wellnessScore]);

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


    </div>
  );
};

export default Dashboard;
