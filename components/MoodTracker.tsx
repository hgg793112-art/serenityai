
import React, { useState } from 'react';
import { Mood, MoodLogEntry } from '../types';
import { MOOD_CONFIG, ICONS } from '../constants';

interface MoodTrackerProps {
  moodLogs: MoodLogEntry[];
  onAddLog: (mood: Mood, stress: number, note?: string) => void;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({ moodLogs, onAddLog }) => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [stress, setStress] = useState(50);
  const [note, setNote] = useState('');

  const handleSave = () => {
    if (selectedMood) {
      onAddLog(selectedMood, stress, note);
      setSelectedMood(null);
      setStress(50);
      setNote('');
    }
  };

  return (
    <div className="p-6 space-y-8 animate-in slide-in-from-right duration-500">
      <div className="bg-white/60 glass rounded-[2.5rem] p-8 shadow-sm border border-white/40">
        <h3 className="text-xl font-black text-slate-800 mb-8 text-center">你现在感觉如何？</h3>
        
        <div className="grid grid-cols-4 gap-4 mb-10">
          {(Object.keys(MOOD_CONFIG) as Mood[]).map(mood => (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              className={`flex flex-col items-center gap-3 p-3 rounded-[2rem] transition-all ${
                selectedMood === mood ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-110' : 'hover:bg-indigo-50 text-slate-400'
              }`}
            >
              <span className="text-3xl">{MOOD_CONFIG[mood].emoji}</span>
              <span className={`text-[11px] font-black ${selectedMood === mood ? 'text-white' : 'text-slate-500'}`}>{MOOD_CONFIG[mood].label}</span>
            </button>
          ))}
        </div>

        {selectedMood && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div>
              <div className="flex justify-between items-center mb-3 px-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">自感压力等级</label>
                <span className="text-sm font-black text-indigo-600">{stress}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={stress}
                onChange={(e) => setStress(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-3 px-1">心情备注 (可选)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="此刻你在想什么？"
                className="w-full bg-slate-50/50 border-none rounded-[2rem] p-5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none min-h-[120px]"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] shadow-xl hover:bg-black active:scale-95 transition-all text-sm tracking-widest"
            >
              保存心情快照
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-black text-slate-800 px-2 uppercase text-xs tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
          最近的心情足迹
        </h3>
        {moodLogs.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-sm font-medium">开启你的第一条心情记录吧。</p>
          </div>
        ) : (
          moodLogs.map(log => (
            <div key={log.id} className="bg-white/60 glass rounded-[2rem] p-5 border-none shadow-sm flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${MOOD_CONFIG[log.mood].color} bg-opacity-20`}>
                {MOOD_CONFIG[log.mood].emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-black text-slate-800 text-sm">{MOOD_CONFIG[log.mood].label}</h4>
                  <span className="text-[10px] text-slate-400 font-black">
                    {new Date(log.timestamp).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                {log.note && <p className="text-xs text-slate-500 mt-1.5 italic line-clamp-2">“{log.note}”</p>}
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter shrink-0">STRESS</span>
                  <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400" style={{ width: `${log.stressLevel}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MoodTracker;
