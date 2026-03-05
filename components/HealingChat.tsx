/**
 * 療癒對話：對接千問模型，專注放鬆／正念／情緒安撫
 */
import React, { useState, useEffect, useRef } from 'react';
import { sendHealingMessage } from '../lib/qwenChatService';
import { HedgehogIP } from '../constants';

interface HealingChatProps {
  onClose: () => void;
}

interface SimpleMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function HealingChat({ onClose }: HealingChatProps) {
  const [messages, setMessages] = useState<SimpleMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listEndRef = useRef<HTMLDivElement>(null);
  const hasKey = !!(import.meta.env.VITE_DASHSCOPE_API_KEY as string)?.trim();

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (!hasKey) {
      setError('請在 .env.local 設定 VITE_DASHSCOPE_API_KEY（阿里雲百煉）才能使用療癒對話');
      return;
    }
    setInput('');
    setError(null);
    const userMsg: SimpleMessage = { id: 'u-' + Date.now(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const recent = messages.map((m) => ({ role: m.role, content: m.content }));
      const reply = await sendHealingMessage(text, recent);
      setMessages((prev) => [
        ...prev,
        { id: 'a-' + Date.now(), role: 'assistant', content: reply },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '回覆失敗，請稍後再試';
      setError(msg);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white/95 backdrop-blur-sm animate-in fade-in duration-300">
      <header className="flex-shrink-0 flex items-center gap-3 p-4 border-b border-violet-100/50 bg-white/80">
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl text-slate-600 hover:bg-violet-100/50"
          aria-label="關閉"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex items-center gap-2">
          <HedgehogIP stressLevel={15} size={36} />
          <span className="font-bold text-slate-800">療癒對話 · 小寧</span>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !loading && (
          <p className="text-center text-slate-500 text-sm py-8">
            在這裡可以聊聊心情、放鬆或正念～小寧會溫柔陪伴你。
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                <HedgehogIP stressLevel={15} size={28} />
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
              <HedgehogIP stressLevel={15} size={28} />
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

      <div className="flex-shrink-0 p-4 border-t border-violet-100/50 bg-white/80">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="輸入想說的話..."
            className="flex-1 rounded-2xl border border-violet-200/80 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
            disabled={loading}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="rounded-2xl px-5 py-3 font-bold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(145deg, #7c6ba8 0%, #6b5b96 100%)' }}
          >
            送出
          </button>
        </div>
      </div>
    </div>
  );
}
