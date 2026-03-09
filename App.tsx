import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MoodLogEntry, HealthMetric, EmotionRecord, Mood } from './types';
import { supabase, isSupabaseEnabled } from './lib/supabase';
import { initHealth, fetchHeartRateData, generateMockData } from './lib/healthService';
import { getEmotionRecords } from './lib/memorySystem';
import { getDailyTaskStatus, getConsecutiveDays as getDailyStreak } from './lib/dailyTaskStorage';
import { computeWellnessScore, WellnessResult } from './lib/wellnessEngine';
import { getOrCreateUserId } from './lib/chatService';
import Dashboard from './components/Dashboard';
import HealthTrends from './components/HealthTrends';
import RelaxCenter from './components/RelaxCenter';
import Navigation from './components/Navigation';
import Onboarding from './components/Onboarding';
import HealingChat from './components/HealingChat';
import DailyCheckin from './components/DailyCheckin';

function rowToMoodLog(row: { id: string; timestamp: number; mood: string; note?: string; stress_level: number }): MoodLogEntry {
  return {
    id: row.id,
    timestamp: row.timestamp,
    mood: row.mood as Mood,
    note: row.note ?? undefined,
    stressLevel: row.stress_level,
  };
}

type OverlayPage = 'healing-chat' | null;

const App: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('onboarding_completed');
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'relax' | 'health'>('dashboard');
  const [overlayPage, setOverlayPage] = useState<OverlayPage>(null);
  const [showCheckin, setShowCheckin] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    const done = localStorage.getItem('onboarding_completed');
    const checked = localStorage.getItem('mood_checkin_' + today);
    return !!done && !checked;
  });
  const [moodLogs, setMoodLogs] = useState<MoodLogEntry[]>(() => {
    const saved = localStorage.getItem('mood_logs');
    return saved ? JSON.parse(saved) : [];
  });
  const [healthData, setHealthData] = useState<HealthMetric[]>([]);
  const [emotionRecords, setEmotionRecords] = useState<EmotionRecord[]>([]);

  useEffect(() => {
    (async () => {
      const available = await initHealth();
      if (available) {
        try {
          const hrData = await fetchHeartRateData();
          if (hrData.length > 0) {
            const data: HealthMetric[] = hrData.map(({ timestamp, heartRate }) => ({
              timestamp,
              heartRate,
              steps: 4000 + Math.floor(Math.random() * 8000),
              sleepHours: 5 + Math.random() * 4,
            }));
            setHealthData(data);
            return;
          }
        } catch (e) {
          console.warn('Health Connect 读取失败:', e);
        }
      }
      setHealthData(generateMockData());
    })();
  }, []);

  const refreshEmotionRecords = useCallback(async () => {
    try {
      const userId = getOrCreateUserId();
      const records = await getEmotionRecords(userId, 20);
      setEmotionRecords(records);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { refreshEmotionRecords(); }, [refreshEmotionRecords]);

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
        console.error('Supabase 写入心情失败:', error);
      }
    }
  };

  const wellnessResult = useMemo<WellnessResult>(() => {
    const { chatDone, relaxDone } = getDailyTaskStatus();
    const streak = getDailyStreak();
    return computeWellnessScore({
      moodLogs,
      emotionRecords,
      healthData,
      dailyChatDone: chatDone,
      dailyRelaxDone: relaxDone,
      streak,
    });
  }, [moodLogs, emotionRecords, healthData]);

  const dismissCheckin = () => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem('mood_checkin_' + today, '1');
    setShowCheckin(false);
  };

  const handleCheckinComplete = (mood: Mood, stress: number) => {
    addMoodLog(mood, stress, '每日打卡');
    dismissCheckin();
  };

  const openCheckin = () => setShowCheckin(true);

  const handleOnboardingComplete = (initialMood: Mood, initialStress: number) => {
    localStorage.setItem('onboarding_completed', 'true');
    setShowOnboarding(false);
    addMoodLog(initialMood, initialStress, '首次记录');
    dismissCheckin();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard moodLogs={moodLogs} healthData={healthData} onTabChange={setActiveTab} wellnessResult={wellnessResult} onOpenCheckin={openCheckin} />;
      case 'relax': return <RelaxCenter onOpenHealingChat={() => setOverlayPage('healing-chat')} wellnessScore={wellnessResult.score} />;
      case 'health': return <HealthTrends healthData={healthData} moodLogs={moodLogs} wellnessResult={wellnessResult} />;
      default: return <Dashboard moodLogs={moodLogs} healthData={healthData} onTabChange={setActiveTab} wellnessResult={wellnessResult} onOpenCheckin={openCheckin} />;
    }
  };

  // 疗愈对话以独立新页面显示，取代整个主画面
  if (overlayPage === 'healing-chat') {
    return (
      <>
        {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
        <div className="min-h-screen flex flex-col max-w-lg mx-auto font-inter selection:bg-violet-100" style={{ background: 'linear-gradient(180deg, #faf8ff 0%, #f0ebf8 50%, #ebe4f5 100%)' }}>
          <HealingChat onClose={() => { setOverlayPage(null); refreshEmotionRecords(); }} />
        </div>
      </>
    );
  }

  return (
    <>
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}

      <div
        className="min-h-screen flex flex-col pb-28 max-w-lg mx-auto shadow-xl relative overflow-hidden font-inter selection:bg-violet-100"
        style={{ background: 'linear-gradient(180deg, #faf8ff 0%, #f0ebf8 50%, #ebe4f5 100%)' }}
      >
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-[-15%] right-[-5%] w-[280px] h-[280px] rounded-full opacity-60" style={{ background: 'radial-gradient(circle, rgba(216, 204, 235, 0.7) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>
          <div className="absolute bottom-[5%] left-[-10%] w-[220px] h-[220px] rounded-full opacity-50" style={{ background: 'radial-gradient(circle, rgba(245, 230, 255, 0.6) 0%, transparent 70%)', filter: 'blur(50px)' }}></div>
        </div>

        {activeTab === 'dashboard' && (
          <header className="p-6 pb-4 glass-warm sticky top-0 z-30 flex justify-between items-end rounded-b-[2.5rem] border-b border-violet-100/50">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.35em] mb-1 block" style={{ color: '#7c6ba8' }}>你的情绪小伙伴 · 宁静岛</span>
              <h1 className="text-2xl font-black tracking-tight text-slate-800">小宁陪你</h1>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ring-2 ring-white/80" style={{ background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' }}>
              <svg viewBox="0 0 100 100" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg"><ellipse cx="52" cy="52" rx="38" ry="36" fill="currentColor" opacity="0.9"/><path d="M20 52 Q52 90 84 52 Q52 28 20 52" fill="currentColor" opacity="0.7"/></svg>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>

        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {showCheckin && !showOnboarding && (
        <DailyCheckin onComplete={handleCheckinComplete} onSkip={dismissCheckin} />
      )}
    </>
  );
};

export default App;
