
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
  { 
    id: '1', 
    title: '深腹式呼吸', 
    duration: '3 分钟', 
    category: 'Breathing', 
    icon: '🌬️', 
    color: 'bg-cyan-100 text-cyan-700',
    audioUrl: '/audio/breathing-guide.mp3'
  },
  { 
    id: '2', 
    title: '夏日虫鸣', 
    duration: '10 分钟', 
    category: 'Meditation', 
    icon: '🦗', 
    color: 'bg-emerald-100 text-emerald-700',
    audioUrl: '/audio/rainforest.mp3'
  },
  { 
    id: '3', 
    title: '海浪疗愈', 
    duration: '15 分钟', 
    category: 'Meditation', 
    icon: '🌊', 
    color: 'bg-blue-100 text-blue-700',
    audioUrl: '/audio/ocean-waves.mp3'
  },
  { 
    id: '4', 
    title: '秋叶沙沙', 
    duration: '5 分钟', 
    category: 'Meditation', 
    icon: '🍂', 
    color: 'bg-amber-100 text-amber-700',
    audioUrl: '/audio/autumn-leaves.mp3'
  },
  { 
    id: '5', 
    title: '夏日细雨', 
    duration: '8 分钟', 
    category: 'Meditation', 
    icon: '🌧️', 
    color: 'bg-slate-100 text-slate-700',
    audioUrl: '/audio/summer-rain.mp3'
  },
  { 
    id: '6', 
    title: '冥想颂钵', 
    duration: '12 分钟', 
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

/**
 * 刺猬小宁 IP：根据压力状态分三段切换形象 + 微动效
 *
 * stressLevel 语义：身心状态分数（越高越好）
 *  0 – 35  压力过载 → hedgehog-stressed.png
 * 36 – 70  身心平稳 → hedgehog-calm.png
 * 71 – 100 状态优秀 → hedgehog.png
 */
export const HedgehogIP = ({ stressLevel = 50, size = 120 }: { stressLevel?: number; size?: number }) => {
  const isOverload  = stressLevel <= 35;
  const isCalm      = stressLevel > 35 && stressLevel <= 70;
  const isExcellent = stressLevel > 70;

  const imgSrc = isOverload
    ? '/ip/hedgehog-stressed.png'
    : isCalm
      ? '/ip/hedgehog-calm.png'
      : '/ip/hedgehog.png';

  return (
    <div style={{ width: size, height: size, background: 'transparent' }} className="relative flex items-center justify-center">
      <style>{`
        @keyframes hg-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes hg-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes hg-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes hg-glow-pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.95); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes hg-glow-gold {
          0%, 100% { opacity: 0.2; transform: scale(0.9); }
          50% { opacity: 0.5; transform: scale(1.08); }
        }
        @keyframes hg-worry-shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          20% { transform: translateX(-1.5px) rotate(-0.5deg); }
          40% { transform: translateX(1.5px) rotate(0.5deg); }
          60% { transform: translateX(-1px) rotate(-0.3deg); }
          80% { transform: translateX(1px) rotate(0.3deg); }
        }
        @keyframes hg-sweat-drop {
          0%, 60% { opacity: 0; transform: translateY(0); }
          70% { opacity: 0.8; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(8px); }
        }
        @keyframes hg-heart-float {
          0% { opacity: 0; transform: translateY(0) scale(0.5); }
          30% { opacity: 0.8; transform: translateY(-6px) scale(1); }
          100% { opacity: 0; transform: translateY(-18px) scale(0.6); }
        }
        @keyframes hg-sparkle {
          0%, 100% { opacity: 0; transform: scale(0.3) rotate(0deg); }
          50% { opacity: 0.8; transform: scale(1) rotate(180deg); }
        }
        @keyframes hg-star-twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.6); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes hg-spiral {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* 底光晕 */}
      {isCalm && (
        <div
          className="absolute rounded-full"
          style={{
            width: size * 0.8, height: size * 0.3,
            bottom: '2%',
            background: 'radial-gradient(ellipse, rgba(180,160,220,0.25) 0%, transparent 70%)',
            animation: 'hg-glow-pulse 3s ease-in-out infinite',
          }}
        />
      )}
      {isExcellent && (
        <div
          className="absolute rounded-full"
          style={{
            width: size * 0.85, height: size * 0.35,
            bottom: '1%',
            background: 'radial-gradient(ellipse, rgba(251,191,36,0.2) 0%, rgba(180,160,220,0.15) 50%, transparent 70%)',
            animation: 'hg-glow-gold 2.5s ease-in-out infinite',
          }}
        />
      )}

      {/* 主图 */}
      <img
        src={imgSrc}
        alt="小宁"
        style={{
          width: size, height: size,
          animation: isOverload
            ? 'hg-worry-shake 1.2s ease-in-out infinite'
            : isCalm
              ? 'hg-breathe 3.5s ease-in-out infinite, hg-float 4s ease-in-out infinite'
              : 'hg-bounce 2s ease-in-out infinite',
          transition: 'filter 0.6s ease',
        }}
        className={`object-contain drop-shadow-lg ${isOverload ? 'saturate-[0.9]' : ''}`}
        draggable={false}
      />

      {/* SVG 动效叠加 */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
        {/* 状态优秀：爱心 + 星星 + 光芒 */}
        {isExcellent && (
          <g>
            <g style={{ animation: 'hg-heart-float 2.8s ease-out infinite' }}>
              <path d="M72 18 C71 15 67 15 67 18 C67 21 72 24 72 24 C72 24 77 21 77 18 C77 15 73 15 72 18Z" fill="#f28b8b" opacity="0.8" />
            </g>
            <g style={{ animation: 'hg-heart-float 2.8s ease-out infinite 1.4s' }}>
              <path d="M26 16 C25.3 14 23 14 23 16 C23 18 26 20 26 20 C26 20 29 18 29 16 C29 14 26.7 14 26 16Z" fill="#f5a0b0" opacity="0.6" />
            </g>
            <g style={{ animation: 'hg-star-twinkle 1.8s ease-in-out infinite' }}>
              <path d="M83 10 L84.5 7 L86 10 L89 11.5 L86 13 L84.5 16 L83 13 L80 11.5Z" fill="#fbbf24" opacity="0.8" />
            </g>
            <g style={{ animation: 'hg-star-twinkle 1.8s ease-in-out infinite 0.9s' }}>
              <path d="M14 22 L15 20 L16 22 L18 23 L16 24 L15 26 L14 24 L12 23Z" fill="#fbbf24" opacity="0.6" />
            </g>
            <g style={{ animation: 'hg-sparkle 2s ease-in-out infinite 0.5s' }}>
              <path d="M90 25 L91 23.5 L92 25 L93.5 26 L92 27 L91 28.5 L90 27 L88.5 26Z" fill="#c4b5e0" opacity="0.5" />
            </g>
          </g>
        )}

        {/* 身心平稳：轻柔爱心 + 音符 */}
        {isCalm && (
          <g>
            <g style={{ animation: 'hg-heart-float 3.5s ease-out infinite' }}>
              <path d="M74 22 C73 19 70 19 70 22 C70 25 74 27 74 27 C74 27 78 25 78 22 C78 19 75 19 74 22Z" fill="#e8b0c0" opacity="0.5" />
            </g>
            <g style={{ animation: 'hg-sparkle 3s ease-in-out infinite' }}>
              <path d="M82 14 L83 12 L84 14 L86 15 L84 16 L83 18 L82 16 L80 15Z" fill="#c4b5e0" opacity="0.4" />
            </g>
            <g style={{ animation: 'hg-float 3s ease-in-out infinite' }}>
              <text x="20" y="18" fontSize="8" fill="#9b87c4" opacity="0.5">&#9834;</text>
            </g>
          </g>
        )}

        {/* 压力过载：汗滴 + 晕圈 + 惊叹号 */}
        {isOverload && (
          <g>
            <g style={{ animation: 'hg-sweat-drop 2s ease-in-out infinite' }}>
              <path d="M78 28 Q80 22 82 28 Q80 33 78 28Z" fill="#7cb5e0" opacity="0.7" />
            </g>
            <g style={{ animation: 'hg-sweat-drop 2s ease-in-out infinite 0.8s' }}>
              <path d="M82 36 Q83.5 32 85 36 Q83.5 39 82 36Z" fill="#7cb5e0" opacity="0.5" />
            </g>
            <g style={{ animation: 'hg-spiral 3s linear infinite', transformOrigin: '50px 8px' }}>
              <circle cx="38" cy="8" r="2" fill="#94a3b8" opacity="0.45" />
              <circle cx="50" cy="4" r="1.5" fill="#b0bec5" opacity="0.4" />
              <circle cx="62" cy="8" r="2" fill="#94a3b8" opacity="0.45" />
            </g>
            <g style={{ animation: 'hg-sparkle 1.5s ease-in-out infinite' }}>
              <text x="22" y="16" fontSize="10" fontWeight="bold" fill="#e8a040" opacity="0.7">!</text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};

/** @deprecated 使用 HedgehogIP */
export const KolaIP = HedgehogIP;
