import React, { useState } from 'react';
import { HedgehogIP } from '../constants';
import { Mood } from '../types';

interface Props {
  onComplete: (initialMood: Mood, initialStress: number) => void;
}

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState<Mood | null>(null);
  const [stress, setStress] = useState(50);

  const moods: Mood[] = [Mood.HAPPY, Mood.CALM, Mood.TIRED, Mood.ANXIOUS];
  const moodLabels: Record<Mood, string> = {
    [Mood.EXCITED]: '兴奋',
    [Mood.HAPPY]: '快乐',
    [Mood.CALM]: '平静',
    [Mood.TIRED]: '疲惫',
    [Mood.SAD]: '忧郁',
    [Mood.ANXIOUS]: '焦虑',
    [Mood.STRESSED]: '压力',
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
    else if (step === 2 && mood) setStep(3);
    else if (step === 3 && mood) onComplete(mood, stress);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'linear-gradient(180deg, #faf8ff 0%, #f0ebf8 50%, #ebe4f5 100%)' }}>
      <div className="w-full max-w-md glass-warm rounded-[2.5rem] p-8 border border-violet-100/40 shadow-2xl">
        {step === 1 && (
          <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-center">
              <HedgehogIP stressLevel={80} size={140} />
            </div>
            <h2 className="text-2xl font-black text-slate-800">你好，我是小宁</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              我来自宁静岛，是一只内心柔软的刺猬，擅长倾听、会根据你的心情陪在你身边。
            </p>
            <p className="text-xs text-slate-400 italic">小宁懂你，陪你慢慢好起来。</p>
            <button
              onClick={() => setStep(2)}
              className="w-full py-4 rounded-2xl font-black text-white shadow-lg"
              style={{ background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' }}
            >
              认识小宁
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-slate-800 text-center">你现在感觉如何？</h3>
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

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-slate-800 text-center">压力程度如何？</h3>
            <div className="flex justify-center">
              <HedgehogIP stressLevel={100 - stress} size={120} />
            </div>
            <div className="text-center">
              <span className="text-4xl font-black" style={{ color: '#7c6ba8' }}>{stress}%</span>
              <p className="text-xs mt-1 font-bold" style={{ color: stress <= 30 ? '#10b981' : stress <= 65 ? '#06b6d4' : '#f43f5e' }}>
                {stress <= 30 ? '状态优秀' : stress <= 65 ? '身心平稳' : '压力过载'}
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
              <span>完全放松</span>
              <span>压力爆表</span>
            </div>
            <p className="text-xs text-slate-500 text-center">宁静岛会根据你的状态显示天气，完成后就能看到你的小岛啦。</p>
            <button
              onClick={handleNext}
              className="w-full py-4 rounded-2xl font-black text-white shadow-lg"
              style={{ background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' }}
            >
              开始使用
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
