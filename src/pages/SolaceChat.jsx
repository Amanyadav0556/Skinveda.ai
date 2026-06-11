import { useState, useRef, useEffect } from 'react';
import { useApp } from '../App';
import { getSolaceResponse } from '../data/mockData';

const SUGGESTED_PROMPTS = [
  "I feel stressed about my skin condition today",
  "My eczema is flaring up and I feel hopeless",
  "How can I manage anxiety about vitiligo?",
  "I'm feeling anxious about going out with my condition",
  "Can you suggest some stress relief exercises?",
  "I had a good skin day today!",
];

const INITIAL_MESSAGE = {
  id: 0,
  role: 'ai',
  text: "Hello! I'm **Solace**, your AI mental health companion. I'm here to support you through the emotional challenges of living with a chronic skin condition like eczema, psoriasis, vitiligo, or acne.\n\nResearch shows that mental health and skin health are deeply interconnected — stress, anxiety, and depression can trigger and worsen flare-ups. I'm here to help you navigate both.\n\nHow are you feeling today? 💙",
  timestamp: new Date().toISOString(),
  emotion: 'neutral',
};

const EMOTIONS = {
  stressed: { icon: '😤', label: 'Stress Detected', color: '#ef4444' },
  anxious: { icon: '😰', label: 'Anxiety Detected', color: '#a78bfa' },
  sad: { icon: '😢', label: 'Sadness Detected', color: '#3b82f6' },
  angry: { icon: '😠', label: 'Anger Detected', color: '#f97316' },
  happy: { icon: '😊', label: 'Positive Mood', color: '#22c55e' },
  neutral: { icon: '😌', label: 'Calm', color: '#00d9a6' },
};

function detectEmotion(text) {
  const lower = text.toLowerCase();
  if (/stress|overwhelm|pressure/.test(lower)) return 'stressed';
  if (/anxious|anxiety|panic|worry/.test(lower)) return 'anxious';
  if (/sad|depress|hopeless|cry|crying/.test(lower)) return 'sad';
  if (/angry|rage|furious|hate/.test(lower)) return 'angry';
  if (/happy|great|good|better|improve/.test(lower)) return 'happy';
  return 'neutral';
}

export default function SolaceChat() {
  const { showToast } = useApp();
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [emotion, setEmotion] = useState('neutral');
  const [voiceMode, setVoiceMode] = useState(false);
  const [recording, setRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');

    const detectedEmotion = detectEmotion(msg);
    setEmotion(detectedEmotion);

    const userMsg = { id: Date.now(), role: 'user', text: msg, timestamp: new Date().toISOString(), emotion: detectedEmotion };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    // Simulate Solace AI thinking
    const thinkTime = 1200 + Math.random() * 1000;
    await new Promise(r => setTimeout(r, thinkTime));

    const response = getSolaceResponse(msg);
    setTyping(false);
    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: response, timestamp: new Date().toISOString(), emotion: 'neutral' }]);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const toggleVoice = () => {
    if (!voiceMode) {
      setVoiceMode(true);
      showToast('Voice mode enabled — speech-to-text ready', 'info');
    } else {
      setVoiceMode(false);
      setRecording(false);
    }
  };

  const clearChat = () => { setMessages([INITIAL_MESSAGE]); setEmotion('neutral'); };

  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  const emotionInfo = EMOTIONS[emotion] || EMOTIONS.neutral;

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - var(--topbar-height) - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#f43f8f,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 0 20px rgba(244,63,143,0.3)', animation: 'glow 3s ease-in-out infinite' }}>🤖</div>
            <div>
              <h1 className="page-title" style={{ fontSize: 24, margin: 0 }}>Solace AI</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', animation: 'pulse 2s ease-in-out infinite' }} />
                <span style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 600 }}>Online · Mental Health Companion</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Emotion Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 20, background: `${emotionInfo.color}15`, border: `1px solid ${emotionInfo.color}30` }}>
            <span>{emotionInfo.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: emotionInfo.color }}>{emotionInfo.label}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={clearChat}>Clear</button>
        </div>
      </div>

      {/* Alert */}
      <div className="alert alert-info" style={{ marginBottom: 16, flexShrink: 0, fontSize: 12 }}>
        <span>🤖</span>
        <div>Solace is an AI assistant for emotional support only. For mental health crises, please contact a qualified therapist or emergency services. In India: iCall — 9152987821</div>
      </div>

      {/* Suggested Prompts */}
      {messages.length <= 1 && (
        <div style={{ marginBottom: 16, flexShrink: 0 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Suggested Conversations</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SUGGESTED_PROMPTS.map((p, i) => (
              <button key={i} onClick={() => sendMessage(p)} style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-sans)' }} className="btn-ghost">
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((msg) => (
          <div key={msg.id} className="animate-fade-in" style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            {/* Avatar */}
            <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: msg.role === 'ai' ? 'linear-gradient(135deg,#f43f8f,#7c3aed)' : 'linear-gradient(135deg,#00d9a6,#7c3aed)' }}>
              {msg.role === 'ai' ? '🤖' : '👤'}
            </div>

            <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: 4, alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}
                dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {msg.role === 'ai' ? 'Solace AI' : 'You'} · {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                {msg.role === 'user' && msg.emotion && msg.emotion !== 'neutral' && (
                  <span style={{ color: EMOTIONS[msg.emotion]?.color, fontSize: 13 }}>{EMOTIONS[msg.emotion]?.icon}</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {typing && (
          <div className="animate-fade-in" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#f43f8f,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🤖</div>
            <div className="chat-bubble chat-bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 18px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-rose)', animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ flexShrink: 0, marginTop: 16 }}>
        {voiceMode && (
          <div style={{ textAlign: 'center', padding: '16px', marginBottom: 12, background: recording ? 'rgba(239,68,68,0.1)' : 'rgba(124,58,237,0.08)', border: `1px solid ${recording ? 'rgba(239,68,68,0.3)' : 'rgba(124,58,237,0.2)'}`, borderRadius: 12 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>{recording ? '🔴' : '🎙️'}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: recording ? 'var(--accent-red)' : 'var(--accent-purple-light)' }}>
              {recording ? 'Recording... (OpenAI Whisper STT)' : 'Press to start speaking'}
            </div>
            <button className="btn btn-purple" style={{ marginTop: 12 }} onClick={() => setRecording(r => !r)}>
              {recording ? '⏹ Stop Recording' : '🎙 Start Recording'}
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 16, padding: '12px 14px', transition: 'all 0.2s' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share how you're feeling... (Enter to send, Shift+Enter for new line)"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 14, resize: 'none', maxHeight: 120, minHeight: 24, lineHeight: 1.5, fontFamily: 'var(--font-sans)' }}
            rows={1}
            disabled={typing}
          />
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={toggleVoice} className={`btn ${voiceMode ? 'btn-purple' : 'btn-ghost'} btn-icon`} title="Voice mode">
              {voiceMode ? '🔴' : '🎙️'}
            </button>
            <button onClick={() => sendMessage()} disabled={!input.trim() || typing} className="btn btn-primary btn-icon" title="Send message">
              {typing ? <span className="spinner spinner-sm" /> : '→'}
            </button>
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
          Powered by SkinVeda Solace AI · Emotion-aware mental health support · OpenAI Whisper voice input
        </div>
      </div>
    </div>
  );
}
