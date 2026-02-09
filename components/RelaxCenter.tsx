
import React, { useState, useEffect, useRef } from 'react';
import { EXERCISES, KolaIP } from '../constants';
import { RelaxationExercise } from '../types';

const RelaxCenter: React.FC = () => {
  const [activeExercise, setActiveExercise] = useState<RelaxationExercise | null>(null);
  const [isBreathing, setIsBreathing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startExercise = (ex: RelaxationExercise) => {
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
      <div className="bg-white/40 glass rounded-[3rem] p-10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 p-6">
          <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white text-[10px] font-black">AI</div>
        </div>
        
        <div className="flex justify-center mb-6">
          <KolaIP stressLevel={15} size={140} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">你好！我是 Kola。</h2>
        <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed px-4">
          “最好的生活节奏，是让一切自然发生。”
        </p>
        
        <button className="bg-slate-900 px-10 py-4 rounded-full text-white font-black text-xs shadow-xl hover:scale-105 active:scale-95 transition-all tracking-widest">
          开启 AI 疗愈对话
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="font-black text-slate-800 px-2 uppercase text-xs tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
          身心修复库
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {EXERCISES.map(ex => (
            <button
              key={ex.id}
              onClick={() => startExercise(ex)}
              className="bg-white/60 glass p-6 rounded-[2.5rem] border-none shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all text-left flex flex-col gap-4 group"
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
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-3xl flex flex-col items-center justify-center p-10 animate-in fade-in zoom-in-95 duration-500">
          <button 
            onClick={stopExercise}
            className="absolute top-12 right-12 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>

          {activeExercise.category === 'Breathing' ? (
            <div className="flex flex-col items-center gap-20 w-full max-w-sm">
              <div className="text-center">
                <span className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.4em] mb-3 block">正念禅定</span>
                <h2 className="text-4xl font-black text-slate-800 mb-2">呼吸练习</h2>
              </div>
              
              <div className="relative flex items-center justify-center w-full">
                <div className="absolute w-72 h-72 bg-cyan-100 rounded-full animate-ping opacity-20"></div>
                <div className="w-64 h-64 bg-cyan-50/50 border border-cyan-100 rounded-full flex items-center justify-center p-8 shadow-inner">
                  <div className="w-full h-full bg-cyan-500 rounded-full animate-[pulse_4s_ease-in-out_infinite] flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-cyan-200">
                    呼气
                  </div>
                </div>
              </div>

              <KolaIP stressLevel={10} size={100} />
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
                      className="w-1.5 bg-indigo-500 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" 
                      style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-4xl font-black text-slate-800 mb-2">{activeExercise.title}</h2>
                <p className="text-slate-400 font-black tracking-[0.3em] uppercase text-xs">
                  {activeExercise.audioUrl ? '沉浸疗愈音频中' : '沉浸模式已开启'}
                </p>
              </div>
              <div className="w-64 h-3 bg-slate-100 rounded-full overflow-hidden border border-white">
                <div className="h-full bg-slate-900 animate-[shimmer_3s_infinite]" style={{ width: '40%' }}></div>
              </div>
              <button 
                onClick={stopExercise}
                className="bg-slate-900 text-white px-12 py-5 rounded-full font-black text-sm shadow-2xl shadow-slate-200 tracking-widest"
              >
                结束练习
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RelaxCenter;
