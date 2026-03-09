/**
 * 疗愈对话：对接豆包模型，专注放松／正念／情绪安抚
 * 接入 Emotion Engine 即时识别情绪
 */
import React, { useState, useEffect, useRef } from 'react';
import { sendHealingMessage } from '../lib/qwenChatService';
import { detectEmotionFast } from '../lib/emotionEngine';
import type { EmotionResult } from '../types';
import { HedgehogIP } from '../constants';

const StaticHedgehog = ({ size = 28 }: { size?: number }) => (
  <img src="/ip/hedgehog-calm.png" alt="小宁" width={size} height={size} className="object-contain" draggable={false} />
);

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
  const [currentEmotion, setCurrentEmotion] = useState<EmotionResult | null>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setError(null);
    const userMsg: SimpleMessage = { id: 'u-' + Date.now(), role: 'user', content: text };
    const assistantId = 'a-' + Date.now();
    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: 'assistant', content: '' },
    ]);
    setLoading(true);
    const emotion = detectEmotionFast(text);
    setCurrentEmotion(emotion);
    try {
      const recent = messages.map((m) => ({ role: m.role, content: m.content }));
      await sendHealingMessage(text, recent, (partial) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: partial } : m))
        );
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '回复失败，请稍后再试';
      setError(msg);
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
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
          aria-label="关闭"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex items-center gap-2">
          <StaticHedgehog size={36} />
          <div>
            <span className="font-bold text-slate-800">疗愈对话 · 小宁</span>
            {currentEmotion && currentEmotion.emotion !== 'neutral' && (
              <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 font-medium">
                {currentEmotion.emotion}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !loading && (
          <p className="text-center text-slate-500 text-sm py-8">
            在这里可以聊聊心情、放松或正念～小宁会温柔陪伴你。
          </p>
        )}
        {messages.filter((m) => m.content || m.role === 'user').map((m) => (
          <div
            key={m.id}
            className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                <StaticHedgehog size={28} />
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
        {loading && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.content && (
          <div className="flex gap-2 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
              <StaticHedgehog size={28} />
            </div>
            <div className="bg-violet-100/80 text-slate-600 rounded-2xl px-4 py-2.5 text-sm animate-pulse">
              小宁正在想...
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
            placeholder="输入想说的话..."
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
