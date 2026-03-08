const fs = require('fs');
let content = fs.readFileSync('./src/components/PropertyInspector.tsx', 'utf-8');

const propsInterface = `
interface PropertyInspectorProps {
  selectedElement: any;
  onUpdateStyle: (property: string, value: string) => void;
  onUpdateText: (text: string) => void;
  onClose: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({ 
  selectedElement, 
  onUpdateStyle, 
  onUpdateText,
  onClose,
  onDelete,
  onDuplicate
}) => {
`;

content = content.replace(/interface PropertyInspectorProps \{[\s\S]*?\}\) => \{/, propsInterface.trim());

const elementInfo = `
        {/* Element Info */}
        <div className="bg-hall-100 dark:bg-hall-900 p-3 rounded-xl flex justify-between items-start">
          <div>
            <div className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold mb-1">
              &lt;{tagName}&gt;
            </div>
            <div className="text-[10px] text-hall-500 dark:text-hall-400 break-all">
              {path.join(' > ')}
            </div>
          </div>
          <div className="flex gap-1 flex-col">
            {onDuplicate && (
              <button onClick={onDuplicate} title="Duplicate (Cmd+D)" className="p-1 text-hall-500 hover:text-amber-500 hover:bg-hall-200 dark:hover:bg-hall-800 rounded transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} title="Delete (Backspace/Del)" className="p-1 text-hall-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </button>
            )}
          </div>
        </div>
`;

content = content.replace(/{\/\* Element Info \*\/}[\s\S]*?(?={\/\* Content \*\/})/, elementInfo + '\n        ');

fs.writeFileSync('./src/components/PropertyInspector.tsx', content);
console.log('Patched PropertyInspector buttons');
