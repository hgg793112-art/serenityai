
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { ICONS } from '../constants';

function decode(base64: string) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface StressVoiceSessionProps {
  onCompleteStressTest: (stressLevel: number) => void;
}

const StressVoiceSession: React.FC<StressVoiceSessionProps> = ({ onCompleteStressTest }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('感到壓力很大？和我聊聊吧。');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const drawWaveform = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteTimeDomainData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#6366f1';
    ctx.beginPath();

    const sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * canvas.height / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    animationFrameRef.current = requestAnimationFrame(drawWaveform);
  };

  const stopSession = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setIsActive(false);
    setStatusMessage('會話已結束。語音測評功能開發中，暫時無法生成真實壓力報告。');
    
    setTimeout(() => {
        onCompleteStressTest(50);
    }, 1500);
  };

  const startSession = async () => {
    try {
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
      if (!geminiKey) {
        setStatusMessage('語音測評需要 Gemini API Key，請在 .env.local 設定 VITE_GEMINI_API_KEY');
        return;
      }
      setIsConnecting(true);
      setStatusMessage('正在連接 AI 諮詢師...');

      const ai = new GoogleGenAI({ apiKey: geminiKey });
      
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = outCtx;
      inputAudioContextRef.current = inCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Analyser for visualization
      const analyser = inCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            setStatusMessage('我正在聽。你現在感覺怎麼樣？');
            
            const source = inCtx.createMediaStreamSource(stream);
            source.connect(analyser); // Connect to analyser
            
            const scriptProcessor = inCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inCtx.destination);
            drawWaveform();
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outCtx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
          },
          onerror: (e) => console.error('Live API Error:', e),
          onclose: () => setIsActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: '你是一位温暖、富有同理心的 AI 心理压力咨询师。请通过温柔的对话帮助用户评估他们的压力水平。积极倾听并提供冷静的建议。请使用中文交流。',
        },
      });

      sessionRef.current = await sessionPromise;

    } catch (err) {
      console.error(err);
      setIsConnecting(false);
      setStatusMessage('連接失敗。請檢查麥克風權限。');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)] p-8 text-center animate-in fade-in duration-700">
      <div className="relative mb-12 w-full max-w-[280px] h-[200px] flex items-center justify-center">
        {isActive ? (
          <div className="w-full h-full relative">
            <canvas 
              ref={canvasRef} 
              width={280} 
              height={100} 
              className="w-full h-full opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#fdfdff] via-transparent to-transparent pointer-events-none" />
          </div>
        ) : (
          <div className="w-40 h-40 rounded-full flex items-center justify-center shadow-2xl bg-white border-none shadow-indigo-100">
             <div className="text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 max-w-xs">
        <h2 className={`text-2xl font-black tracking-tight transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-800'}`}>
          {isActive ? '正在倾听您...' : '语音压力测评'}
        </h2>
        <p className="text-slate-400 text-sm font-black leading-relaxed min-h-[40px] px-4">
          {statusMessage}
        </p>
      </div>

      <div className="mt-12 w-full space-y-4 px-6">
        {!isActive ? (
          <button
            disabled={isConnecting}
            onClick={startSession}
            className={`w-full py-5 rounded-[2.5rem] font-black shadow-2xl transition-all active:scale-95 text-sm tracking-widest ${
              isConnecting ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black shadow-slate-200'
            }`}
          >
            {isConnecting ? '初始化引擎...' : '开始压力测评'}
          </button>
        ) : (
          <button
            onClick={stopSession}
            className="w-full py-5 rounded-[2.5rem] font-black bg-white text-rose-500 border border-rose-100 shadow-2xl shadow-rose-50 hover:bg-rose-50 transition-all active:scale-95 text-sm tracking-widest"
          >
            结束并分析结果
          </button>
        )}
      </div>

      <div className="mt-10 bg-indigo-50/50 p-5 rounded-[2rem] border border-indigo-50/50 max-w-sm">
        <p className="text-[11px] text-indigo-500 font-black italic leading-loose">
          “通过自然对话，AI 能够捕捉到微小的压力特征，为您提供更精准的身心评估。”
        </p>
      </div>
    </div>
  );
};

export default StressVoiceSession;
