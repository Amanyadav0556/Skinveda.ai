import { useState, useRef, useEffect } from 'react';
import { useApp } from '../App';
import { getSolaceResponse, formatTime } from '../data/mockData';
import { Icon } from '../components/ui';

const SUGGESTED_PROMPTS = [
  'I feel stressed about my skin condition today',
  'My eczema is flaring up and I feel hopeless',
  'How can I manage anxiety about vitiligo?',
  'Can you suggest some stress relief exercises?',
  'I had a good skin day today!',
];

const INITIAL_MESSAGE = {
  id: 0,
  role: 'ai',
  text: "Hello, I'm **Solace** — your companion for the emotional side of skin health.\n\nStress, anxiety and low mood can trigger and worsen flare-ups, and living with a visible condition is hard. I'm here to listen and help you with both.\n\nHow are you feeling today?",
  timestamp: new Date().toISOString(),
};

const EMOTIONS = {
  stressed: { label: 'Stress detected',  tone: 'pill-warn' },
  anxious:  { label: 'Anxiety detected', tone: 'pill-warn' },
  sad:      { label: 'Low mood detected', tone: 'pill-warn' },
  angry:    { label: 'Frustration detected', tone: 'pill-warn' },
  happy:    { label: 'Positive mood',    tone: 'pill-good' },
  neutral:  { label: 'Calm',             tone: 'pill-emerald' },
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

// Minimal **bold** + paragraph rendering
function Rich({ text }) {
  return text.split('\n\n').map((para, i) => (
    <p key={i}>{para.split(/(\*\*[^*]+\*\*)/g).map((seg, j) => seg.startsWith('**') ? <strong key={j}>{seg.slice(2, -2)}</strong> : seg)}</p>
  ));
}

export default function SolaceChat() {
  const { showToast, navigate } = useApp();
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [emotion, setEmotion] = useState('neutral');
  const [voiceMode, setVoiceMode] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, typing]);

  const sendMessage = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || typing) return;
    setInput('');
    setEmotion(detectEmotion(msg));
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: msg, timestamp: new Date().toISOString() }]);
    setTyping(true);
    await new Promise(r => setTimeout(r, 1100 + Math.random() * 900));
    setTyping(false);
    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: getSolaceResponse(msg), timestamp: new Date().toISOString() }]);
  };

  const onKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const toggleVoice = () => { setVoiceMode(v => !v); if (!voiceMode) showToast('Voice mode on — speech-to-text ready', 'info'); };
  const clearChat = () => { setMessages([INITIAL_MESSAGE]); setEmotion('neutral'); };
  const emo = EMOTIONS[emotion];

  return (
    <div className="chat-shell">
      <section className="card chat-panel">
        <header className="chat-head">
          <div className="row">
            <span className="chat-bot"><Icon name="leaf" size={20} /></span>
            <div>
              <strong style={{ fontSize: 15.5 }}>Solace</strong>
              <div className="muted" style={{ fontSize: 12.5 }}>{typing ? 'Typing…' : 'AI wellbeing companion · online'}</div>
            </div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <span className={`pill ${emo.tone}`}>{emo.label}</span>
            <button className="icon-btn" onClick={clearChat} title="New conversation" aria-label="New conversation"><Icon name="refresh" size={17} /></button>
          </div>
        </header>

        <div className="chat-scroll" aria-live="polite">
          {messages.map(m => (
            <div key={m.id} className={`msg ${m.role === 'user' ? 'user' : ''}`}>
              {m.role === 'ai' && <span className="msg-avatar"><Icon name="leaf" size={15} /></span>}
              <div>
                <div className="msg-bubble"><Rich text={m.text} /></div>
                <div className="msg-time">{formatTime(m.timestamp)}</div>
              </div>
            </div>
          ))}
          {typing && (
            <div className="msg">
              <span className="msg-avatar"><Icon name="leaf" size={15} /></span>
              <div className="msg-bubble typing" aria-label="Solace is typing"><span /><span /><span /></div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="chat-input">
          <button className={`icon-btn${voiceMode ? ' has-dot' : ''}`} onClick={toggleVoice} aria-pressed={voiceMode} title="Voice mode" aria-label="Voice mode">
            <Icon name="mic" size={19} />
          </button>
          <textarea rows={1} placeholder="Share what’s on your mind…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey} aria-label="Message Solace" />
          <button className="btn btn-dark" onClick={() => sendMessage()} disabled={!input.trim() || typing} aria-label="Send">
            <Icon name="send" size={18} />
          </button>
        </div>
      </section>

      <aside className="stack">
        <div className="card">
          <div className="card-head"><h3>Try asking</h3></div>
          <div className="prompt-list">
            {SUGGESTED_PROMPTS.map(p => <button key={p} onClick={() => sendMessage(p)} disabled={typing}>{p}</button>)}
          </div>
        </div>
        <div className="card card-tint">
          <div className="card-head"><h3>60-second reset</h3></div>
          <ol className="next-steps">
            <li><div><strong>Breathe in for 4</strong>Through the nose, into the belly.</div></li>
            <li><div><strong>Hold for 7</strong>Let your shoulders drop.</div></li>
            <li><div><strong>Out for 8</strong>Slowly, through the mouth.</div></li>
          </ol>
        </div>
        <div className="callout callout-warn">
          <Icon name="phone" size={18} />
          <div><strong>Need urgent support?</strong>Solace isn’t a crisis service. In India, call Tele-MANAS on 14416 (24×7), or your local emergency number.</div>
        </div>
        <button className="btn btn-ghost btn-block" onClick={() => navigate('mood')}><Icon name="smile" size={16} /> Log today’s mood</button>
      </aside>
    </div>
  );
}
