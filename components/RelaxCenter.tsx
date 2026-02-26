
import React, { useState, useEffect, useRef } from 'react';
import { EXERCISES, HedgehogIP } from '../constants';
import { RelaxationExercise } from '../types';
import { setDailyRelaxDone } from '../lib/dailyTaskStorage';

const RelaxCenter: React.FC = () => {
  const [activeExercise, setActiveExercise] = useState<RelaxationExercise | null>(null);
  const [isBreathing, setIsBreathing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startExercise = (ex: RelaxationExercise) => {
    setDailyRelaxDone();
    if (ex.category === 'Breathing') {
      setIsBreathing(true);
    }
    setActiveExercise(ex);
    
    if (ex.audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(ex.audioUrl);
      audio.loop = true;
      audio.play().catch(e => console.error("Audio playback failed", e));
      audioRef.current = audio;
    }
  };

  const stopExercise = () => {
    setActiveExercise(null);
    setIsBreathing(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

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
        <div className="absolute top-0 left-0 p-6">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black" style={{ background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' }}>AI</div>
        </div>
        
        <div className="flex justify-center mb-6">
          <HedgehogIP stressLevel={15} size={140} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">你好，我是小寧</h2>
        <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed px-4">
          來自寧靜島的放鬆泉。做完呼吸或冥想，島上會更美。「最好的節奏，是讓一切自然發生。」
        </p>
        
        <button className="px-10 py-4 rounded-full text-white font-black text-xs shadow-lg hover:scale-105 active:scale-95 transition-all tracking-widest" style={{ background: 'linear-gradient(145deg, #7c6ba8 0%, #6b5b96 100%)' }}>
          開啟療癒對話
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="font-black text-slate-800 px-2 uppercase text-xs tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#9b87c4' }}></div>
          身心修復庫
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
                <h2 className="text-4xl font-black text-slate-800 mb-2">呼吸練習</h2>
              </div>
              
              <div className="relative flex items-center justify-center w-full">
                <div className="absolute w-72 h-72 rounded-full animate-ping opacity-20" style={{ background: 'rgba(216, 204, 235, 0.6)' }}></div>
                <div className="w-64 h-64 rounded-full flex items-center justify-center p-8 shadow-inner border" style={{ background: 'rgba(245, 240, 255, 0.6)', borderColor: 'rgba(232, 224, 245, 0.6)' }}>
                  <div className="w-full h-full rounded-full animate-[pulse_4s_ease-in-out_infinite] flex items-center justify-center text-white font-black text-2xl shadow-2xl" style={{ background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' }}>
                    呼氣
                  </div>
                </div>
              </div>

              <HedgehogIP stressLevel={10} size={100} />
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
                      className="w-1.5 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" 
                      style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s`, background: '#9b87c4' }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-4xl font-black text-slate-800 mb-2">{activeExercise.title}</h2>
                <p className="text-slate-400 font-black tracking-[0.3em] uppercase text-xs">
                  {activeExercise.audioUrl ? '沉浸療癒音頻中' : '沉浸模式已開啟'}
                </p>
              </div>
              <div className="w-64 h-3 bg-slate-100 rounded-full overflow-hidden border border-white">
                <div className="h-full bg-slate-900 animate-[shimmer_3s_infinite]" style={{ width: '40%' }}></div>
              </div>
              <button 
                onClick={stopExercise}
                className="text-white px-12 py-5 rounded-full font-black text-sm shadow-xl tracking-widest"
                style={{ background: 'linear-gradient(145deg, #7c6ba8 0%, #6b5b96 100%)' }}
              >
                結束練習
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RelaxCenter;
