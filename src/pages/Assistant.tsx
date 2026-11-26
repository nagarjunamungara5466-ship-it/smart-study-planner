
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import {
  Lightbulb, Send, Sparkles, Info, Loader2
} from 'lucide-react';

interface ChatMsg {
  role: 'user' | 'assistant';
  text: string;
}

const AI_URL =
  'https://smart-study-ai.nagarjunamungara5466.workers.dev';

const STORAGE_KEY = 'smart-study-ai-chat-history';

const initialMessages: ChatMsg[] = [
  {
    role: 'assistant',
    text: "Hi! I'm your AI Study Assistant, powered by Cloudflare Workers AI. Ask me about your subjects, exams, study plans, programming or career preparation!"
  }
];

function loadMessages(): ChatMsg[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (
        Array.isArray(parsed) &&
        parsed.every(
          (m) =>
            (m.role === 'user' || m.role === 'assistant') &&
            typeof m.text === 'string'
        )
      ) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Could not load chat history:', error);
  }

  return initialMessages;
}

export function Assistant() {
  const { state } = useStore();

  const [messages, setMessages] = useState<ChatMsg[]>(loadMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Automatically save chat history whenever messages change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Could not save chat history:', error);
    }
  }, [messages]);

  const send = async (question?: string) => {
    const userMsg = (question ?? input).trim();

    if (!userMsg || loading) return;

    setMessages((m) => [
      ...m,
      { role: 'user', text: userMsg }
    ]);

    setInput('');
    setLoading(true);

    try {
      const studyContext = {
        profile: state.profile,
        academicYears: state.academicYears,
        exams: state.exams,
        tasks: state.tasks,
        revisions: state.revisions,
        programmingRoadmap: state.progRoadmap,
        aiRoadmap: state.aiRoadmap
      };

      const response = await fetch(AI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMsg,
          studyContext
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.details || data?.error || `Request failed: ${response.status}`
        );
      }

      if (!data?.reply) {
        throw new Error(data?.error || 'No AI response received.');
      }

      setMessages((m) => [
        ...m,
        { role: 'assistant', text: data.reply }
      ]);

    } catch (err) {
      console.error('Cloudflare AI assistant error:', err);

      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error';

      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: `Sorry, the AI connection failed. Please try again. Error: ${errorMessage}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'What should I study today?',
    'Which exam is coming next?',
    'Suggest a revision plan',
    'What are my weak subjects?',
    'What should I learn next for my career?'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Lightbulb size={24} style={{ color: 'var(--primary)' }} />
          AI Study Assistant
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Powered by Cloudflare Workers AI
        </p>
      </div>

      <div
        className="card p-3 flex items-start gap-2 text-sm"
        style={{
          backgroundColor: '#eff6ff',
          borderColor: '#bfdbfe',
          color: '#1e40af'
        }}
      >
        <Info size={16} className="mt-0.5 shrink-0" />
        <span>
          Your AI assistant uses your study information to provide
          personalized academic, programming and career guidance.
        </span>
      </div>

      <div className="card p-4 min-h-[400px] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[500px]">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 ${
                m.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.role === 'user' ? 'bg-[var(--surface-2)]' : ''
                }`}
                style={
                  m.role === 'assistant'
                    ? { backgroundColor: 'var(--primary)', color: 'white' }
                    : {}
                }
              >
                {m.role === 'assistant' ? <Sparkles size={16} /> : 'You'}
              </div>

              <div
                className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--surface-2)]'
                }`}
                style={m.role === 'user' ? {} : { color: 'var(--text)' }}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div
              className="flex items-center gap-2 text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              <Loader2 size={18} className="animate-spin" />
              AI is thinking...
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {quickPrompts.map((p) => (
            <button
              key={p}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full bg-[var(--surface-2)] hover:bg-[var(--border)] transition-colors disabled:opacity-50"
              onClick={() => send(p)}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Ask your AI study assistant..."
            value={input}
            disabled={loading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send();
            }}
          />

          <button
            className="btn btn-primary shrink-0"
            onClick={() => send()}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
