
import React from 'react';
import { Mood, RelaxationExercise } from './types';

export const MOOD_CONFIG: Record<Mood, { emoji: string; color: string; label: string }> = {
  [Mood.EXCITED]: { emoji: '🤩', color: 'bg-yellow-400', label: '兴奋' },
  [Mood.HAPPY]: { emoji: '😊', color: 'bg-green-400', label: '快乐' },
  [Mood.CALM]: { emoji: '😌', color: 'bg-blue-400', label: '平静' },
  [Mood.TIRED]: { emoji: '🥱', color: 'bg-purple-400', label: '疲惫' },
  [Mood.SAD]: { emoji: '😔', color: 'bg-indigo-400', label: '忧郁' },
  [Mood.ANXIOUS]: { emoji: '😟', color: 'bg-orange-400', label: '焦虑' },
  [Mood.STRESSED]: { emoji: '😫', color: 'bg-red-400', label: '压力' },
};

export const EXERCISES: RelaxationExercise[] = [
  { id: '1', title: '深腹式呼吸', duration: '3 分钟', category: 'Breathing', icon: '🌬️', color: 'bg-cyan-100 text-cyan-700' },
  { 
    id: '2', 
    title: '森林微风', 
    duration: '10 分钟', 
    category: 'Meditation', 
    icon: '🌲', 
    color: 'bg-emerald-100 text-emerald-700',
    audioUrl: 'https://assets.mixkit.co/sfx/preview/mixkit-wind-in-trees-1174.mp3'
  },
  { 
    id: '3', 
    title: '海浪疗愈', 
    duration: '15 分钟', 
    category: 'Meditation', 
    icon: '🌊', 
    color: 'bg-blue-100 text-blue-700',
    audioUrl: 'https://assets.mixkit.co/sfx/preview/mixkit-sea-waves-loop-1196.mp3'
  },
  { 
    id: '4', 
    title: '秋叶沙沙', 
    duration: '5 分钟', 
    category: 'Meditation', 
    icon: '🍂', 
    color: 'bg-amber-100 text-amber-700',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/1175/1175-preview.mp3'
  },
  { 
    id: '5', 
    title: '夏日细雨', 
    duration: '8 分钟', 
    category: 'Meditation', 
    icon: '🌧️', 
    color: 'bg-slate-100 text-slate-700',
    audioUrl: 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-2393.mp3'
  },
  { 
    id: '6', 
    title: '冥想颂钵', 
    duration: '12 分钟', 
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
  <div className="w-full h-2 relative rounded-full overflow-visible mt-2">
    <div className="absolute inset-0 bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400 rounded-full opacity-30"></div>
    <div className="absolute inset-0 bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400 rounded-full"></div>
    <div 
      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-slate-800 rounded-full shadow-md transition-all duration-700 ease-out z-10"
      style={{ left: `calc(${value}% - 8px)` }}
    ></div>
  </div>
);

export const KolaIP = ({ stressLevel = 20, size = 120 }: { stressLevel?: number, size?: number }) => {
  const isExcellent = stressLevel <= 30;
  const isCalm = stressLevel > 30 && stressLevel <= 60;
  const isAnxious = stressLevel > 60 && stressLevel <= 85;
  const isOverload = stressLevel > 85;

  const bodyColor = isOverload ? '#f1f5f9' : (isAnxious ? '#fde047' : '#5eead4');
  
  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center animate-in zoom-in duration-500">
      <style>{`
        @keyframes kola-blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes kola-breath {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
      `}</style>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full drop-shadow-2xl" 
        style={{ animation: 'kola-breath 4s ease-in-out infinite' }}
      >
        <circle cx="50" cy="50" r="45" fill={bodyColor} className="transition-colors duration-1000" />
        {isExcellent && (
          <g>
            <rect x="25" y="40" width="22" height="12" rx="4" fill="#1e293b" />
            <rect x="53" y="40" width="22" height="12" rx="4" fill="#1e293b" />
            <path d="M47 45h6" stroke="#1e293b" strokeWidth="2" />
            <path d="M40 45l4-4" stroke="white" strokeWidth="1" opacity="0.5" />
            <path d="M45 65 q5 3 10 0" stroke="#1e293b" strokeWidth="2" fill="none" />
            <circle cx="75" cy="70" r="10" fill="white" opacity="0.8" />
            <path d="M72 65l6 10M78 65l-6 10" stroke="#2dd4bf" strokeWidth="1" />
          </g>
        )}
        {isCalm && (
          <g>
            <g style={{ animation: 'kola-blink 4s infinite' }}>
              <path d="M30 45 q10 -5 20 0" stroke="#1e293b" strokeWidth="3" fill="none" />
              <path d="M50 45 q10 -5 20 0" stroke="#1e293b" strokeWidth="3" fill="none" />
            </g>
            <path d="M40 65 q10 8 20 0" stroke="#1e293b" strokeWidth="3" fill="none" />
            <path d="M75 35 q5 5 10 0 q-5 -5 -10 0" fill="#f472b6" />
          </g>
        )}
        {isAnxious && (
          <g>
            <g style={{ animation: 'kola-blink 3s infinite', transformOrigin: '50% 45%' }}>
              <circle cx="35" cy="45" r="3" fill="#1e293b" />
              <circle cx="65" cy="45" r="3" fill="#1e293b" />
            </g>
            <path d="M40 65 h20" stroke="#1e293b" strokeWidth="2" />
            <circle cx="20" cy="30" r="4" fill="#60a5fa" className="animate-bounce" />
          </g>
        )}
        {isOverload && (
          <g>
            <circle cx="35" cy="45" r="12" fill="#cbd5e1" />
            <circle cx="65" cy="45" r="12" fill="#cbd5e1" />
            <g style={{ animation: 'kola-blink 2.5s infinite', transformOrigin: '50% 45%' }}>
              <circle cx="35" cy="45" r="5" fill="#1e293b" />
              <circle cx="65" cy="45" r="5" fill="#1e293b" />
            </g>
            <path d="M25 20 q0 10 5 0" fill="#60a5fa" />
            <path d="M75 25 q0 10 5 0" fill="#60a5fa" />
            <path d="M40 70 q10 -5 20 0" stroke="#1e293b" strokeWidth="3" fill="none" />
          </g>
        )}
      </svg>
    </div>
  );
};
