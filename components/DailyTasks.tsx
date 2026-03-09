import React from 'react';
import { ICONS } from '../constants';
import { getDailyChatDone, getDailyRelaxDone } from '../lib/dailyTaskStorage';

interface DailyTasksProps {
  onGoChat: () => void;
  onGoRelax: () => void;
  onGoCheckin?: () => void;
}

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
);

const DailyTasks: React.FC<DailyTasksProps> = ({ onGoChat, onGoRelax, onGoCheckin }) => {
  const chatDone = getDailyChatDone();
  const relaxDone = getDailyRelaxDone();
  const checkinDone = !!localStorage.getItem('mood_checkin_' + new Date().toISOString().slice(0, 10));

  const entries = [
    { id: 'chat' as const, label: '和小宁聊聊', onGo: onGoChat, Icon: ICONS.Chat, done: chatDone },
    { id: 'relax' as const, label: '去放松一下', onGo: onGoRelax, Icon: ICONS.Relax, done: relaxDone },
    { id: 'checkin' as const, label: '记录今天的心情', onGo: onGoCheckin ?? (() => {}), Icon: ICONS.Lotus, done: checkinDone },
  ];

  return (
    <section className="glass-warm rounded-[2.5rem] p-6 border border-violet-100/40">
      <div className="mb-4">
        <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#9b87c4' }}></span>
          小宁推荐
        </h3>
      </div>
      <div className="space-y-3">
        {entries.map((t) => (
          <button
            key={t.id}
            onClick={t.onGo}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
              t.done
                ? 'border-emerald-200/60 bg-emerald-50/40'
                : 'border-violet-100/30 glass-warm hover:border-violet-200'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 [&>svg]:w-5 [&>svg]:h-5 ${
              t.done ? 'bg-emerald-100 text-emerald-600' : 'bg-violet-100 text-violet-600'
            }`}>
              {t.done ? <CheckIcon /> : <t.Icon />}
            </div>
            <span className={`flex-1 text-sm font-black ${t.done ? 'text-emerald-600 line-through' : 'text-slate-800'}`}>
              {t.label}
            </span>
            {t.done && <span className="text-[10px] font-black text-emerald-500">已完成</span>}
          </button>
        ))}
      </div>
    </section>
  );
};

export default DailyTasks;
