'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { askGemini, ChatMessage } from '@/lib/gemini';
import { getPageContext } from '@/lib/pageContext';

const WELCOME_MESSAGE: ChatMessage = {
  role: 'model',
  content:
    "Hello! I'm your Tampa Energy Intelligence AI. Ask me anything about district energy data, optimization strategies, or city planning insights.",
};

export default function AIWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewInsight, setHasNewInsight] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const insightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show notification badge after 4s on mount
  useEffect(() => {
    insightTimerRef.current = setTimeout(() => {
      setHasNewInsight(true);
    }, 4000);
    return () => {
      if (insightTimerRef.current) clearTimeout(insightTimerRef.current);
    };
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasNewInsight(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const pageContext = getPageContext(pathname);
      // Pass all prior messages (except welcome if it's the first) as history
      const history = messages.filter((m) => m !== WELCOME_MESSAGE);
      const reply = await askGemini(text, pageContext, history);
      setMessages((prev) => [...prev, { role: 'model', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: 'Something went wrong. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, pathname]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const pageName = pathname === '/' ? 'Home' : pathname.replace('/', '').replace(/^\w/, (c) => c.toUpperCase());

  return (
    <>
      {/* Collapsed bubble */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="pulse-ring"
          aria-label="Open AI assistant"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: '#3B82F6',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(59,130,246,0.45)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.08)';
            e.currentTarget.style.boxShadow = '0 6px 28px rgba(59,130,246,0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,130,246,0.45)';
          }}
        >
          {/* Lightning bolt icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
              fill="white"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Red notification dot */}
          {hasNewInsight && (
            <span
              style={{
                position: 'absolute',
                top: '3px',
                right: '3px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#EF4444',
                border: '1.5px solid #0A0F1E',
              }}
            />
          )}
        </button>
      )}

      {/* Expanded panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            width: '380px',
            height: '520px',
            backgroundColor: '#111827',
            borderRadius: '16px',
            border: '1px solid rgba(59,130,246,0.2)',
            boxShadow: '0 16px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.05)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#0D1526',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Lightning bolt */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(59,130,246,0.15)',
                  border: '1px solid rgba(59,130,246,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                    fill="#3B82F6"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#F9FAFB',
                    lineHeight: 1.2,
                  }}
                >
                  Tampa Energy AI
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: '#9CA3AF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '1px',
                  }}
                >
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: '#14B8A6',
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  Online · {pageName} context
                </div>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.07)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9CA3AF',
                transition: 'background-color 0.15s ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.15)';
                e.currentTarget.style.color = '#EF4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = '#9CA3AF';
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M1 1L11 11M11 1L1 11"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Messages area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '82%',
                    padding: '9px 12px',
                    borderRadius: msg.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                    backgroundColor:
                      msg.role === 'user'
                        ? '#3B82F6'
                        : 'rgba(255,255,255,0.06)',
                    border:
                      msg.role === 'user'
                        ? 'none'
                        : '1px solid rgba(255,255,255,0.07)',
                    fontSize: '12.5px',
                    lineHeight: '1.5',
                    color: msg.role === 'user' ? '#FFFFFF' : '#D1D5DB',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px 12px 12px 3px',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center',
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="typing-dot"
                      style={{
                        width: '6px',
                        height: '6px',
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

          {/* Quick prompts */}
          {messages.length === 1 && (
            <div
              style={{
                padding: '0 14px 10px',
                display: 'flex',
                gap: '6px',
                flexWrap: 'wrap',
                flexShrink: 0,
              }}
            >
              {[
                'Which district wastes the most?',
                'Top project to fund?',
                'Grid stress explained',
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setInput(prompt);
                    setTimeout(() => inputRef.current?.focus(), 50);
                  }}
                  style={{
                    fontSize: '11px',
                    padding: '4px 9px',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(59,130,246,0.1)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    color: '#93C5FD',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.1)';
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <div
            style={{
              padding: '10px 14px 14px',
              borderTop: '1px solid rgba(255,255,255,0.07)',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about Tampa energy data..."
              disabled={isLoading}
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '12.5px',
                color: '#F9FAFB',
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor:
                  !input.trim() || isLoading
                    ? 'rgba(59,130,246,0.3)'
                    : '#3B82F6',
                border: 'none',
                cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background-color 0.15s ease',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
