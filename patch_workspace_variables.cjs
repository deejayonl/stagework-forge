const fs = require('fs');
const path = './src/components/Workspace.tsx';
let code = fs.readFileSync(path, 'utf8');

// We need to inject collections data into variables when sending to iframe
const oldSync = `  // Sync variables to iframe
  useEffect(() => {
    const iframe = document.querySelector('iframe[title="Preview"]') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'FORGE_UPDATE_VARIABLES',
        variables
      }, '*');
    }
  }, [variables]);`;

const newSync = `  // Sync variables & collections to iframe
  useEffect(() => {
    const iframe = document.querySelector('iframe[title="Preview"]') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      // Merge collections data into variables so data-bind-list can read it
      const mergedVariables = { ...variables };
      if (collections) {
        Object.values(collections).forEach((c: any) => {
          mergedVariables[c.id] = JSON.stringify(c.data || []);
        });
      }
      
      iframe.contentWindow.postMessage({
        type: 'FORGE_UPDATE_VARIABLES',
        variables: mergedVariables
      }, '*');
    }
  }, [variables, collections]);`;

code = code.replace(oldSync, newSync);

// Also need to update the onLoad handler
const oldOnLoad = `                  iframe.contentWindow.postMessage({
                    type: 'FORGE_UPDATE_VARIABLES',
                    variables
                  }, '*');`;

const newOnLoad = `                  const mergedVariables = { ...variables };
                  if (collections) {
                    Object.values(collections).forEach((c: any) => {
                      mergedVariables[c.id] = JSON.stringify(c.data || []);
                    });
                  }
                  iframe.contentWindow.postMessage({
                    type: 'FORGE_UPDATE_VARIABLES',
                    variables: mergedVariables
                  }, '*');`;

code = code.replace(oldOnLoad, newOnLoad);

fs.writeFileSync(path, code);
