import React, { useMemo } from 'react';
import { ICONS } from '../constants';
import { getDailyChatDone, getDailyRelaxDone } from '../lib/dailyTaskStorage';

interface DailyTasksProps {
  onGoChat: () => void;
  onGoRelax: () => void;
  onGoCheckin?: () => void;
}

const TASK_EMOJI: Record<string, string> = {
  chat: '💬',
  relax: '🌿',
  checkin: '📝',
};

const DailyTasks: React.FC<DailyTasksProps> = ({ onGoChat, onGoRelax, onGoCheckin }) => {
  const chatDone = getDailyChatDone();
  const relaxDone = getDailyRelaxDone();
  const checkinDone = !!localStorage.getItem('mood_checkin_' + new Date().toISOString().slice(0, 10));

  const entries = useMemo(() => [
    { id: 'chat' as const, label: '和小宁聊聊', onGo: onGoChat, Icon: ICONS.Chat, done: chatDone },
    { id: 'relax' as const, label: '去放松一下', onGo: onGoRelax, Icon: ICONS.Relax, done: relaxDone },
    { id: 'checkin' as const, label: '记录今天的心情', onGo: onGoCheckin ?? (() => {}), Icon: ICONS.Lotus, done: checkinDone },
  ], [onGoChat, onGoRelax, onGoCheckin, chatDone, relaxDone, checkinDone]);

  const doneCount = entries.filter(t => t.done).length;
  const totalEnergy = doneCount * 5;
  const maxEnergy = entries.length * 5;

  return (
    <section className="rounded-[2.5rem] p-6" style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)', border: '1px solid rgba(196,181,253,0.25)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-slate-800 text-xs tracking-widest flex items-center gap-2 uppercase">
          <span className="text-base">🏝️</span>
          岛上日常
        </h3>
        <span className="text-xs font-bold text-violet-500">
          今日能量 {totalEnergy}/{maxEnergy} ✨
        </span>
      </div>

      {/* Energy progress bar */}
      <div className="w-full h-2 rounded-full bg-violet-100/60 mb-5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${maxEnergy > 0 ? (totalEnergy / maxEnergy) * 100 : 0}%`,
            background: 'linear-gradient(90deg, #c4b5fd 0%, #a78bfa 50%, #8b5cf6 100%)',
          }}
        />
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {entries.map((t) => (
          <button
            key={t.id}
            onClick={t.onGo}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left ${
              t.done
                ? 'bg-violet-50/80'
                : 'bg-white/60 hover:bg-white/80'
            }`}
            style={{ border: 'none' }}
          >
            {/* Emoji icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg ${
              t.done ? 'bg-violet-100/60' : 'bg-violet-100'
            }`}>
              {TASK_EMOJI[t.id]}
            </div>

            {/* Label */}
            <span className={`flex-1 text-sm font-bold ${t.done ? 'text-violet-400' : 'text-slate-800'}`}>
              {t.label}
            </span>

            {/* Reward badge */}
            {t.done ? (
              <span className="text-[11px] font-bold text-violet-400 bg-violet-100/60 px-2.5 py-1 rounded-full whitespace-nowrap">
                已获得 +5✨
              </span>
            ) : (
              <span className="text-[11px] font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                +5 ✨
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
};

export default DailyTasks;
