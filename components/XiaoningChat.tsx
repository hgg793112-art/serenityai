import React, { useMemo } from 'react';
import { MoodLogEntry } from '../types';
import { HedgehogIP } from '../constants';
import { setDailyChatDone } from '../lib/dailyTaskStorage';

interface XiaoningChatProps {
  moodLogs: MoodLogEntry[];
  onClose: () => void;
  onGoMood: () => void;
  onGoRelax: () => void;
}

export default function XiaoningChat({ moodLogs, onClose, onGoMood, onGoRelax }: XiaoningChatProps) {
  setDailyChatDone(); // mark daily chat as done when modal is open

  const greeting = useMemo(() => {
    const recent = moodLogs[0];
    const stress = recent ? recent.stressLevel : 50;
    const mood = recent?.mood;
    const moodKey = mood ?? '';
    const anxious = ['ANXIOUS', 'STRESSED', 'SAD'].includes(moodKey);
    if (anxious && stress > 60) {
      return '你今天好像有點累，要不要跟我說說？或者我們先做個深呼吸？';
    }
    if (recent && ['HAPPY', 'CALM', 'EXCITED'].includes(moodKey)) {
      return '看到你狀態不錯，小寧也很開心～';
    }
    const lastLog = moodLogs[0];
    const lastDate = lastLog ? new Date(lastLog.timestamp).toDateString() : '';
    const today = new Date().toDateString();
    const daysSince = lastDate ? Math.floor((new Date().getTime() - new Date(lastLog!.timestamp).getTime()) / 86400000) : 99;
    if (daysSince >= 3) {
      return '好久沒見啦，最近還好嗎？想記錄一下現在的心情嗎？';
    }
    return '小寧一直在寧靜島等你。今天想記錄心情，還是先去放鬆一下？';
  }, [moodLogs]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md glass-warm rounded-[2.5rem] p-8 border border-violet-100/40 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-center mb-4">
          <HedgehogIP stressLevel={moodLogs[0]?.stressLevel ?? 30} size={100} />
        </div>
        <p className="text-slate-700 text-center text-sm leading-relaxed mb-6 font-medium">
          「{greeting}」
        </p>
        <div className="space-y-3">
          <button
            onClick={() => { onClose(); onGoMood(); }}
            className="w-full py-3 rounded-2xl font-bold text-white"
            style={{ background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' }}
          >
            去記錄心情
          </button>
          <button
            onClick={() => { onClose(); onGoRelax(); }}
            className="w-full py-3 rounded-2xl font-bold text-slate-600 bg-slate-100"
          >
            去放鬆一下
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl font-bold text-slate-400 text-sm"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}
