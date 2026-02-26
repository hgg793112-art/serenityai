
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
        <h3 className="text-xl font-black text-slate-800 mb-8 text-center">你現在感覺如何？</h3>
        
        <div className="grid grid-cols-4 gap-4 mb-10">
          {(Object.keys(MOOD_CONFIG) as Mood[]).map(mood => (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              className={`flex flex-col items-center gap-3 p-3 rounded-[2rem] transition-all ${
                selectedMood === mood ? 'text-white shadow-xl scale-110' : 'hover:bg-violet-50 text-slate-400'
              }`}
              style={selectedMood === mood ? { background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' } : {}}
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
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">自感壓力等級</label>
                <span className="text-sm font-black" style={{ color: '#7c6ba8' }}>{stress}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={stress}
                onChange={(e) => setStress(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#7c6ba8' }}
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-3 px-1">心情備註 (可選)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="此刻你在想什麼？"
                className="w-full bg-slate-50/50 border border-violet-100/40 rounded-[2rem] p-5 text-sm focus:ring-2 focus:ring-[#9b87c4]/50 transition-all outline-none min-h-[120px]"
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
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#9b87c4' }}></div>
          最近的心情足跡
        </h3>
        {moodLogs.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-sm font-medium">開啟你的第一條心情記錄吧。</p>
          </div>
        ) : (
          moodLogs.map(log => (
            <div key={log.id} className="glass-warm rounded-[2rem] p-5 border border-violet-100/30 shadow-sm flex items-start gap-4">
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
                    <div className="h-full rounded-full" style={{ width: `${log.stressLevel}%`, background: 'linear-gradient(90deg, #b8a9d4 0%, #7c6ba8 100%)' }}></div>
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
