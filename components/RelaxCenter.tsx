import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXERCISES, HedgehogIP } from '../constants';
import { RelaxationExercise } from '../types';
import { setDailyRelaxDone } from '../lib/dailyTaskStorage';

/* ────────────────────────────────────────────
   Constants
   ──────────────────────────────────────────── */

const TIMER_CHOICES: { label: string; value: number | null }[] = [
  { label: '不关闭', value: null },
  { label: '5分钟', value: 5 },
  { label: '10分钟', value: 10 },
  { label: '15分钟', value: 15 },
  { label: '30分钟', value: 30 },
  { label: '45分钟', value: 45 },
  { label: '60分钟', value: 60 },
];
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

/* ────────────────────────────────────────────
   Icons (stable references, defined outside)
   ──────────────────────────────────────────── */

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
);
const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
);
const TimerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/><path d="M6.38 18.7 4 21"/><path d="M17.64 18.67 20 21"/></svg>
);

/* ────────────────────────────────────────────
   TimerBottomSheet — independent component
   ──────────────────────────────────────────── */

interface TimerBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (minutes: number | null) => void;
  currentValue: number | null;
  remainingLabel: string | null;
}

const TimerBottomSheet: React.FC<TimerBottomSheetProps> = React.memo(({
  isOpen, onClose, onSelect, currentValue, remainingLabel,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeIdx, setActiveIdx] = useState(() => {
    const idx = TIMER_CHOICES.findIndex(c => c.value === currentValue);
    return idx >= 0 ? idx : 0;
  });

  useEffect(() => {
    if (isOpen) {
      const idx = TIMER_CHOICES.findIndex(c => c.value === currentValue);
      const targetIdx = idx >= 0 ? idx : 0;
      setActiveIdx(targetIdx);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = targetIdx * ITEM_HEIGHT;
          }
        });
      });
    }
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [isOpen, currentValue]);

  const handleScroll = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);

    const el = scrollRef.current;
    if (!el) return;

    const idx = Math.round(el.scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(idx, TIMER_CHOICES.length - 1));
    setActiveIdx(clamped);

    closeTimerRef.current = setTimeout(() => {
      const choice = TIMER_CHOICES[clamped];
      onSelect(choice.value);
      onClose();
    }, 800);
  }, [onSelect, onClose]);

  const tapItem = useCallback((idx: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: idx * ITEM_HEIGHT, behavior: 'smooth' });
    }
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="timer-overlay"
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(0,0,0,0.12)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="timer-sheet"
            className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-3xl pt-6 pb-10 px-4"
            style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-4" />
            <p className="text-center text-xs font-bold text-slate-500 mb-3">定时关闭</p>

            {/* Vertical scroll wheel */}
            <div className="relative mx-auto" style={{ width: 200, height: WHEEL_HEIGHT }}>
              {/* Selection highlight band */}
              <div
                className="absolute left-0 right-0 pointer-events-none rounded-xl z-0"
                style={{
                  top: (WHEEL_HEIGHT - ITEM_HEIGHT) / 2,
                  height: ITEM_HEIGHT,
                  background: 'rgba(155, 135, 196, 0.08)',
                  borderTop: '1px solid rgba(155, 135, 196, 0.15)',
                  borderBottom: '1px solid rgba(155, 135, 196, 0.15)',
                }}
              />
              {/* Top fade */}
              <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-10" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.95), transparent)' }} />
              {/* Bottom fade */}
              <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-10" style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.95), transparent)' }} />

              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="h-full overflow-y-auto snap-y snap-mandatory relative z-[1]"
                style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
              >
                <style>{`.timer-wheel::-webkit-scrollbar { display: none; }`}</style>
                {/* Top padding */}
                <div style={{ height: (WHEEL_HEIGHT - ITEM_HEIGHT) / 2 }} />
                {TIMER_CHOICES.map((c, i) => (
                  <div
                    key={i}
                    className="snap-center flex items-center justify-center cursor-pointer"
                    style={{ height: ITEM_HEIGHT }}
                    onClick={() => tapItem(i)}
                  >
                    <span
                      className="font-bold transition-all duration-150 select-none"
                      style={{
                        fontSize: i === activeIdx ? 20 : 15,
                        color: i === activeIdx ? '#7c6ba8' : '#cbd5e1',
                        transform: i === activeIdx ? 'scale(1)' : 'scale(0.9)',
                      }}
                    >
                      {c.label}
                    </span>
                  </div>
                ))}
                {/* Bottom padding */}
                <div style={{ height: (WHEEL_HEIGHT - ITEM_HEIGHT) / 2 }} />
              </div>
            </div>

            {remainingLabel && (
              <p className="text-center text-xs text-slate-400 mt-3">剩余 {remainingLabel}</p>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

/* ────────────────────────────────────────────
   RelaxCenter
   ──────────────────────────────────────────── */

interface RelaxCenterProps {
  onOpenHealingChat?: () => void;
  wellnessScore?: number;
}

const RelaxCenter: React.FC<RelaxCenterProps> = ({ onOpenHealingChat, wellnessScore = 75 }) => {
  const [activeExercise, setActiveExercise] = useState<RelaxationExercise | null>(null);
  const [isBreathing, setIsBreathing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [audioError, setAudioError] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [isTimerSheetOpen, setIsTimerSheetOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadedAudios = useRef<Map<string, HTMLAudioElement>>(new Map());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sheetCooldownRef = useRef(false);

  useEffect(() => {
    EXERCISES.forEach(ex => {
      if (ex.audioUrl && !preloadedAudios.current.has(ex.audioUrl)) {
        const audio = new Audio(ex.audioUrl);
        audio.preload = 'metadata';
        preloadedAudios.current.set(ex.audioUrl, audio);
      }
    });
  }, []);

  const startExercise = (ex: RelaxationExercise) => {
    setDailyRelaxDone();
    setAudioError(false);
    setTimerMinutes(null);
    setRemainingSeconds(null);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (ex.category === 'Breathing') setIsBreathing(true);
    setActiveExercise(ex);

    if (ex.audioUrl) {
      if (audioRef.current) {
        const fadeOut = setInterval(() => {
          if (audioRef.current && audioRef.current.volume > 0.05) {
            audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.1);
          } else {
            if (audioRef.current) audioRef.current.pause();
            clearInterval(fadeOut);
          }
        }, 50);
      }
      const audio = new Audio(ex.audioUrl);
      audio.loop = true;
      audio.volume = 0;
      audio.preload = 'auto';
      audio.addEventListener('error', () => setAudioError(true));
      audio.addEventListener('loadedmetadata', () => setAudioDuration(audio.duration));
      audio.addEventListener('timeupdate', () => setAudioCurrentTime(audio.currentTime));
      audio.addEventListener('canplaythrough', () => {
        audio.play().then(() => {
          let v = 0;
          const fadeIn = setInterval(() => {
            if (v < volume) { v = Math.min(volume, v + 0.05); audio.volume = v; }
            else clearInterval(fadeIn);
          }, 50);
        }).catch(() => setAudioError(true));
      });
      audio.load();
      audioRef.current = audio;
    }
  };

  useEffect(() => {
    if (audioRef.current && !audioRef.current.paused) audioRef.current.volume = volume;
  }, [volume]);

  const togglePause = () => {
    if (!activeExercise) return;
    if (isPaused) { audioRef.current?.play().catch(() => {}); setIsPaused(false); }
    else { audioRef.current?.pause(); setIsPaused(true); }
  };

  const stopExercise = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setTimerMinutes(null);
    setRemainingSeconds(null);
    setAudioDuration(0);
    setAudioCurrentTime(0);
    if (audioRef.current) {
      const fadeOut = setInterval(() => {
        if (audioRef.current && audioRef.current.volume > 0.05) {
          audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.08);
        } else {
          if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
          clearInterval(fadeOut);
          setActiveExercise(null);
          setIsBreathing(false);
          setIsPaused(false);
        }
      }, 40);
    } else {
      setActiveExercise(null);
      setIsBreathing(false);
      setIsPaused(false);
    }
  }, []);

  const selectTimer = useCallback((minutes: number | null) => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setTimerMinutes(minutes);
    if (minutes != null && minutes > 0) {
      setRemainingSeconds(minutes * 60);
      timerRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev == null || prev <= 1) {
            if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
            stopExercise();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setRemainingSeconds(null);
    }
  }, [stopExercise]);

  const closeSheet = useCallback(() => {
    setIsTimerSheetOpen(false);
    sheetCooldownRef.current = true;
    setTimeout(() => { sheetCooldownRef.current = false; }, 400);
  }, []);
  const openSheet = useCallback(() => {
    if (sheetCooldownRef.current) return;
    setIsTimerSheetOpen(true);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);
  useEffect(() => () => { if (audioRef.current) audioRef.current.pause(); }, []);

  const remainingLabel = remainingSeconds != null && remainingSeconds > 0
    ? `${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, '0')}`
    : null;
  const timerLabel = timerMinutes != null ? `${timerMinutes}分钟` : '不关闭';

  return (
    <div className="p-6 space-y-6 animate-in slide-in-from-right duration-500">
      {/* Hero card */}
      <div className="glass-warm rounded-[2.5rem] p-10 text-center relative overflow-hidden border border-violet-100/40">
        <div className="flex justify-center mb-6">
          <HedgehogIP stressLevel={wellnessScore} size={140} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">你好，我是小宁</h2>
        <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed px-4">
          来自宁静岛的放松泉。做完呼吸或冥想，岛上会更美。「最好的节奏，是让一切自然发生。」
        </p>
        <button
          onClick={() => onOpenHealingChat?.()}
          className="px-10 py-4 rounded-full text-white font-black text-xs shadow-lg hover:scale-105 active:scale-95 transition-all tracking-widest"
          style={{ background: 'linear-gradient(145deg, #7c6ba8 0%, #6b5b96 100%)' }}
        >
          开启疗愈对话
        </button>
      </div>

      {/* Exercise grid */}
      <div className="space-y-4">
        <h3 className="font-black text-slate-800 px-2 uppercase text-xs tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#9b87c4' }}></div>
          身心修复库
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {EXERCISES.map(ex => (
            <button
              key={ex.id}
              onClick={() => startExercise(ex)}
              className="glass-warm p-6 rounded-[2rem] border border-violet-100/30 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 text-left flex flex-col gap-4 group"
            >
              <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-3xl ${ex.color} group-hover:scale-110 transition-transform shadow-sm`}>
                {ex.icon}
              </div>
              <div>
                <h4 className="font-black text-slate-800 text-sm tracking-tight">{ex.title}</h4>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{ex.duration}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Active exercise modal ── */}
      {activeExercise && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-10 animate-in fade-in zoom-in-95 duration-500" style={{ background: 'rgba(250, 248, 255, 0.92)', backdropFilter: 'blur(20px)' }}>
          <button
            onClick={stopExercise}
            className="absolute top-12 right-12 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors glass-warm border border-violet-100/40"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>

          {activeExercise.category === 'Breathing' ? (
            <div className="flex flex-col items-center gap-16 w-full max-w-sm">
              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-3 block" style={{ color: '#7c6ba8' }}>正念呼吸</span>
                <h2 className="text-4xl font-black text-slate-800 mb-2">呼吸练习</h2>
              </div>
              <div className="relative flex items-center justify-center w-full">
                <div className={`absolute w-72 h-72 rounded-full opacity-20 ${isPaused ? '' : 'animate-ping'}`} style={{ background: 'rgba(216, 204, 235, 0.6)' }}></div>
                <div className="w-64 h-64 rounded-full flex items-center justify-center p-8 shadow-inner border" style={{ background: 'rgba(245, 240, 255, 0.6)', borderColor: 'rgba(232, 224, 245, 0.6)' }}>
                  <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-black text-2xl shadow-2xl ${isPaused ? '' : 'animate-[pulse_4s_ease-in-out_infinite]'}`} style={{ background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' }}>
                    {isPaused ? '暂停中' : '呼气'}
                  </div>
                </div>
              </div>
              <HedgehogIP stressLevel={wellnessScore} size={100} />
              {/* Controls row */}
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center gap-1">
                  <button onClick={openSheet} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-violet-500 transition-colors" style={{ background: 'rgba(245, 240, 255, 0.6)' }}>
                    <TimerIcon />
                  </button>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wide">{remainingLabel ?? timerLabel}</span>
                </div>
                <button onClick={togglePause} className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl active:scale-90 transition-transform" style={{ background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' }}>
                  {isPaused ? <PlayIcon /> : <PauseIcon />}
                </button>
                {activeExercise.audioUrl && (
                  <div className="flex flex-col items-center gap-1">
                    <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                    <input type="range" min="0" max="100" value={volume * 100} onChange={(e) => setVolume(Number(e.target.value) / 100)} className="volume-slider w-20 h-3 rounded-full appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, #9b87c4 0%, #9b87c4 ${volume * 100}%, #e2e8f0 ${volume * 100}%, #e2e8f0 100%)` }} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            (() => {
              const RING_SIZE = 260;
              const RING_CENTER = RING_SIZE / 2;
              const RING_RADIUS = 118;
              const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
              const progress = audioDuration > 0 ? audioCurrentTime / audioDuration : 0;
              const dashOffset = RING_CIRCUMFERENCE * (1 - progress);
              return (
                <div className="flex flex-col items-center text-center h-full justify-between py-6">
                  <div className="mt-8">
                    <h2 className="text-3xl font-black text-slate-800 mb-1">{activeExercise.title}</h2>
                    <p className="text-slate-400 font-bold tracking-[0.2em] uppercase text-[10px]">
                      {isPaused ? '已暂停' : activeExercise.audioUrl ? (audioError ? '音频载入中...' : '沉浸疗愈音频中') : '沉浸模式已开启'}
                    </p>
                  </div>
                  <div className="relative flex items-center justify-center" style={{ width: RING_SIZE, height: RING_SIZE }}>
                    <svg width={RING_SIZE} height={RING_SIZE} className="absolute inset-0 -rotate-90">
                      <circle cx={RING_CENTER} cy={RING_CENTER} r={RING_RADIUS} fill="none" stroke="#e8e0f0" strokeWidth="6" />
                      <motion.circle cx={RING_CENTER} cy={RING_CENTER} r={RING_RADIUS} fill="none" stroke="#c4b5e0" strokeWidth="12" strokeLinecap="round" strokeDasharray={RING_CIRCUMFERENCE} strokeDashoffset={dashOffset} animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} style={{ filter: 'blur(6px)' }} />
                      <circle cx={RING_CENTER} cy={RING_CENTER} r={RING_RADIUS} fill="none" stroke="url(#ringGradient)" strokeWidth="5" strokeLinecap="round" strokeDasharray={RING_CIRCUMFERENCE} strokeDashoffset={dashOffset} style={{ transition: 'stroke-dashoffset 0.3s ease' }} />
                      <defs>
                        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#9b87c4" />
                          <stop offset="100%" stopColor="#7c6ba8" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="relative z-10 text-8xl select-none">{activeExercise.icon}</div>
                  </div>
                  {/* Controls row */}
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col items-center gap-1">
                      <button onClick={openSheet} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-violet-500 transition-colors" style={{ background: 'rgba(245, 240, 255, 0.6)' }}>
                        <TimerIcon />
                      </button>
                      <span className="text-[10px] font-bold text-slate-400 tracking-wide">{remainingLabel ?? timerLabel}</span>
                    </div>
                    <button onClick={togglePause} className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl active:scale-90 transition-transform" style={{ background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' }}>
                      {isPaused ? <PlayIcon /> : <PauseIcon />}
                    </button>
                    {activeExercise.audioUrl && (
                      <div className="flex flex-col items-center gap-1">
                        <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                        <input type="range" min="0" max="100" value={volume * 100} onChange={(e) => setVolume(Number(e.target.value) / 100)} className="volume-slider w-20 h-3 rounded-full appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, #9b87c4 0%, #9b87c4 ${volume * 100}%, #e2e8f0 ${volume * 100}%, #e2e8f0 100%)` }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })()
          )}

          {/* Timer bottom sheet — stable component outside render tree */}
          <TimerBottomSheet
            isOpen={isTimerSheetOpen}
            onClose={closeSheet}
            onSelect={selectTimer}
            currentValue={timerMinutes}
            remainingLabel={remainingLabel}
          />
        </div>
      )}
    </div>
  );
};

export default RelaxCenter;
