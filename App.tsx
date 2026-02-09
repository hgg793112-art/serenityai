import React, { useState, useEffect } from 'react';
import { MoodLogEntry, HealthMetric, Mood } from './types';
import { supabase, isSupabaseEnabled } from './lib/supabase';
import Dashboard from './components/Dashboard';
import StressVoiceSession from './components/StressVoiceSession';
import MoodTracker from './components/MoodTracker';
import HealthTrends from './components/HealthTrends';
import RelaxCenter from './components/RelaxCenter';
import Navigation from './components/Navigation';

function rowToMoodLog(row: { id: string; timestamp: number; mood: string; note?: string; stress_level: number }): MoodLogEntry {
  return {
    id: row.id,
    timestamp: row.timestamp,
    mood: row.mood as Mood,
    note: row.note ?? undefined,
    stressLevel: row.stress_level,
  };
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'stress' | 'relax' | 'mood' | 'health'>('dashboard');
  const [moodLogs, setMoodLogs] = useState<MoodLogEntry[]>(() => {
    const saved = localStorage.getItem('mood_logs');
    return saved ? JSON.parse(saved) : [];
  });
  const [healthData, setHealthData] = useState<HealthMetric[]>([]);
  useEffect(() => {
    const mockData: HealthMetric[] = Array.from({ length: 7 }).map((_, i) => ({
      timestamp: Date.now() - (6 - i) * 24 * 60 * 60 * 1000,
      heartRate: 65 + Math.floor(Math.random() * 20),
      steps: 4000 + Math.floor(Math.random() * 8000),
      sleepHours: 5 + Math.random() * 4,
    }));
    setHealthData(mockData);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data, error } = await supabase
        .from('mood_logs')
        .select('id, timestamp, mood, note, stress_level')
        .order('timestamp', { ascending: false });
      if (!error && data) {
        setMoodLogs(data.map(rowToMoodLog));
      }
    })();
  }, []);

  useEffect(() => {
    if (!isSupabaseEnabled()) {
      localStorage.setItem('mood_logs', JSON.stringify(moodLogs));
    }
  }, [moodLogs]);

  const addMoodLog = async (mood: Mood, stress: number, note?: string) => {
    const timestamp = Date.now();
    const newEntry: MoodLogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      mood,
      stressLevel: stress,
      note,
    };
    setMoodLogs(prev => [newEntry, ...prev]);

    if (supabase) {
      const { error } = await supabase.from('mood_logs').insert({
        id: newEntry.id,
        timestamp: newEntry.timestamp,
        mood: newEntry.mood,
        note: newEntry.note ?? null,
        stress_level: newEntry.stressLevel,
      });
      if (error) {
        console.error('Supabase 寫入心情失敗:', error);
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard moodLogs={moodLogs} healthData={healthData} />;
      case 'stress': return <StressVoiceSession onCompleteStressTest={(level) => addMoodLog(Mood.STRESSED, level, '语音测评心情录入')} />;
      case 'relax': return <RelaxCenter />;
      case 'mood': return <MoodTracker moodLogs={moodLogs} onAddLog={addMoodLog} />;
      case 'health': return <HealthTrends healthData={healthData} />;
      default: return <Dashboard moodLogs={moodLogs} healthData={healthData} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfdff] flex flex-col pb-28 max-w-lg mx-auto shadow-2xl relative overflow-hidden font-inter selection:bg-indigo-100">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-indigo-100/50 blur-[100px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[250px] h-[250px] bg-cyan-100/40 blur-[80px] rounded-full animate-bounce" style={{ animationDuration: '8s' }}></div>
      </div>

      <header className="p-8 pb-5 bg-white/40 backdrop-blur-xl border-b border-white/20 sticky top-0 z-30 flex justify-between items-end rounded-b-[3.5rem]">
        <div>
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-1.5 block">内在平和 AI</span>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter">宁静 Serenity</h1>
        </div>
        <div className="w-14 h-14 rounded-[1.75rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100 ring-4 ring-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;
