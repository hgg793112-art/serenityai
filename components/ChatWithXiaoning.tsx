/**
 * 與小寧文字對話（AI Agent 架構）
 * 接入 Agent Core：情緒識別 → 記憶 → 任務規劃 → 工具 → LLM → 記憶更新
 */
import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage, EmotionResult, AgentToolResult } from '../types';
import {
  getOrCreateUserId,
  getRecentMessages,
} from '../lib/chatService';
import { processMessage } from '../lib/agentCore';
import { HedgehogIP } from '../constants';

interface ChatWithXiaoningProps {
  onBack: () => void;
  moodLogs?: { stressLevel?: number }[];
}

interface ToolCard {
  id: string;
  result: AgentToolResult;
}

export default function ChatWithXiaoning({ onBack, moodLogs = [] }: ChatWithXiaoningProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionResult | null>(null);
  const [toolCards, setToolCards] = useState<ToolCard[]>([]);
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const userId = getOrCreateUserId();
      const recent = await getRecentMessages(userId);
      if (!cancelled) setMessages(recent);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, toolCards]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setError(null);
    const userMsg = { id: 'u-' + Date.now(), role: 'user' as const, content: text, createdAt: Date.now() };
    const assistantId = 'a-' + Date.now();
    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: 'assistant', content: '', createdAt: Date.now() },
    ]);
    setLoading(true);
    try {
      const response = await processMessage(text, {
        onChunk: (partial) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: partial } : m))
          );
        },
        onEmotion: (emotion) => {
          setCurrentEmotion(emotion);
        },
        onToolResult: (result) => {
          if (result.success && result.action !== 'none') {
            setToolCards((prev) => [...prev, { id: Date.now().toString(), result }]);
          }
        },
      });

      if (response.toolResults.length > 0) {
        const toolTexts = response.toolResults
          .filter(r => r.success && r.displayText)
          .map(r => r.displayText!)
          .join('\n\n');
        if (toolTexts) {
          setMessages((prev) => [
            ...prev,
            {
              id: 'tool-' + Date.now(),
              role: 'assistant',
              content: toolTexts,
              createdAt: Date.now(),
            },
          ]);
        }
      }
    } catch (e) {
      const raw = e instanceof Error ? e.message : String(e);
      const msg = raw.length > 80 ? '服務暫時無法使用，請檢查網路或稍後再試。' : raw;
      setError(msg);
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setLoading(false);
    }
  };

  const stressLevel = moodLogs[0]?.stressLevel ?? 50;
  const emotionStress = currentEmotion?.needsSupport
    ? Math.min(100, stressLevel + currentEmotion.intensity * 30)
    : stressLevel;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white animate-in fade-in duration-300">
      <header className="flex items-center gap-3 p-4 border-b border-violet-100/50 bg-white">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-xl text-slate-600 hover:bg-violet-100/50"
          aria-label="返回"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex items-center gap-2">
          <HedgehogIP stressLevel={emotionStress} size={36} />
          <div>
            <span className="font-bold text-slate-800">和小寧聊聊</span>
            {currentEmotion && (
              <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 font-medium">
                {currentEmotion.emotion}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !loading && (
          <p className="text-center text-slate-500 text-sm py-8">
            說點什麼吧～小寧會記住我們的對話。
          </p>
        )}
        {messages.filter((m) => m.content || m.role === 'user').map((m) => (
          <div
            key={m.id}
            className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                <HedgehogIP stressLevel={emotionStress} size={28} />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-violet-600 text-white'
                  : m.id.startsWith('tool-')
                    ? 'bg-amber-50 text-slate-800 border border-amber-200/60'
                    : 'bg-violet-100/80 text-slate-800'
              }`}
            >
              {m.content}
            </div>
            {m.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                我
              </div>
            )}
          </div>
        ))}

        {/* 工具卡片 */}
        {toolCards.map((card) => (
          <div key={card.id} className="mx-2">
            {card.result.action === 'play_audio' && card.result.actionPayload && (
              <button
                onClick={() => {
                  const audio = new Audio(card.result.actionPayload!.audioUrl);
                  audio.play().catch(() => {});
                }}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200/50 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-lg">🎵</div>
                  <div>
                    <p className="font-bold text-sm text-slate-800">{card.result.actionPayload.title}</p>
                    <p className="text-xs text-slate-500">{card.result.actionPayload.duration} · 點擊播放</p>
                  </div>
                </div>
              </button>
            )}
            {card.result.action === 'show_card' && card.result.actionPayload?.type === 'breathing' && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🌬️</span>
                  <span className="font-bold text-sm text-slate-800">{card.result.actionPayload.title}</span>
                </div>
                <div className="flex gap-2">
                  {(card.result.actionPayload.steps as string[]).map((step, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-white/80 text-xs text-slate-600 border border-cyan-100">
                      {step}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.content && (
          <div className="flex gap-2 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
              <HedgehogIP stressLevel={emotionStress} size={28} />
            </div>
            <div className="bg-violet-100/80 text-slate-600 rounded-2xl px-4 py-2.5 text-sm animate-pulse">
              小寧正在想...
            </div>
          </div>
        )}
        {error && (
          <p className="text-center text-rose-600 text-sm">{error}</p>
        )}
        <div ref={listEndRef} />
      </div>

      <div className="p-4 border-t border-violet-100/50 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="輸入訊息..."
            className="flex-1 rounded-2xl border border-violet-200/80 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
            disabled={loading}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="rounded-2xl px-5 py-3 font-bold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(145deg, #9b87c4 0%, #7c6ba8 100%)' }}
          >
            送出
          </button>
        </div>
      </div>
    </div>
  );
}
