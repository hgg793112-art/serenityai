import React, { useState } from 'react';
import { Mood } from '../types';

interface DailyCheckinProps {
  onComplete: (mood: Mood, stress: number) => void;
  onSkip: () => void;
}

const MOODS: { mood: Mood; emoji: string; label: string }[] = [
  { mood: Mood.HAPPY, emoji: '😊', label: '快乐' },
  { mood: Mood.CALM, emoji: '😌', label: '平静' },
  { mood: Mood.TIRED, emoji: '🥱', label: '疲惫' },
  { mood: Mood.ANXIOUS, emoji: '😟', label: '焦虑' },
];

const DailyCheckin: React.FC<DailyCheckinProps> = ({ onComplete, onSkip }) => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [stress, setStress] = useState(40);

  const stressLabel = stress <= 30 ? '状态不错' : stress <= 65 ? '还好' : '压力有点大';
  const stressColor = stress <= 30 ? '#10b981' : stress <= 65 ? '#7c6ba8' : '#f43f5e';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onSkip}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg rounded-t-[2.5rem] p-6 pb-10 border-t border-violet-100/40 animate-in slide-in-from-bottom duration-500"
        style={{ background: 'linear-gradient(180deg, #faf8ff 0%, #f0ebf8 100%)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto mb-5" />

        <h3 className="text-lg font-black text-slate-800 text-center mb-1">今天感觉如何？</h3>
        <p className="text-xs text-slate-400 text-center mb-5">每天记录一下，小宁会更懂你</p>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {MOODS.map(m => (
            <button
              key={m.mood}
              onClick={() => setSelectedMood(m.mood)}
              className={`py-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all ${
                selectedMood === m.mood
                  ? 'text-white shadow-lg scale-105'
                  : 'bg-white/60 text-slate-500'
              }`}
              style={selectedMood === m.mood ? { background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' } : {}}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-[10px] font-black">{m.label}</span>
            </button>
          ))}
        </div>

        {selectedMood && (
          <div className="animate-in fade-in duration-300 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black text-slate-500">压力程度</span>
              <span className="text-xs font-black" style={{ color: stressColor }}>{stress}% · {stressLabel}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={stress}
              onChange={e => setStress(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#7c6ba8' }}
            />
            <div className="flex justify-between text-[10px] text-slate-300 font-bold mt-1">
              <span>放松</span>
              <span>压力大</span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 py-3 rounded-2xl font-black text-sm text-slate-400 bg-white/60 border border-violet-100/40"
          >
            跳过
          </button>
          <button
            onClick={() => selectedMood && onComplete(selectedMood, stress)}
            disabled={!selectedMood}
            className="flex-1 py-3 rounded-2xl font-black text-sm text-white shadow-lg disabled:opacity-40"
            style={{ background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' }}
          >
            记录
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyCheckin;
