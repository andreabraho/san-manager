import { useState, useEffect, useRef } from 'react';
import BaseWidget from './BaseWidget';
import api from '../../services/api';

// ── Edit-mode style tokens ────────────────────────────────────────────────────
const E = {
  wrap: { padding: 12, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 6 },
  fieldLabel: { fontSize: 10, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' },
  helperText: { fontSize: 11, color: '#9ca3af', marginTop: 2, lineHeight: 1.4 },
  input: {
    width: '100%',
    padding: '6px 8px',
    border: '1px solid #e5e7eb',
    borderRadius: 5,
    fontSize: 13,
    boxSizing: 'border-box',
    background: '#fff',
    color: '#111',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '6px 8px',
    border: '1px solid #e5e7eb',
    borderRadius: 5,
    fontSize: 13,
    boxSizing: 'border-box',
    background: '#fff',
    color: '#111',
    resize: 'vertical',
    outline: 'none',
    flex: 1,
    minHeight: 60,
  },
};

const focusStyle = { borderColor: '#3b82f6', outline: '2px solid #3b82f6', outlineOffset: 1 };
const blurStyle  = { borderColor: '#e5e7eb', outline: 'none' };
const fh = { onFocus: (e) => Object.assign(e.target.style, focusStyle), onBlur: (e) => Object.assign(e.target.style, blurStyle) };

// ── Typing indicator ──────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div style={{
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 12px',
    background: '#f3f4f6',
    borderRadius: '4px 14px 14px 14px',
    minHeight: 34,
  }}>
    <style>{`
      @keyframes blink { 0%,80%,100%{opacity:0} 40%{opacity:1} }
      .chat-dot { display:inline-block; width:6px; height:6px; border-radius:50%; background:#9ca3af; margin:0 2px; animation: blink 1.4s infinite; }
      .chat-dot:nth-child(2){animation-delay:0.2s}
      .chat-dot:nth-child(3){animation-delay:0.4s}
    `}</style>
    <span className="chat-dot" />
    <span className="chat-dot" />
    <span className="chat-dot" />
  </div>
);

// ── View mode (chat interface) ────────────────────────────────────────────────
const ChatView = ({ config }) => {
  const {
    title = 'Ask me anything',
    welcomeMessage = 'Hi! Ask me anything about our services.',
    placeholder = 'Type your question...',
    knowledge = '',
  } = config;

  const accentColor = config.style?.accentColor || config.accentColor || '#111';

  const [messages, setMessages] = useState([
    { role: 'assistant', text: welcomeMessage || 'Hi! How can I help you?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Re-seed welcome message if welcomeMessage config changes
  useEffect(() => {
    setMessages([{ role: 'assistant', text: welcomeMessage || 'Hi! How can I help you?' }]);
  }, [welcomeMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/public/chat', {
        knowledge,
        question: trimmed,
      });
      const answer = res.data?.answer || res.data?.message || 'I could not find an answer.';
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Sorry, something went wrong. Please try again.', error: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      fontFamily: config.style?.fontFamily || 'inherit',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid #e5e7eb',
        background: accentColor,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        borderRadius: 'inherit',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      }}>
        <span style={{ fontSize: 15 }}>💬</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{title}</span>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minHeight: 0,
      }}>
        {!knowledge && (
          <div style={{
            margin: 'auto',
            color: '#9ca3af',
            fontSize: 12,
            textAlign: 'center',
            padding: '0 16px',
          }}>
            The assistant hasn&apos;t been configured yet.
          </div>
        )}

        {knowledge && messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div style={{
              maxWidth: '80%',
              padding: '8px 12px',
              fontSize: 13,
              lineHeight: 1.5,
              wordBreak: 'break-word',
              background: msg.role === 'user' ? accentColor : (msg.error ? '#fee2e2' : '#f3f4f6'),
              color: msg.role === 'user' ? '#fff' : (msg.error ? '#991b1b' : '#111'),
              borderRadius: msg.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <TypingIndicator />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input row */}
      <div style={{
        padding: '8px 10px',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        gap: 6,
        flexShrink: 0,
        background: '#fafafa',
        borderRadius: 'inherit',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
      }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={500}
          rows={1}
          disabled={loading || !knowledge}
          style={{
            flex: 1,
            padding: '7px 10px',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            fontSize: 13,
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            background: '#fff',
            color: '#111',
            lineHeight: 1.4,
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim() || !knowledge}
          style={{
            padding: '7px 14px',
            background: loading || !input.trim() || !knowledge ? '#d1d5db' : accentColor,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: loading || !input.trim() || !knowledge ? 'not-allowed' : 'pointer',
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

// ── Main widget component ─────────────────────────────────────────────────────
// config: { title, welcomeMessage, placeholder, knowledge, accentColor, style }
const ChatHelper = ({ config = {}, isEditing, onConfigChange }) => {
  const {
    title = 'Ask me anything',
    welcomeMessage = 'Hi! Ask me anything about our services.',
    placeholder = 'Type your question...',
    knowledge = '',
    accentColor = '#111111',
  } = config;

  if (isEditing) {
    return (
      <BaseWidget config={config} isEditing={isEditing} onConfigChange={onConfigChange}>
        <div style={E.wrap}>
          <div style={E.fieldLabel}>Title</div>
          <input
            value={title}
            onChange={(e) => onConfigChange({ ...config, title: e.target.value })}
            placeholder="Ask me anything"
            style={E.input}
            {...fh}
          />

          <div style={E.fieldLabel}>Welcome message</div>
          <input
            value={welcomeMessage}
            onChange={(e) => onConfigChange({ ...config, welcomeMessage: e.target.value })}
            placeholder="Hi! Ask me anything about our services."
            style={E.input}
            {...fh}
          />

          <div style={E.fieldLabel}>Placeholder</div>
          <input
            value={placeholder}
            onChange={(e) => onConfigChange({ ...config, placeholder: e.target.value })}
            placeholder="Type your question..."
            style={E.input}
            {...fh}
          />

          <div style={E.fieldLabel}>Accent color</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(accentColor) ? accentColor : '#111111'}
              onChange={(e) => onConfigChange({ ...config, accentColor: e.target.value })}
              style={{ width: 28, height: 26, border: '1px solid #e5e7eb', borderRadius: 4, cursor: 'pointer', padding: 2, flexShrink: 0 }}
            />
            <input
              type="text"
              value={accentColor}
              onChange={(e) => onConfigChange({ ...config, accentColor: e.target.value })}
              placeholder="#111111"
              maxLength={7}
              style={{ ...E.input, width: 80, fontFamily: 'monospace' }}
              {...fh}
            />
          </div>

          <div style={E.fieldLabel}>Knowledge base</div>
          <textarea
            value={knowledge}
            onChange={(e) => onConfigChange({ ...config, knowledge: e.target.value })}
            placeholder="Write everything about your services, hours, prices, policies…"
            rows={6}
            style={{ ...E.textarea, minHeight: 100 }}
            {...fh}
          />
          <div style={E.helperText}>
            Write everything the assistant should know. It will only answer based on this text.
          </div>
        </div>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget config={config} isEditing={isEditing} onConfigChange={onConfigChange}>
      <ChatView config={config} />
    </BaseWidget>
  );
};

export default ChatHelper;
