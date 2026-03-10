import React, { useState, useEffect, useRef } from 'react';
import { EXERCISES, HedgehogIP } from '../constants';
import { RelaxationExercise } from '../types';
import { setDailyRelaxDone } from '../lib/dailyTaskStorage';

interface RelaxCenterProps {
  onOpenHealingChat?: () => void;
  wellnessScore?: number;
}

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
);
const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
);
const StopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
);

/** 定時關閉選項（分鐘），參考 Calm；含 1 分鐘便於快速測試 */
const TIMER_OPTIONS = [1, 5, 10, 15, 20, 30, 45, 60] as const;

const RelaxCenter: React.FC<RelaxCenterProps> = ({ onOpenHealingChat, wellnessScore = 75 }) => {
  const [activeExercise, setActiveExercise] = useState<RelaxationExercise | null>(null);
  const [isBreathing, setIsBreathing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [audioError, setAudioError] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadedAudios = useRef<Map<string, HTMLAudioElement>>(new Map());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (ex.category === 'Breathing') {
      setIsBreathing(true);
    }
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
      audio.addEventListener('canplaythrough', () => {
        audio.play().then(() => {
          let currentVol = 0;
          const fadeIn = setInterval(() => {
            if (currentVol < volume) {
              currentVol = Math.min(volume, currentVol + 0.05);
              audio.volume = currentVol;
            } else {
              clearInterval(fadeIn);
            }
          }, 50);
        }).catch(e => {
          console.error("Audio playback failed", e);
          setAudioError(true);
        });
      });
      audio.load();
      audioRef.current = audio;
    }
  };

  useEffect(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePause = () => {
    if (!activeExercise) return;
    if (isPaused) {
      audioRef.current?.play().catch(() => {});
      setIsPaused(false);
    } else {
      audioRef.current?.pause();
      setIsPaused(true);
    }
  };

  const stopExercise = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerMinutes(null);
    setRemainingSeconds(null);
    if (audioRef.current) {
      const fadeOut = setInterval(() => {
        if (audioRef.current && audioRef.current.volume > 0.05) {
          audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.08);
        } else {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
          }
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
  };

  const selectTimer = (minutes: number | null) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerMinutes(minutes);
    if (minutes != null && minutes > 0) {
      setRemainingSeconds(minutes * 60);
      timerRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev == null || prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            stopExercise();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setRemainingSeconds(null);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="p-6 space-y-6 animate-in slide-in-from-right duration-500">
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

      {activeExercise && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-10 animate-in fade-in zoom-in-95 duration-500" style={{ background: 'rgba(250, 248, 255, 0.92)', backdropFilter: 'blur(20px)' }}>
          <button 
            onClick={stopExercise}
            className="absolute top-12 right-12 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors glass-warm border border-violet-100/40"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>

          {activeExercise.category === 'Breathing' ? (
            <div className="flex flex-col items-center gap-20 w-full max-w-sm">
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

              {activeExercise.audioUrl && (
                <div className="w-full max-w-xs flex items-center gap-3 px-4">
                  <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={volume * 100} 
                    onChange={(e) => setVolume(Number(e.target.value) / 100)}
                    className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, #9b87c4 0%, #9b87c4 ${volume * 100}%, #e2e8f0 ${volume * 100}%, #e2e8f0 100%)` }}
                  />
                </div>
              )}

              <div className="w-full max-w-xs space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">定时关闭</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {TIMER_OPTIONS.map(m => (
                    <button
                      key={m}
                      onClick={() => selectTimer(timerMinutes === m ? null : m)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${timerMinutes === m ? 'text-white' : 'text-slate-500 bg-slate-100 hover:bg-violet-100'}`}
                      style={timerMinutes === m ? { background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' } : {}}
                    >
                      {m}分钟
                    </button>
                  ))}
                  <button
                    onClick={() => selectTimer(null)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${timerMinutes === null && remainingSeconds === null ? 'text-white' : 'text-slate-500 bg-slate-100 hover:bg-violet-100'}`}
                    style={timerMinutes === null && remainingSeconds === null ? { background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' } : {}}
                  >
                    不关闭
                  </button>
                </div>
                {remainingSeconds != null && remainingSeconds > 0 && (
                  <p className="text-center text-xs text-slate-500">
                    剩余 {Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, '0')}
                  </p>
                )}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={togglePause}
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl active:scale-90 transition-transform"
                  style={{ background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' }}
                >
                  {isPaused ? <PlayIcon /> : <PauseIcon />}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-12 text-center">
              <div className="w-56 h-56 relative bg-slate-50 rounded-[4rem] flex items-center justify-center text-7xl shadow-inner border border-white overflow-hidden">
                {activeExercise.icon}
                {/* Visualizer bars */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1 px-8 items-end h-12 opacity-40">
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 rounded-full ${isPaused ? '' : 'animate-[pulse_1.5s_ease-in-out_infinite]'}`}
                      style={{ height: isPaused ? '30%' : `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s`, background: '#9b87c4', transition: 'height 0.3s' }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-4xl font-black text-slate-800 mb-2">{activeExercise.title}</h2>
                <p className="text-slate-400 font-black tracking-[0.3em] uppercase text-xs">
                  {isPaused ? '已暂停' : activeExercise.audioUrl ? (audioError ? '音频载入中...' : '沉浸疗愈音频中') : '沉浸模式已开启'}
                </p>
              </div>
              <div className="w-64 h-3 bg-slate-100 rounded-full overflow-hidden border border-white">
                <div className={`h-full bg-slate-900 ${isPaused ? '' : 'animate-[shimmer_3s_infinite]'}`} style={{ width: '40%' }}></div>
              </div>
              {activeExercise.audioUrl && (
                <div className="w-full max-w-xs flex items-center gap-3 px-4">
                  <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={volume * 100} 
                    onChange={(e) => setVolume(Number(e.target.value) / 100)}
                    className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, #9b87c4 0%, #9b87c4 ${volume * 100}%, #e2e8f0 ${volume * 100}%, #e2e8f0 100%)` }}
                  />
                  <span className="text-xs text-slate-400 font-bold w-8">{Math.round(volume * 100)}%</span>
                </div>
              )}
              <div className="w-full max-w-xs space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">定时关闭</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {TIMER_OPTIONS.map(m => (
                    <button
                      key={m}
                      onClick={() => selectTimer(timerMinutes === m ? null : m)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${timerMinutes === m ? 'text-white' : 'text-slate-500 bg-slate-100 hover:bg-violet-100'}`}
                      style={timerMinutes === m ? { background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' } : {}}
                    >
                      {m}分钟
                    </button>
                  ))}
                  <button
                    onClick={() => selectTimer(null)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${timerMinutes === null && remainingSeconds === null ? 'text-white' : 'text-slate-500 bg-slate-100 hover:bg-violet-100'}`}
                    style={timerMinutes === null && remainingSeconds === null ? { background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' } : {}}
                  >
                    不关闭
                  </button>
                </div>
                {remainingSeconds != null && remainingSeconds > 0 && (
                  <p className="text-center text-xs text-slate-500">
                    剩余 {Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, '0')}
                  </p>
                )}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={togglePause}
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl active:scale-90 transition-transform"
                  style={{ background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' }}
                >
                  {isPaused ? <PlayIcon /> : <PauseIcon />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RelaxCenter;
