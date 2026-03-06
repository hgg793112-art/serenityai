import React, { useState, useEffect } from 'react';

const FADE_IN_MS = 800;
const STAY_MS = 1200;
const EXIT_MS = 600;

/**
 * 啟動頁：刺猬插圖，尺寸自適應。寧靜島在上、你的情緒小夥伴在刺猬下方。
 * 淡入 → 停留 → 淡出（無跳轉），頂底同色，無縫銜接首頁。
 */
const SplashScreen: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setExiting(true);
      const t2 = setTimeout(onDone, EXIT_MS);
      return () => clearTimeout(t2);
    }, FADE_IN_MS + STAY_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  const bgColor = '#E8DCC4';

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: bgColor,
        padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
        animation: exiting
          ? `splashPageExit ${EXIT_MS}ms ease-out forwards`
          : `splashPageFadeIn ${FADE_IN_MS}ms ease-out forwards`,
      }}
    >
      <style>{`
        @keyframes splashPageFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes splashPageExit {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>

      {/* 插圖：自適應填滿，保持比例 */}
      <img
        src="/ip/splash-main.png"
        alt=""
        className="absolute inset-0 w-full h-full object-contain object-center"
        aria-hidden
      />

      {/* 寧靜島：上方 */}
      <div
        className="absolute left-1/2 text-center z-10"
        style={{
          top: '14%',
          transform: 'translateX(-50%)',
          color: '#4A3B32',
          fontFamily: "'Noto Serif TC', serif",
          fontWeight: 300,
          fontSize: 'clamp(1.4rem, 5.5vw, 2rem)',
          letterSpacing: '0.35em',
        }}
      >
        寧靜島
      </div>

      {/* 你的情緒小夥伴：刺猬下方 */}
      <div
        className="absolute left-1/2 text-center z-10"
        style={{
          bottom: '16%',
          transform: 'translateX(-50%)',
          color: '#4A3B32',
          fontFamily: "'Noto Serif TC', serif",
          fontWeight: 300,
          fontSize: 'clamp(0.7rem, 2.8vw, 0.85rem)',
          letterSpacing: '0.2em',
          opacity: 0.95,
        }}
      >
        你的情緒小夥伴
      </div>
    </div>
  );
};

export default SplashScreen;
