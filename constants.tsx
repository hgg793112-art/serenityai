
import React from 'react';
import { Mood, RelaxationExercise } from './types';

export const MOOD_CONFIG: Record<Mood, { emoji: string; color: string; label: string }> = {
  [Mood.EXCITED]: { emoji: '🤩', color: 'bg-yellow-400', label: '興奮' },
  [Mood.HAPPY]: { emoji: '😊', color: 'bg-green-400', label: '快樂' },
  [Mood.CALM]: { emoji: '😌', color: 'bg-blue-400', label: '平靜' },
  [Mood.TIRED]: { emoji: '🥱', color: 'bg-purple-400', label: '疲憊' },
  [Mood.SAD]: { emoji: '😔', color: 'bg-indigo-400', label: '憂鬱' },
  [Mood.ANXIOUS]: { emoji: '😟', color: 'bg-orange-400', label: '焦慮' },
  [Mood.STRESSED]: { emoji: '😫', color: 'bg-red-400', label: '壓力' },
};

export const EXERCISES: RelaxationExercise[] = [
  { id: '1', title: '深腹式呼吸', duration: '3 分鐘', category: 'Breathing', icon: '🌬️', color: 'bg-cyan-100 text-cyan-700' },
  { 
    id: '2', 
    title: '森林微風', 
    duration: '10 分鐘', 
    category: 'Meditation', 
    icon: '🌲', 
    color: 'bg-emerald-100 text-emerald-700',
    audioUrl: 'https://assets.mixkit.co/sfx/preview/mixkit-wind-in-trees-1174.mp3'
  },
  { 
    id: '3', 
    title: '海浪療癒', 
    duration: '15 分鐘', 
    category: 'Meditation', 
    icon: '🌊', 
    color: 'bg-blue-100 text-blue-700',
    audioUrl: 'https://assets.mixkit.co/sfx/preview/mixkit-sea-waves-loop-1196.mp3'
  },
  { 
    id: '4', 
    title: '秋葉沙沙', 
    duration: '5 分鐘', 
    category: 'Meditation', 
    icon: '🍂', 
    color: 'bg-amber-100 text-amber-700',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/1175/1175-preview.mp3'
  },
  { 
    id: '5', 
    title: '夏日細雨', 
    duration: '8 分鐘', 
    category: 'Meditation', 
    icon: '🌧️', 
    color: 'bg-slate-100 text-slate-700',
    audioUrl: 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-2393.mp3'
  },
  { 
    id: '6', 
    title: '冥想頌缽', 
    duration: '12 分鐘', 
    category: 'Meditation', 
    icon: '🥣', 
    color: 'bg-purple-100 text-purple-700',
    audioUrl: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bowl-single-hit-2093.mp3'
  },
];

export const ICONS = {
  Brain: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54Z"/></svg>
  ),
  Activity: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
  ),
  Microphone: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
  ),
  Lotus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 10c-3 0-4.5 3-4.5 3s1.5 3 4.5 3 4.5-3 4.5-3-1.5-3-4.5-3Z"/><path d="M12 10c0-3-3-4.5-3-4.5s-3 1.5-3 4.5 3 4.5 3 4.5 3-1.5 3-4.5Z"/><path d="M12 10c0-3 3-4.5 3-4.5s3 1.5 3 4.5-3 4.5-3 4.5-3-1.5-3-4.5Z"/><path d="M12 22s-3-3-3-6 3-6 3-6 3 3 3 6-3 6-3 6Z"/></svg>
  )
};

export const StressBar = ({ value }: { value: number }) => (
  <div className="w-full h-2.5 relative rounded-full overflow-visible mt-2 bg-violet-100/50">
    <div className="absolute inset-0 rounded-full opacity-40 bg-gradient-to-r from-rose-300 via-violet-300 to-emerald-300"></div>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-300 via-violet-300 to-emerald-300"></div>
    <div 
      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-700 ease-out z-10 border-2 border-violet-200"
      style={{ left: `calc(${value}% - 8px)` }}
    ></div>
  </div>
);

