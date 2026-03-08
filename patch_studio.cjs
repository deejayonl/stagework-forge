const fs = require('fs');
const content = fs.readFileSync('src/routes/studio/StudioView.tsx', 'utf8');

const newCode = `      // If we arrived with a generated plan, build a fresh workspace for it
      if (plan && plan.blueprints) {
          const w = window.innerWidth;
          const isMobile = w < 768;
          const nodeWidth = isMobile ? Math.min(w - 40, 380) : 400;
          const nodeHeight = isMobile ? 320 : 400;
          const startX = (w / 2) - (nodeWidth / 2);
          const startY = 100;

          // Central Master Node (WWDC Style Mind-Map Root)
          const centralNodeId = 'master-idea';
          const centralNode: CanvasNode = {
            id: centralNodeId,
            type: 'text',
            x: startX,
            y: startY,
            width: nodeWidth,
            height: 200,
            title: 'Master Blueprint',
            content: \`# \${plan.projectTitle}\\n\\n**Description:** \${plan.projectDescription}\`,
            zIndex: 0
          };

          const bpNodes: CanvasNode[] = plan.blueprints.map((bp: any, index: number) => {
              const offsetX = (index - (plan.blueprints.length - 1) / 2) * (nodeWidth + 100);
              return {
                  id: \`blueprint_\${bp.targetId.replace(/\\s+/g, "-").toLowerCase()}_\${index}\`,
                  type: 'text',
                  x: startX + offsetX,
                  y: startY + 350,
                  width: nodeWidth,
                  height: nodeHeight,
                  title: \`\${bp.targetId} Blueprint\`,
                  content: \`## Wireframe\\n\${bp.wireframeDesc}\\n\\n## Features\\n\${bp.features.map((f: string) => \`- \${f}\`).join('\\n')}\`,
                  zIndex: index + 1
              };
          });

          const edges: CanvasEdge[] = bpNodes.map((bpNode) => ({
             id: \`edge_\${centralNodeId}_\${bpNode.id}\`,
             fromNode: centralNodeId,
             fromSide: 'bottom',
             toNode: bpNode.id,
             toSide: 'top'
          }));

          return [
              {
                  id: 'generated-plan',
                  name: plan.projectTitle || 'Generated Project',
                  nodes: [centralNode, ...bpNodes],
                  edges,
                  messages: [],
                  lastModified: Date.now()
              }
          ];
      }`;

const oldCode = `      // If we arrived with a generated plan, build a fresh workspace for it
      if (plan && plan.blueprints) {
          const w = window.innerWidth;
          const isMobile = w < 768;
          const nodeWidth = isMobile ? Math.min(w - 40, 380) : 400;
          const nodeHeight = isMobile ? 320 : 400;
          const startX = (w / 2) - (nodeWidth / 2);
          const startY = 100;

          const nodes: CanvasNode[] = plan.blueprints.map((bp: any, index: number) => {
              return {
                  id: \`blueprint_\${bp.targetId.replace(/\\s+/g, "-").toLowerCase()}_\${index}\`,
                  type: 'text',
                  x: startX + (index * (nodeWidth + 40)), // Layout horizontally
                  y: startY,
                  width: nodeWidth,
                  height: nodeHeight,
                  title: \`\${bp.targetId} Blueprint\`,
                  content: \`# \${plan.projectTitle}\\n\\n**Description:** \${plan.projectDescription}\\n\\n## Wireframe\\n\${bp.wireframeDesc}\\n\\n## Features\\n\${bp.features.map((f: string) => \`- \${f}\`).join('\\n')}\`,
                  zIndex: index + 1
              };
          });

          return [
              {
                  id: 'generated-plan',
                  name: plan.projectTitle || 'Generated Project',
                  nodes,
                  edges: [],
                  messages: [],
                  lastModified: Date.now()
              }
          ];
      }`;

const newFile = content.replace(oldCode, newCode);
fs.writeFileSync('src/routes/studio/StudioView.tsx', newFile);
