'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { askGemini, ChatMessage } from '@/lib/gemini';
import { getPageContext } from '@/lib/pageContext';
import { CITY_KPIS, DISTRICTS, PROJECTS, ALERTS } from '@/lib/districts';

const WELCOME: ChatMessage = {
  role: 'model',
  content:
    "Hello! I'm your Tampa Energy Intelligence AI. I have full context of all 8 districts, city KPIs, optimization projects, and alerts. What would you like to explore?",
};

const SUGGESTED_PROMPTS = [
  'Which district has the worst energy efficiency?',
  'What would reduce Tampa\'s peak demand the fastest?',
  'Explain the grid stress situation',
  'Which project gives the best ROI?',
  'How realistic is 100% renewable by 2054?',
  'Summarize all active alerts',
  'Compare Ybor City vs Downtown Core',
  'What are the quick wins for renewable energy?',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = useCallback(async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const pageContext = getPageContext('/chat');
      const history = messages.filter((m) => m !== WELCOME);
      const reply = await askGemini(userText, pageContext, history);
      setMessages((prev) => [...prev, { role: 'model', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([WELCOME]);
    setInput('');
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 52px)', overflow: 'hidden' }}>
      {/* Sidebar — context panel */}
      <div
        style={{
          width: '260px',
          flexShrink: 0,
          backgroundColor: '#111827',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '16px',
          gap: '16px',
        }}
      >
        {/* Header */}
        <div>
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#F9FAFB', margin: '0 0 4px' }}>
            AI Context
          </h2>
          <p style={{ fontSize: '11px', color: '#6B7280', margin: 0, lineHeight: 1.45 }}>
            The assistant has access to all city data shown below
          </p>
        </div>

        {/* City KPIs */}
        <div>
          <div style={{ fontSize: '10px', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            City KPIs
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { label: 'Total MWh', value: CITY_KPIS.totalMwh.toLocaleString(), color: '#3B82F6' },
              { label: 'Peak MW', value: CITY_KPIS.peakMw, color: '#EF4444' },
              { label: 'Waste', value: `${CITY_KPIS.wastePercent}%`, color: '#F59E0B' },
              { label: 'Renewable', value: `${CITY_KPIS.renewablePercent}%`, color: '#14B8A6' },
            ].map((kpi) => (
              <div
                key={kpi.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{kpi.label}</span>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: kpi.color }}>{kpi.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Districts */}
        <div>
          <div style={{ fontSize: '10px', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Districts ({DISTRICTS.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {DISTRICTS.map((d) => (
              <div
                key={d.id}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0' }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: d.status === 'red' ? '#EF4444' : d.status === 'amber' ? '#F59E0B' : '#14B8A6',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{d.name}</span>
                <span style={{ fontSize: '10px', color: '#6B7280', marginLeft: 'auto' }}>{d.mwh}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div>
          <div style={{ fontSize: '10px', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Alerts ({ALERTS.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {ALERTS.map((a, i) => (
              <div
                key={i}
                style={{
                  fontSize: '10.5px',
                  color: a.level === 'red' ? '#EF4444' : '#F59E0B',
                  padding: '5px 7px',
                  borderRadius: '6px',
                  backgroundColor: a.level === 'red' ? 'rgba(239,68,68,0.07)' : 'rgba(245,158,11,0.07)',
                  border: `1px solid ${a.level === 'red' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'}`,
                  lineHeight: 1.4,
                }}
              >
                {a.district}
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div>
          <div style={{ fontSize: '10px', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Projects ({PROJECTS.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {PROJECTS.map((p) => (
              <div
                key={p.id}
                style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}
              >
                <span style={{ fontSize: '10.5px', color: '#9CA3AF', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#3B82F6', flexShrink: 0, marginLeft: '4px' }}>
                  {p.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Clear chat */}
        <button
          onClick={clearChat}
          style={{
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.07)',
            backgroundColor: 'transparent',
            color: '#6B7280',
            fontSize: '11.5px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            marginTop: 'auto',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)';
            e.currentTarget.style.color = '#EF4444';
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#6B7280';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
          }}
        >
          Clear Conversation
        </button>
      </div>

      {/* Main chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Chat header */}
        <div
          style={{
            padding: '14px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            backgroundColor: '#0D1526',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              backgroundColor: 'rgba(59,130,246,0.15)',
              border: '1px solid rgba(59,130,246,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#3B82F6" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#F9FAFB' }}>Tampa Energy AI</div>
            <div style={{ fontSize: '11px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#14B8A6', display: 'inline-block' }} />
              Online · Full city data context loaded · Powered by Gemini
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span
              style={{
                padding: '3px 10px',
                borderRadius: '12px',
                backgroundColor: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.2)',
                color: '#93C5FD',
                fontSize: '10.5px',
                fontWeight: 500,
              }}
            >
              {messages.length - 1} messages
            </span>
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Suggested prompts — shown only at start */}
          {messages.length === 1 && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '10px', fontWeight: 500 }}>
                Suggested questions
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '8px',
                }}
              >
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid rgba(59,130,246,0.2)',
                      backgroundColor: 'rgba(59,130,246,0.06)',
                      color: '#93C5FD',
                      fontSize: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      lineHeight: 1.4,
                      transition: 'all 0.12s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.12)';
                      e.currentTarget.style.borderColor = 'rgba(59,130,246,0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.06)';
                      e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)';
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: '10px',
                alignItems: 'flex-end',
              }}
            >
              {msg.role === 'model' && (
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(59,130,246,0.15)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#3B82F6" />
                  </svg>
                </div>
              )}
              <div
                style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  backgroundColor: msg.role === 'user' ? '#3B82F6' : '#111827',
                  border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.07)',
                  fontSize: '13.5px',
                  lineHeight: '1.6',
                  color: msg.role === 'user' ? '#FFFFFF' : '#D1D5DB',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                  boxShadow: msg.role === 'user' ? '0 2px 12px rgba(59,130,246,0.3)' : 'none',
                }}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '13px',
                  }}
                >
                  👤
                </div>
              )}
            </div>
          ))}

          {/* Loading */}
          {isLoading && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(59,130,246,0.15)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#3B82F6" />
                </svg>
              </div>
              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: '16px 16px 16px 4px',
                  backgroundColor: '#111827',
                  border: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex',
                  gap: '5px',
                  alignItems: 'center',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="typing-dot"
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: '#9CA3AF',
                      display: 'inline-block',
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div
          style={{
            padding: '16px 24px 20px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            backgroundColor: '#0A0F1E',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-end',
              backgroundColor: '#111827',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px',
              padding: '10px 12px',
              transition: 'border-color 0.15s ease',
            }}
            onFocusCapture={(e) => {
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.35)';
            }}
            onBlurCapture={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about Tampa's energy data, districts, or optimization strategies… (Enter to send)"
              disabled={isLoading}
              rows={1}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#F9FAFB',
                fontSize: '13.5px',
                fontFamily: 'Inter, sans-serif',
                resize: 'none',
                lineHeight: '1.5',
                maxHeight: '120px',
                overflowY: 'auto',
              }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = Math.min(el.scrollHeight, 120) + 'px';
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: !input.trim() || isLoading ? 'rgba(59,130,246,0.25)' : '#3B82F6',
                border: 'none',
                cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background-color 0.15s ease',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                  stroke="white"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '6px', textAlign: 'center' }}>
            Shift+Enter for new line · Enter to send · Powered by Gemini 2.0 Flash
          </div>
        </div>
      </div>
    </div>
  );
}
