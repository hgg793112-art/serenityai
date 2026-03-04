/**
 * 與小寧文字對話（帶近期對話記憶，免費方案）
 * 使用 Gemini 免費額度 + Supabase / localStorage 存近期 N 輪
 */
import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import {
  getOrCreateUserId,
  getRecentMessages,
  sendMessageAndGetReply,
} from '../lib/chatService';
import { HedgehogIP } from '../constants';

interface ChatWithXiaoningProps {
  onBack: () => void;
  moodLogs?: { stressLevel?: number }[];
}

export default function ChatWithXiaoning({ onBack, moodLogs = [] }: ChatWithXiaoningProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setError(null);
    const userMsg = { id: 'u-' + Date.now(), role: 'user' as const, content: text, createdAt: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const reply = await sendMessageAndGetReply(text);
      setMessages((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].role === 'assistant') return prev;
        return [...prev, { id: 'a-' + Date.now(), role: 'assistant', content: reply, createdAt: Date.now() }];
      });
    } catch (e) {
      const raw = e instanceof Error ? e.message : String(e);
      const msg = raw.length > 80 ? '服務暫時無法使用，請檢查網路或稍後再試。' : raw;
      setError(msg);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const stressLevel = moodLogs[0]?.stressLevel ?? 50;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white/95 backdrop-blur-sm animate-in fade-in duration-300">
      <header className="flex items-center gap-3 p-4 border-b border-violet-100/50">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-xl text-slate-600 hover:bg-violet-100/50"
          aria-label="返回"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex items-center gap-2">
          <HedgehogIP stressLevel={stressLevel} size={36} />
          <span className="font-bold text-slate-800">和小寧聊聊</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !loading && (
          <p className="text-center text-slate-500 text-sm py-8">
            說點什麼吧～小寧會記住我們的對話。
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                <HedgehogIP stressLevel={stressLevel} size={28} />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === 'user'
                  ? 'bg-violet-600 text-white'
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
        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
              <HedgehogIP stressLevel={stressLevel} size={28} />
            </div>
            <div className="bg-violet-100/80 text-slate-600 rounded-2xl px-4 py-2.5 text-sm">
              小寧正在想...
            </div>
          </div>
        )}
        {error && (
          <p className="text-center text-rose-600 text-sm">{error}</p>
        )}
        <div ref={listEndRef} />
      </div>

      <div className="p-4 border-t border-violet-100/50">
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
