import React from 'react';
import { MoodLogEntry } from '../types';
import { getDailyChatDone, getDailyRelaxDone } from '../lib/dailyTaskStorage';

interface DailyTasksProps {
  moodLogs: MoodLogEntry[];
  onGoMood: () => void;
  onGoChat: () => void;
  onGoRelax: () => void;
}

function hasMoodLogToday(logs: MoodLogEntry[]): boolean {
  const today = new Date().toDateString();
  return logs.some(log => new Date(log.timestamp).toDateString() === today);
}

const DailyTasks: React.FC<DailyTasksProps> = ({ moodLogs, onGoMood, onGoChat, onGoRelax }) => {
  const moodDone = hasMoodLogToday(moodLogs);
  const chatDone = getDailyChatDone();
  const relaxDone = getDailyRelaxDone();
  const total = 3;
  const done = [moodDone, chatDone, relaxDone].filter(Boolean).length;

  const tasks = [
    { id: 'mood', label: '記錄今天的心情', done: moodDone, onGo: onGoMood },
    { id: 'chat', label: '和小寧聊一聊', done: chatDone, onGo: onGoChat },
    { id: 'relax', label: '完成一次放鬆', done: relaxDone, onGo: onGoRelax },
  ];

  return (
    <section className="glass-warm rounded-[2.5rem] p-6 border border-violet-100/40">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#9b87c4' }}></span>
          今日任務
        </h3>
        <span className="text-xs font-black text-slate-400">{done}/{total}</span>
      </div>
      <div className="space-y-3">
        {tasks.map((t) => (
          <button
            key={t.id}
            onClick={() => !t.done && t.onGo()}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
              t.done ? 'bg-emerald-50/80 border-emerald-100' : 'glass-warm border-violet-100/30 hover:border-violet-200'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              t.done ? 'bg-emerald-200 text-emerald-700' : 'bg-violet-100 text-violet-600'
            }`}>
              {t.done ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              ) : (
                <span className="text-sm font-black">·</span>
              )}
            </div>
            <span className={`flex-1 text-sm font-black ${t.done ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default DailyTasks;
