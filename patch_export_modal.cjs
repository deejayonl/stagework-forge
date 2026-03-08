const fs = require('fs');
let code = fs.readFileSync('src/components/ExportModal.tsx', 'utf8');

code = code.replace(
  'onExport: (framework: string) => void;',
  'onExport: (framework: string) => void;\n  onDeploy?: (framework: string) => void;'
);

code = code.replace(
  'export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport, projectName }) => {',
  'export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport, onDeploy, projectName }) => {'
);

code = code.replace(
  '<Download className="w-5 h-5" />\n            Export Project',
  '<Download className="w-5 h-5" />\n            Export & Deploy Project'
);

const buttons = `<button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-hall-600 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink transition-colors"
          >
            Cancel
          </button>
          {onDeploy && (
            <button 
              onClick={() => onDeploy(framework)}
              className="px-6 py-2 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <svg viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor"/></svg>
              Deploy to Vercel
            </button>
          )}
          <button 
            onClick={() => onExport(framework)}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download ZIP
          </button>`;

code = code.replace(
  /<button[\s\S]*?Cancel[\s\S]*?<\/button>\s*<button[\s\S]*?Download ZIP[\s\S]*?<\/button>/m,
  buttons
);

fs.writeFileSync('src/components/ExportModal.tsx', code);
