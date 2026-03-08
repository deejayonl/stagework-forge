import React, { useRef, useMemo } from 'react';

// Use a global declaration for Prism since it's loaded via CDN
declare global {
  interface Window {
    Prism: any;
  }
}

interface CodeEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, language, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);

  // Sync scroll position between textarea, pre, and lines
  const handleScroll = () => {
    if (textareaRef.current) {
      if (preRef.current) {
        preRef.current.scrollTop = textareaRef.current.scrollTop;
        preRef.current.scrollLeft = textareaRef.current.scrollLeft;
      }
      if (linesRef.current) {
        linesRef.current.scrollTop = textareaRef.current.scrollTop;
      }
    }
  };
  
  // Map our internal types to Prism languages
  const getPrismLang = () => {
    const map: Record<string, string> = {
      'js': 'javascript',
      'html': 'markup',
      'css': 'css',
      'json': 'json'
    };
    return map[language] || 'javascript';
  };

  const prismLang = getPrismLang();

  // Highlight logic
  const getHighlightedCode = () => {
    if (typeof window !== 'undefined' && window.Prism) {
      // If language grammar is missing, fallback to plain text safety
      const grammar = window.Prism.languages[prismLang];
      if (grammar) {
        return window.Prism.highlight(value, grammar, prismLang);
      }
    }
    // Fallback simple escaping
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };

  const lineCount = useMemo(() => value.split('\n').length, [value]);
  const lineNumbers = useMemo(() => Array.from({ length: lineCount }, (_, i) => i + 1), [lineCount]);

  return (
    <div className="relative w-full h-full bg-transparent overflow-hidden group flex">
      {/* Line Numbers Gutter */}
      <div 
        ref={linesRef}
        className="flex-shrink-0 w-12 bg-hall-100 dark:bg-hall-900 border-r border-hall-200 dark:border-hall-800 text-right pr-3 py-4 md:py-6 text-xs text-hall-400 font-mono select-none overflow-hidden"
        style={{ lineHeight: '1.5rem' }}
      >
        {lineNumbers.map(n => (
          <div key={n} className="opacity-50 hover:opacity-100 transition-opacity">{n}</div>
        ))}
      </div>

      <div className="relative w-full h-full">
        {/* Editor Textarea (Transparent, for input) */}
        <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            className="absolute inset-0 w-full h-full p-4 md:p-6 font-mono text-sm leading-6 bg-transparent text-transparent caret-accent resize-none border-none outline-none z-10 whitespace-pre overflow-auto"
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
        />
        
        {/* Syntax Highlighting Layer (Underneath) */}
        <pre
            ref={preRef}
            className={`absolute inset-0 w-full h-full p-4 md:p-6 font-mono text-sm leading-6 m-0 bg-transparent text-ink pointer-events-none z-0 overflow-hidden whitespace-pre language-${prismLang}`}
        >
            <code dangerouslySetInnerHTML={{ __html: getHighlightedCode() }} />
            {/* Add extra newline to match textarea behavior for trailing returns */}
            <br />
        </pre>
      </div>
    </div>
  );
};

export default CodeEditor;
