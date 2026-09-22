import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, RotateCcw, Copy, Check, MessageSquare, ShieldAlert, Sparkles, ChevronDown } from 'lucide-react';
import Markdown from 'react-markdown';
import { SecurityReport } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface CyberAssistantChatProps {
  isOpen: boolean;
  onClose: () => void;
  reportContext: SecurityReport | null;
  theme?: 'light' | 'dark';
}

const STARTER_PROMPTS = [
  'Is it safe for me to reply to this message?',
  'Explain what SPF and DKIM failures mean',
  'What should I do if I already clicked the link?',
  'How do I independently verify this sender?',
];

export const CyberAssistantChat: React.FC<CyberAssistantChatProps> = ({
  isOpen,
  onClose,
  reportContext,
  theme = 'light',
}) => {
  const isLight = theme === 'light';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `👋 **Hello! I'm your CyberSafe AI Advisor.**\n\nI can help you understand security red flags, verify suspicious communications, or explain what steps to take if you suspect fraud.\n\nAsk me anything or choose one of the quick topics below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          reportContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: data.reply || 'I reviewed your question. Stay cautious and never provide payment or personal details to unverified senders.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: "⚠️ **Connection Notice**: I'm unable to reach the AI service right now. For your immediate safety, remember: never wire money, deposit unexpected checks, or share credentials from an unsolicited contact.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        content: `👋 **Chat history cleared.** What would you like to investigate?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      id="cyber-assistant-modal"
      className="fixed bottom-4 right-4 z-50 w-[95vw] sm:w-[440px] h-[580px] max-h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden transition-all duration-200 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100"
      style={{
        boxShadow: isLight
          ? '0 20px 40px -15px rgba(30, 41, 59, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)'
          : '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(63, 63, 70, 0.5)',
      }}
    >
      {/* Header */}
      <div className="px-4 py-3.5 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs border border-white/20 shadow-xs">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-sm leading-tight">
              <span>CyberSafe AI Advisor</span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-400/20 text-emerald-100 border border-emerald-300/30">
                Active
              </span>
            </div>
            <p className="text-[11px] text-blue-100/90 leading-tight">Multi-turn fraud defense guidance</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            id="chat-clear-btn"
            onClick={handleClearHistory}
            title="Reset conversation"
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            id="chat-close-btn"
            onClick={onClose}
            title="Minimize chat"
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active context banner if report is loaded */}
      {reportContext && (
        <div className="px-3.5 py-2 text-[11px] flex items-center justify-between bg-indigo-50/80 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/40 text-indigo-900 dark:text-indigo-200">
          <span className="flex items-center gap-1.5 font-medium truncate">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="truncate">Scan context attached: {reportContext.category}</span>
          </span>
          <span
            className={`px-1.5 py-0.5 rounded font-bold text-[10px] shrink-0 ${
              reportContext.risk_level === 'CRITICAL'
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
                : reportContext.risk_level === 'HIGH'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
            }`}
          >
            {reportContext.risk_level} ({reportContext.scam_threat_index}%)
          </span>
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/60 dark:bg-zinc-950/50">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-xs shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 border border-slate-200/80 dark:border-zinc-700/60 rounded-bl-xs shadow-xs'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="prose prose-xs max-w-none dark:prose-invert space-y-1.5 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_strong]:font-semibold [&_p]:mb-1.5 [&_p:last-child]:mb-0">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-slate-400 dark:text-zinc-500">
                <span>{msg.timestamp}</span>
                {!isUser && (
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="hover:text-slate-600 dark:hover:text-zinc-300 transition-colors p-0.5"
                    title="Copy answer"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-800/90 border border-indigo-100 dark:border-indigo-900/50 p-2.5 rounded-2xl w-fit shadow-xs animate-pulse">
            <Bot className="w-4 h-4 animate-spin text-indigo-500" />
            <span>CyberSafe AI is analyzing and composing advice...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starters */}
      {messages.length <= 2 && (
        <div className="px-3 py-2 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800/80">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" /> Suggested topics:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {STARTER_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isSending}
                className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 transition-colors border border-slate-200/60 dark:border-zinc-700/60"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2.5 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800/80 flex items-center gap-2"
      >
        <input
          ref={inputRef}
          id="chat-user-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a security question..."
          disabled={isSending}
          className="flex-1 text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 disabled:opacity-50 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500"
        />
        <button
          id="chat-send-btn"
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-zinc-800 text-white font-medium text-xs flex items-center gap-1 transition-all shadow-xs disabled:cursor-not-allowed"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
