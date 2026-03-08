import { useRef, useEffect, useState, useCallback } from 'react';
import { Send, RotateCcw, Plus, ChevronRight, X, Mic, MicOff, FileText, Image, Film } from 'lucide-react';

export interface SessionInput {
  text: string;
  timestamp: number;
}

export interface Attachment {
  name: string;
  type: string;
  size: number;
  file: File;
}

interface TaskInputSectionProps {
  sessionInputs: SessionInput[];
  task: string;
  setTask: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: (e: React.FormEvent) => void;
  onDeleteInput: (index: number) => void;
  isRunning: boolean;
  isComplete: boolean;
  onReset: () => void;
  canCreateSession: boolean;
  hasState: boolean;
}

const SpeechRecognition = (globalThis as Record<string, unknown>).SpeechRecognition ?? (globalThis as Record<string, unknown>).webkitSpeechRecognition;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Film;
  return FileText;
}

export function TaskInputSection({
  sessionInputs,
  task,
  setTask,
  onSubmit,
  onDeleteInput,
  isRunning,
  isComplete,
  onReset,
  canCreateSession,
  hasState
}: TaskInputSectionProps) {
  const historyEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(null);

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported] = useState(() => !!SpeechRecognition);

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessionInputs.length]);

  const hasHistory = sessionInputs.length > 0;

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // --- Attachment handling ---
  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFilesChanged = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newAttachments: Attachment[] = Array.from(files).map((file) => ({
      name: file.name,
      type: file.type,
      size: file.size,
      file
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // --- Voice handling ---
  const toggleVoice = useCallback(() => {
    if (!SpeechRecognition) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = createRecognition();
    recognitionRef.current = recognition;

    recognition.onresult = (event: { results: SpeechRecognitionResultList }) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('');
      setTask((prev: string) => (prev ? prev + ' ' : '') + transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.start();
    setIsListening(true);
  }, [isListening, setTask]);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => { recognitionRef.current?.stop(); };
  }, []);

  return (
    <form onSubmit={onSubmit} className='w-full mb-6'>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type='file'
        multiple
        className='hidden'
        onChange={handleFilesChanged}
        accept='image/*,video/*,.pdf,.txt,.md,.ts,.tsx,.js,.jsx,.json,.yaml,.yml,.html,.css,.py,.go,.rs,.java,.c,.cpp,.h,.hpp,.swift,.kt,.rb,.sh,.sql,.csv,.xml,.svg,.toml,.env,.log'
      />

      {/* Session history */}
      {hasHistory && (
        <div className='max-h-[160px] overflow-y-auto rounded-t-2xl bg-ink/[0.02] border border-b-0 border-ink/[0.04] px-4 py-2 space-y-1'>
          {sessionInputs.map((entry, i) => (
            <div key={i} className='flex items-start gap-2 py-1 animate-fade-in group/entry'>
              <ChevronRight size={12} className='text-accent/40 mt-0.5 shrink-0' />
              <span className='text-[13px] text-ink/45 leading-relaxed flex-1'>{entry.text}</span>
              <span className='text-[11px] font-mono text-ink/15 shrink-0'>{formatTime(entry.timestamp)}</span>
              <button
                type='button'
                onClick={() => onDeleteInput(i)}
                className='opacity-0 group-hover/entry:opacity-100 p-0.5 rounded-xl text-ink/15 hover:text-ink/50 hover:bg-ink/[0.06] transition-all shrink-0'
                title='Remove'
              >
                <X size={11} />
              </button>
            </div>
          ))}
          <div ref={historyEndRef} />
        </div>
      )}

      {/* Input area */}
      <div
        className={`relative bg-ink/[0.02] border overflow-hidden transition-all duration-500 ${
          hasHistory ? 'rounded-b-2xl border-ink/[0.04]' : 'rounded-2xl'
        } ${
          isRunning
            ? 'border-ink/[0.04]'
            : !task && !hasState
              ? 'border-ink/[0.04] animate-pulse-glow'
              : 'border-ink/[0.04] focus-within:border-ink/[0.14] focus-within:bg-ink/[0.04] focus-within:shadow-[0_0_80px_rgba(129,140,248,0.04)]'
        }`}
      >
        <textarea
          ref={(el) => {
            if (el) {
              el.style.height = 'auto';
              el.style.height = `${Math.min(el.scrollHeight, 300)}px`;
            }
          }}
          value={task}
          onChange={(e) => {
            setTask(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`;
          }}
          placeholder={isRunning ? 'Start a parallel session...' : 'What task would you like to complete?'}
          className='w-full bg-transparent px-5 pt-4 pb-16 text-[15px] text-ink/85 placeholder:text-ink/15 resize-none focus:outline-none min-h-[72px] max-h-[300px] overflow-y-auto'
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSubmit(e);
            }
          }}
        />

        {/* Attachment chips */}
        {attachments.length > 0 && (
          <div className='px-5 pb-2 -mt-4 flex flex-wrap gap-1.5'>
            {attachments.map((att, i) => {
              const Icon = getFileIcon(att.type);
              return (
                <div
                  key={i}
                  className='flex items-center gap-1.5 px-2.5 py-1 rounded-2xl bg-ink/[0.05] border border-ink/[0.06] text-[12px] text-ink/50 animate-fade-in group/att'
                >
                  <Icon size={12} className='shrink-0 text-ink/30' />
                  <span className='max-w-[120px] truncate'>{att.name}</span>
                  <span className='text-ink/20'>{formatFileSize(att.size)}</span>
                  <button
                    type='button'
                    onClick={() => removeAttachment(i)}
                    className='ml-0.5 p-0.5 rounded-xl text-ink/20 hover:text-ink/50 hover:bg-ink/[0.06] transition-all'
                  >
                    <X size={10} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom bar */}
        <div className='absolute bottom-3 left-3 right-3 flex items-center justify-between'>
          {/* Left: + button, voice button, shortcut hint */}
          <div className='flex items-center gap-1'>
            <button
              type='button'
              onClick={handleFileSelect}
              className='p-1.5 rounded-2xl text-ink/20 hover:text-ink/50 hover:bg-ink/[0.06] transition-all'
              title='Attach files'
            >
              <Plus size={16} strokeWidth={2} />
            </button>

            {voiceSupported && (
              <button
                type='button'
                onClick={toggleVoice}
                className={`p-1.5 rounded-2xl transition-all ${
                  isListening
                    ? 'text-red-400 bg-red-500/10 hover:bg-red-500/15'
                    : 'text-ink/20 hover:text-ink/50 hover:bg-ink/[0.06]'
                }`}
                title={isListening ? 'Stop listening' : 'Voice input'}
              >
                {isListening ? <MicOff size={16} strokeWidth={2} /> : <Mic size={16} strokeWidth={2} />}
              </button>
            )}

            {isListening && (
              <span className='text-[11px] text-red-400/70 font-medium ml-1 animate-pulse'>Listening...</span>
            )}

          </div>

          {/* Right: action buttons */}
          <div className='flex items-center gap-2'>
            {isComplete && (
              <button
                type='button'
                onClick={onReset}
                className='px-3 py-1.5 rounded-2xl text-[13px] font-medium text-ink/25 hover:text-ink/50 hover:bg-ink/[0.04] transition-all'
              >
                <RotateCcw size={13} className='inline mr-1' /> Start Over
              </button>
            )}
            {isRunning && canCreateSession && (
              <button
                type='submit'
                disabled={!task.trim()}
                className='px-4 py-1.5 rounded-xl text-[14px] font-semibold bg-ink/[0.07] text-ink/70 border border-ink/[0.08] hover:bg-ink/[0.11] hover:text-ink/90 disabled:opacity-15 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1.5'
              >
                <Plus size={14} />
                New Session
              </button>
            )}
            {!isRunning && (
              <button
                type='submit'
                disabled={!task.trim() && attachments.length === 0}
                className='px-4 py-1.5 rounded-xl text-[14px] font-semibold bg-ink/[0.07] text-ink/70 border border-ink/[0.08] hover:bg-ink/[0.11] hover:text-ink/90 disabled:opacity-15 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1.5'
              >
                <Send size={14} />
                Send
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

// --- Speech Recognition Factory ---

function createRecognition() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Recognition = SpeechRecognition as any;
  const r = new Recognition();
  r.continuous = false;
  r.interimResults = false;
  r.lang = 'en-US';
  return r as {
    start(): void;
    stop(): void;
    onresult: ((event: { results: SpeechRecognitionResultList }) => void) | null;
    onend: (() => void) | null;
    onerror: (() => void) | null;
  };
}
