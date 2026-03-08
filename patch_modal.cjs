const fs = require('fs');
const path = './src/components/PropertyInspector.tsx';

let content = fs.readFileSync(path, 'utf8');

const target = `      </div>
    </div>
  );
};`;

const replacement = `      </div>

      <LogicGeneratorModal
        isOpen={isLogicModalOpen}
        onClose={() => {
          setIsLogicModalOpen(false);
          setActiveLogicEvent(null);
        }}
        onGenerate={(logic) => {
          if (activeLogicEvent) {
            onUpdateAttribute?.(activeLogicEvent, logic);
          }
        }}
      />
    </div>
  );
};`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content);
  console.log("Successfully added LogicGeneratorModal.");
} else {
  console.log("Could not find the target.");
}
