import React, { useState } from 'react';
import { HedgehogIP } from '../constants';
import { Mood } from '../types';

interface Props {
  onComplete: (initialMood: Mood, initialStress: number) => void;
}

const RECENT_MOODS: Mood[] = [Mood.HAPPY, Mood.CALM, Mood.TIRED, Mood.ANXIOUS];

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [recentMood, setRecentMood] = useState<Mood | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [stress, setStress] = useState(50);

  const moods: Mood[] = [Mood.HAPPY, Mood.CALM, Mood.TIRED, Mood.ANXIOUS];
  const moodLabels: Record<Mood, string> = {
    [Mood.EXCITED]: '興奮',
    [Mood.HAPPY]: '快樂',
    [Mood.CALM]: '平靜',
    [Mood.TIRED]: '疲憊',
    [Mood.SAD]: '憂鬱',
    [Mood.ANXIOUS]: '焦慮',
    [Mood.STRESSED]: '壓力',
  };
  const moodEmojis: Record<Mood, string> = {
    [Mood.EXCITED]: '🤩',
    [Mood.HAPPY]: '😊',
    [Mood.CALM]: '😌',
    [Mood.TIRED]: '🥱',
    [Mood.SAD]: '😔',
    [Mood.ANXIOUS]: '😟',
    [Mood.STRESSED]: '😫',
  };

  const handleNext = () => {
    if (step === 1) setStep(2);
    else if (step === 2 && recentMood !== null) {
      try { localStorage.setItem('onboarding_frequent_mood', recentMood); } catch (_) {}
      setStep(3);
    }
    else if (step === 3 && mood) setStep(4);
    else if (step === 4 && mood) onComplete(mood, stress);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'linear-gradient(180deg, #faf8ff 0%, #f0ebf8 50%, #ebe4f5 100%)' }}>
      <div className="w-full max-w-md glass-warm rounded-[2.5rem] p-8 border border-violet-100/40 shadow-2xl">
        {step === 1 && (
          <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <HedgehogIP stressLevel={80} size={140} />
            <h2 className="text-2xl font-black text-slate-800">你好，我是小寧</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              我來自寧靜島，是一隻內心柔軟的刺猬，擅長傾聽、會根據你的心情陪在你身邊。
            </p>
            <p className="text-xs text-slate-400 italic">小寧懂你，陪你慢慢好起來。</p>
            <button
              onClick={() => setStep(2)}
              className="w-full py-4 rounded-2xl font-black text-white shadow-lg"
              style={{ background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' }}
            >
              認識小寧
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-slate-800 text-center">最近一週最常有的情緒？</h3>
            <p className="text-xs text-slate-500 text-center">小寧會根據這個準備你的寧靜島</p>
            <div className="grid grid-cols-2 gap-4">
              {RECENT_MOODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setRecentMood(m)}
                  className={`p-6 rounded-2xl flex flex-col items-center gap-3 transition-all ${
                    recentMood === m ? 'text-white shadow-xl scale-105' : 'bg-white/60 text-slate-400'
                  }`}
                  style={recentMood === m ? { background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' } : {}}
                >
                  <span className="text-4xl">{moodEmojis[m]}</span>
                  <span className="text-sm font-black">{moodLabels[m]}</span>
                </button>
              ))}
            </div>
            <button
              onClick={handleNext}
              disabled={recentMood === null}
              className="w-full py-4 rounded-2xl font-black text-white shadow-lg disabled:opacity-50"
              style={{ background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' }}
            >
              下一步
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-slate-800 text-center">你現在感覺如何？</h3>
            <div className="grid grid-cols-2 gap-4">
              {moods.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`p-6 rounded-2xl flex flex-col items-center gap-3 transition-all ${
                    mood === m ? 'text-white shadow-xl scale-105' : 'bg-white/60 text-slate-400'
                  }`}
                  style={mood === m ? { background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' } : {}}
                >
                  <span className="text-4xl">{moodEmojis[m]}</span>
                  <span className="text-sm font-black">{moodLabels[m]}</span>
                </button>
              ))}
            </div>
            <button
              onClick={handleNext}
              disabled={!mood}
              className="w-full py-4 rounded-2xl font-black text-white shadow-lg disabled:opacity-50"
              style={{ background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' }}
            >
              下一步
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-slate-800 text-center">壓力程度如何？</h3>
            <div className="flex justify-center">
              <HedgehogIP stressLevel={100 - stress} size={120} />
            </div>
            <div className="text-center">
              <span className="text-4xl font-black" style={{ color: '#7c6ba8' }}>{stress}%</span>
              <p className="text-xs mt-1 font-bold" style={{ color: stress <= 30 ? '#10b981' : stress <= 65 ? '#06b6d4' : '#f43f5e' }}>
                {stress <= 30 ? '狀態優秀' : stress <= 65 ? '身心平穩' : '壓力過載'}
              </p>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={stress}
              onChange={(e) => setStress(Number(e.target.value))}
              className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#7c6ba8' }}
            />
            <div className="flex justify-between text-xs text-slate-400 font-bold">
              <span>完全放鬆</span>
              <span>壓力爆表</span>
            </div>
            <p className="text-xs text-slate-500 text-center">寧靜島會根據你的狀態顯示天氣，完成後就能看到你的小島啦。</p>
            <button
              onClick={handleNext}
              className="w-full py-4 rounded-2xl font-black text-white shadow-lg"
              style={{ background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' }}
            >
              開始使用
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
