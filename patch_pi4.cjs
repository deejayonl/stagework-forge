const fs = require('fs');
const path = 'src/components/PropertyInspector.tsx';
let content = fs.readFileSync(path, 'utf8');

const modalStr = `
      {isTimelineBuilderOpen && (
        <KeyframeTimelineBuilder
          initialKeyframes={selectedElement.dataset?.keyframes}
          onSave={(css) => {
            if (onUpdateAttribute) {
              onUpdateAttribute('data-keyframes', css);
              
              const match = css.match(/@keyframes\\s+([a-zA-Z0-9_-]+)/);
              if (match) {
                handleStyleChange('animationName', match[1]);
              }
            }
          }}
          onClose={() => setIsTimelineBuilderOpen(false)}
        />
      )}`;

content = content.replace(/(<LogicGeneratorModal[\s\S]*?\/>)/, "$1" + modalStr);

fs.writeFileSync(path, content);
console.log('Patched PropertyInspector.tsx');
