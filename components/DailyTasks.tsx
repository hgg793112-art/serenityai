import React from 'react';
import { ICONS } from '../constants';

interface DailyTasksProps {
  onGoChat: () => void;
  onGoRelax: () => void;
}

const DailyTasks: React.FC<DailyTasksProps> = ({ onGoChat, onGoRelax }) => {
  const entries = [
    { id: 'chat' as const, label: '和小寧聊聊', onGo: onGoChat, Icon: ICONS.Chat },
    { id: 'relax' as const, label: '去放鬆一下', onGo: onGoRelax, Icon: ICONS.Relax },
  ];

  return (
    <section className="glass-warm rounded-[2.5rem] p-6 border border-violet-100/40">
      <div className="mb-4">
        <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#9b87c4' }}></span>
          小寧推薦
        </h3>
      </div>
      <div className="space-y-3">
        {entries.map((t) => (
          <button
            key={t.id}
            onClick={t.onGo}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-violet-100/30 glass-warm hover:border-violet-200 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-violet-100 text-violet-600 [&>svg]:w-5 [&>svg]:h-5">
              <t.Icon />
            </div>
            <span className="flex-1 text-sm font-black text-slate-800">
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default DailyTasks;
