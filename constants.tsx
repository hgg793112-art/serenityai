
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
  { 
    id: '1', 
    title: '深腹式呼吸', 
    duration: '3 分鐘', 
    category: 'Breathing', 
    icon: '🌬️', 
    color: 'bg-cyan-100 text-cyan-700',
    audioUrl: '/audio/breathing-guide.mp3'
  },
  { 
    id: '2', 
    title: '夏日蟲鳴', 
    duration: '10 分鐘', 
    category: 'Meditation', 
    icon: '🦗', 
    color: 'bg-emerald-100 text-emerald-700',
    audioUrl: '/audio/rainforest.mp3'
  },
  { 
    id: '3', 
    title: '海浪療癒', 
    duration: '15 分鐘', 
    category: 'Meditation', 
    icon: '🌊', 
    color: 'bg-blue-100 text-blue-700',
    audioUrl: '/audio/ocean-waves.mp3'
  },
  { 
    id: '4', 
    title: '秋葉沙沙', 
    duration: '5 分鐘', 
    category: 'Meditation', 
    icon: '🍂', 
    color: 'bg-amber-100 text-amber-700',
    audioUrl: '/audio/autumn-leaves.mp3'
  },
  { 
    id: '5', 
    title: '夏日細雨', 
    duration: '8 分鐘', 
    category: 'Meditation', 
    icon: '🌧️', 
    color: 'bg-slate-100 text-slate-700',
    audioUrl: '/audio/summer-rain.mp3'
  },
  { 
    id: '6', 
    title: '冥想頌缽', 
    duration: '12 分鐘', 
    category: 'Meditation', 
    icon: '🥣', 
    color: 'bg-purple-100 text-purple-700',
    audioUrl: '/audio/singing-bowl.mp3'
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
  ),
  Chat: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
  ),
  Relax: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8.4a7 7 0 0 1-14 0c0-3.36 1.23-6.23 3-7.8L11 13z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
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

/** 刺蝟小寧 IP：使用圖片底圖 + SVG 表情動效疊加 */
export const HedgehogIP = ({ stressLevel = 20, size = 120 }: { stressLevel?: number; size?: number }) => {
  const isExcellent = stressLevel <= 30;
  const isCalm = stressLevel > 30 && stressLevel <= 60;
  const isAnxious = stressLevel > 60 && stressLevel <= 85;
  const isOverload = stressLevel > 85;

  return (
    <div style={{ width: size, height: size, background: 'transparent' }} className="relative flex items-center justify-center">
      <style>{`
        @keyframes hg-blink { 0%,88%,100% { transform: scaleY(1); } 94% { transform: scaleY(0.05); } }
        @keyframes hg-breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.025); } }
        @keyframes hg-wave { 0%,100% { transform: rotate(0deg); } 25% { transform: rotate(-8deg); } 75% { transform: rotate(8deg); } }
        @keyframes hg-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes hg-sweat { 0%,70%,100% { opacity: 0; } 80% { opacity: 1; transform: translateY(0); } 95% { opacity: 0.3; transform: translateY(4px); } }
        @keyframes hg-dizzy { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(10deg); } }
        @keyframes hg-sad-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-1.5px); } 75% { transform: translateX(1.5px); } }
      `}</style>
      {/* 底圖 */}
      <img
        src="/ip/hedgehog.png"
        alt="小寧"
        style={{ width: size, height: size, animation: isOverload ? 'hg-sad-shake 0.8s ease-in-out infinite' : isAnxious ? 'hg-dizzy 2s ease-in-out infinite' : isExcellent ? 'hg-bounce 2s ease-in-out infinite' : 'hg-breathe 3.5s ease-in-out infinite' }}
        className={`object-contain drop-shadow-lg transition-all duration-700 ${isOverload ? 'grayscale-[40%] brightness-90' : isAnxious ? 'brightness-95 saturate-[0.85]' : ''}`}
        draggable={false}
      />
      {/* 表情動效疊加層 */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        {isExcellent && (
          <g>
            {/* 臉頰紅暈 */}
            <circle cx="30" cy="58" r="5" fill="#f5a0a0" opacity="0.3" />
            <circle cx="70" cy="58" r="5" fill="#f5a0a0" opacity="0.3" />
            {/* 頭頂愛心 */}
            <g style={{ animation: 'hg-bounce 1.5s ease-in-out infinite' }}>
              <path d="M46 12 C44 8 38 8 38 13 C38 17 46 22 46 22 C46 22 54 17 54 13 C54 8 48 8 46 12Z" fill="#f28b8b" opacity="0.7" />
            </g>
            {/* 閃爍星星 */}
            <g style={{ animation: 'hg-blink 2s ease-in-out infinite' }}>
              <path d="M78 18 L80 14 L82 18 L86 20 L82 22 L80 26 L78 22 L74 20Z" fill="#fbbf24" opacity="0.6" />
            </g>
          </g>
        )}
        {isCalm && (
          <g>
            {/* 輕微紅暈 */}
            <circle cx="30" cy="58" r="4" fill="#f5a0a0" opacity="0.2" />
            <circle cx="70" cy="58" r="4" fill="#f5a0a0" opacity="0.2" />
            {/* 音符飄動 */}
            <g style={{ animation: 'hg-bounce 2.5s ease-in-out infinite' }}>
              <text x="76" y="22" fontSize="10" fill="#9b87c4" opacity="0.6">&#9834;</text>
            </g>
            {/* Zzz 飄出 */}
            <g style={{ animation: 'hg-bounce 3s ease-in-out infinite', animationDelay: '0.5s' }}>
              <text x="72" y="14" fontSize="7" fontWeight="bold" fill="#9b87c4" opacity="0.4">z</text>
              <text x="78" y="10" fontSize="9" fontWeight="bold" fill="#9b87c4" opacity="0.5">Z</text>
            </g>
          </g>
        )}
        {isAnxious && (
          <g>
            {/* 汗滴 */}
            <g style={{ animation: 'hg-sweat 2s ease-in-out infinite' }}>
              <path d="M76 28 Q78 22 80 28 Q78 32 76 28Z" fill="#7cb5e0" opacity="0.7" />
            </g>
            <g style={{ animation: 'hg-sweat 2s ease-in-out infinite 0.6s' }}>
              <path d="M80 34 Q81.5 30 83 34 Q81.5 37 80 34Z" fill="#7cb5e0" opacity="0.5" />
            </g>
            {/* 驚嘆號 */}
            <g style={{ animation: 'hg-bounce 0.8s ease-in-out infinite' }}>
              <text x="44" y="12" fontSize="12" fontWeight="bold" fill="#e8a040" opacity="0.7">!</text>
            </g>
          </g>
        )}
        {isOverload && (
          <g>
            {/* 頭頂旋轉暈圈 */}
            <g style={{ animation: 'hg-dizzy 1.5s linear infinite', transformOrigin: '50px 10px' }}>
              <circle cx="38" cy="10" r="2.5" fill="#94a3b8" opacity="0.5" />
              <circle cx="50" cy="6" r="2" fill="#b0bec5" opacity="0.5" />
              <circle cx="62" cy="10" r="2.5" fill="#94a3b8" opacity="0.5" />
            </g>
            {/* 碎裂線 */}
            <path d="M22 24 L26 20 L24 26" stroke="#94a3b8" strokeWidth="1" fill="none" opacity="0.4" />
            <path d="M76 22 L80 18 L78 24" stroke="#94a3b8" strokeWidth="1" fill="none" opacity="0.4" />
          </g>
        )}
      </svg>
    </div>
  );
};

/** @deprecated 使用 HedgehogIP */
export const KolaIP = HedgehogIP;
