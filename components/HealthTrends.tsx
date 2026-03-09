import React, { useMemo } from 'react';
import { MoodLogEntry, HealthMetric, Mood } from '../types';
import { LineChart, Line, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import type { WellnessResult } from '../lib/wellnessEngine';

const MOOD_EMOJI: Record<string, string> = {
  [Mood.EXCITED]: '🤩',
  [Mood.HAPPY]: '😊',
  [Mood.CALM]: '😌',
  [Mood.TIRED]: '🥱',
  [Mood.SAD]: '😔',
  [Mood.ANXIOUS]: '😟',
  [Mood.STRESSED]: '😫',
};

const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

interface HealthTrendsProps {
  healthData: HealthMetric[];
  moodLogs?: MoodLogEntry[];
  wellnessResult?: WellnessResult;
}

function toDateKey(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

function getWeekDates(): string[] {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

const HealthTrends: React.FC<HealthTrendsProps> = ({ healthData, moodLogs = [], wellnessResult }) => {
  const weekDates = useMemo(() => getWeekDates(), []);
  const today = toDateKey(Date.now());

  const logsByDate = useMemo(() => {
    const map: Record<string, MoodLogEntry> = {};
    for (const log of moodLogs) {
      const key = toDateKey(log.timestamp);
      if (!map[key]) map[key] = log;
    }
    return map;
  }, [moodLogs]);

  const weekData = useMemo(() => {
    return weekDates.map((date, i) => {
      const log = logsByDate[date];
      return {
        date,
        label: WEEKDAY_LABELS[i],
        emoji: log ? (MOOD_EMOJI[log.mood] ?? '😐') : null,
        stress: log ? log.stressLevel : null,
        isToday: date === today,
        isFuture: date > today,
      };
    });
  }, [weekDates, logsByDate, today]);

  const stressTrendData = useMemo(() => {
    return weekData
      .filter(d => d.stress !== null)
      .map(d => ({ name: d.label, stress: d.stress }));
  }, [weekData]);

  const trendArrow = wellnessResult?.trend === 'improving' ? '↑' : wellnessResult?.trend === 'worsening' ? '↓' : '→';
  const trendText = wellnessResult?.trend === 'improving' ? '趋势好转' : wellnessResult?.trend === 'worsening' ? '需要关注' : '保持稳定';
  const trendColor = wellnessResult?.trend === 'improving' ? 'text-emerald-500' : wellnessResult?.trend === 'worsening' ? 'text-rose-500' : 'text-slate-400';

  const dims = wellnessResult?.dimensions;
  const activeDims = dims ? [
    { key: '情绪', value: dims.emotion, color: '#9b87c4' },
    { key: '行为', value: dims.behavior, color: '#7c6ba8' },
    { key: '自评', value: dims.selfReport, color: '#6b5b96' },
  ] : [];

  const chartData = healthData.map(d => ({
    ...d,
    date: new Date(d.timestamp).toLocaleDateString('zh-CN', { weekday: 'short' })
  }));

  const latestData = healthData.length > 0 ? healthData[healthData.length - 1] : null;

  return (
    <div className="p-6 space-y-6 animate-in slide-in-from-bottom duration-500">

      {/* ─── 健康数据概览 ─── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-warm rounded-2xl p-4 border border-violet-100/30 text-center shadow-sm">
          <span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest">今日步数</span>
          <span className="text-xl font-black text-slate-800">{latestData ? (latestData.steps / 1000).toFixed(1) + 'k' : '--'}</span>
        </div>
        <div className="glass-warm rounded-2xl p-4 border border-violet-100/30 text-center shadow-sm">
          <span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest">即时心率</span>
          <span className="text-xl font-black text-red-500">{latestData?.heartRate ?? '--'}</span>
        </div>
        <div className="glass-warm rounded-2xl p-4 border border-violet-100/30 text-center shadow-sm">
          <span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest">睡眠时长</span>
          <span className="text-xl font-black" style={{ color: '#7c6ba8' }}>{latestData ? latestData.sleepHours.toFixed(1) + 'h' : '--'}</span>
        </div>
      </div>

      {/* ─── 活动量趋势 ─── */}
      {chartData.length > 0 && (
        <div className="glass-warm rounded-[2.5rem] p-8 shadow-sm h-[320px] border border-violet-100/40">
          <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 rounded-full" style={{ background: '#9b87c4' }}></span>
            活动量趋势
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9b87c4" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#9b87c4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 900}} />
              <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900 }} itemStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
              <Area type="monotone" dataKey="steps" stroke="#7c6ba8" fillOpacity={1} fill="url(#colorSteps)" strokeWidth={4} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ─── 静息心率 ─── */}
      {chartData.length > 0 && (
        <div className="glass-warm rounded-[2.5rem] p-8 shadow-sm h-[320px] border border-violet-100/40">
          <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-red-400 rounded-full"></span>
            静息心率
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 900}} />
              <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900 }} />
              <Line type="monotone" dataKey="heartRate" stroke="#f87171" strokeWidth={4} dot={{ r: 5, fill: '#f87171', strokeWidth: 3, stroke: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ─── 本周情绪 ─── */}
      <section className="glass-warm rounded-[2.5rem] p-6 border border-violet-100/40">
        <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2 mb-5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#9b87c4' }}></span>
          本周情绪
        </h3>

        <div className="grid grid-cols-7 gap-1 text-center mb-4">
          {weekData.map(d => (
            <div key={d.date} className={`flex flex-col items-center gap-1 py-2 rounded-2xl transition-all ${
              d.isToday ? 'bg-violet-100/60 ring-1 ring-violet-200' : ''
            } ${d.isFuture ? 'opacity-30' : ''}`}>
              <span className="text-[10px] font-black text-slate-400">{d.label}</span>
              <span className="text-xl h-8 flex items-center justify-center">
                {d.emoji ?? (d.isFuture ? '' : <span className="text-slate-200 text-sm">--</span>)}
              </span>
              <span className={`text-[9px] font-bold ${
                d.stress !== null
                  ? d.stress <= 30 ? 'text-emerald-500' : d.stress <= 65 ? 'text-violet-500' : 'text-rose-500'
                  : 'text-transparent'
              }`}>
                {d.stress !== null ? `${d.stress}%` : '--'}
              </span>
            </div>
          ))}
        </div>

        {stressTrendData.length >= 2 && (
          <div className="h-[80px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stressTrendData}>
                <defs>
                  <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9b87c4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#9b87c4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="stress" stroke="#9b87c4" strokeWidth={2.5} fill="url(#stressGrad)" dot={{ r: 3, fill: '#7c6ba8', strokeWidth: 2, stroke: '#fff' }} />
                <XAxis dataKey="name" hide />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {moodLogs.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-2">还没有记录，每天打卡就能看到情绪轨迹</p>
        )}
      </section>

      {/* ─── 压力指数 ─── */}
      {wellnessResult && (
        <section className="glass-warm rounded-[2.5rem] p-6 border border-violet-100/40">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#7c6ba8' }}></span>
            压力指数
          </h3>

          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-4xl font-black" style={{ color: '#7c6ba8' }}>{wellnessResult.score}</span>
            <span className="text-xs text-slate-400 font-bold">/ 100</span>
            <span className={`text-sm font-black ${trendColor}`}>{trendArrow} {trendText}</span>
          </div>

          <div className="space-y-3">
            {activeDims.map(d => (
              <div key={d.key} className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 w-8">{d.key}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${d.value}%`, background: d.color }}
                  />
                </div>
                <span className="text-xs font-black text-slate-600 w-8 text-right">{d.value}</span>
              </div>
            ))}
          </div>

          {wellnessResult.suggestion && (
            <p className="text-xs text-slate-500 mt-4 p-3 rounded-2xl bg-violet-50/50 border border-violet-100/30">
              {wellnessResult.suggestion}
            </p>
          )}
        </section>
      )}
    </div>
  );
};

export default HealthTrends;