/** 刺猬虛擬 IP：根據壓力等級顯示不同表情，Tolan 陪伴感 */
export const HedgehogIP = ({ stressLevel = 20, size = 120 }: { stressLevel?: number; size?: number }) => {
  const isExcellent = stressLevel <= 30;
  const isCalm = stressLevel > 30 && stressLevel <= 60;
  const isAnxious = stressLevel > 60 && stressLevel <= 85;
  const isOverload = stressLevel > 85;

  const bodyColor = isOverload ? '#e2e8f0' : isAnxious ? '#fef3c7' : isCalm ? '#c4b5a0' : '#b8a090';
  const bellyColor = '#f5f0e8';

  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
      <style>{`
        @keyframes hedgehog-blink { 0%, 88%, 100% { transform: scaleY(1); } 94% { transform: scaleY(0.08); } }
        @keyframes hedgehog-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
        @keyframes spine-float { 0%, 100% { opacity: 1; } 50% { opacity: 0.85; } }
      `}</style>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-xl transition-all duration-700"
        style={{ animation: 'hedgehog-breathe 3.5s ease-in-out infinite' }}
      >
        {/* 背部刺 */}
        {[12, 22, 32, 42, 52, 62, 72, 82].map((x, i) => (
          <path
            key={i}
            d={`M${x} 28 L${x - 4} 52 L${x + 2} 50 Z`}
            fill={isOverload ? '#94a3b8' : '#8B7355'}
            className="transition-all duration-500"
            style={{ animation: 'spine-float 2s ease-in-out infinite', animationDelay: `${i * 0.08}s` }}
          />
        ))}
        {/* 身體橢圓 */}
        <ellipse cx="52" cy="52" rx="38" ry="36" fill={bodyColor} className="transition-colors duration-700" />
        <path d="M20 52 Q52 90 84 52 Q52 28 20 52" fill={bellyColor} className="transition-opacity duration-500" opacity="0.95" />
        {/* 臉部：眼睛 + 鼻 + 嘴 */}
        {isExcellent && (
          <g>
            <ellipse cx="42" cy="42" rx="6" ry="8" fill="#2d2a26" />
            <ellipse cx="62" cy="42" rx="6" ry="8" fill="#2d2a26" />
            <circle cx="43" cy="40" r="1.5" fill="white" opacity="0.9" />
            <circle cx="63" cy="40" r="1.5" fill="white" opacity="0.9" />
            <ellipse cx="52" cy="52" rx="4" ry="3" fill="#2d2a26" />
            <path d="M45 62 Q52 68 60 62" stroke="#2d2a26" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        )}
        {isCalm && (
          <g>
            <g style={{ animation: 'hedgehog-blink 4s infinite', transformOrigin: '50% 42%' }}>
              <path d="M38 42 Q42 38 46 42 Q42 46 38 42" fill="#2d2a26" />
              <path d="M58 42 Q62 38 66 42 Q62 46 58 42" fill="#2d2a26" />
            </g>
            <ellipse cx="52" cy="52" rx="4" ry="3" fill="#2d2a26" />
            <path d="M46 60 Q52 64 58 60" stroke="#2d2a26" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </g>
        )}
        {isAnxious && (
          <g>
            <circle cx="42" cy="42" r="5" fill="#2d2a26" />
            <circle cx="62" cy="42" r="5" fill="#2d2a26" />
            <circle cx="41" cy="40" r="1" fill="white" />
            <circle cx="61" cy="40" r="1" fill="white" />
            <ellipse cx="52" cy="52" rx="3" ry="2.5" fill="#2d2a26" />
            <path d="M46 62 L58 62" stroke="#2d2a26" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="78" cy="35" r="4" fill="#94a3b8" opacity="0.9" className="animate-bounce" />
          </g>
        )}
        {isOverload && (
          <g>
            <path d="M38 38 L46 46 M46 38 L38 46" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
            <path d="M58 38 L66 46 M66 38 L58 46" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="52" cy="52" rx="3" ry="2" fill="#64748b" />
            <path d="M44 64 Q52 60 60 64" stroke="#64748b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <circle cx="80" cy="32" r="5" fill="#cbd5e1" opacity="0.8" />
          </g>
        )}
      </svg>
    </div>
  );
};

/** @deprecated 使用 HedgehogIP */
export const KolaIP = HedgehogIP;
