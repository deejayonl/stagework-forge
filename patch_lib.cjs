const fs = require('fs');
const path = 'src/components/ComponentLibrary.tsx';
let content = fs.readFileSync(path, 'utf8');

const newCategory = `
  {
    category: 'Animations',
    icon: <LayoutGrid className="w-4 h-4" />,
    items: [
      {
        name: 'Lottie Animation',
        html: \`<div class="w-64 h-64 mx-auto"><script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script><lottie-player src="https://assets2.lottiefiles.com/packages/lf20_UJNc2t.json" background="transparent" speed="1" style="width: 100%; height: 100%;" loop autoplay></lottie-player></div>\`
      },
      {
        name: 'Rive Animation',
        html: \`<div class="w-64 h-64 mx-auto"><canvas id="rive-canvas" width="500" height="500" style="width: 100%; height: 100%;"></canvas><script src="https://unpkg.com/@rive-app/canvas@2.7.0"></script><script>new rive.Rive({ src: 'https://cdn.rive.app/animations/vehicles.riv', canvas: document.getElementById('rive-canvas'), autoplay: true });</script></div>\`
      }
    ]
  },`;

if (!content.includes("category: 'Animations'")) {
  content = content.replace("const COMPONENTS = [", "const COMPONENTS = [" + newCategory);
  fs.writeFileSync(path, content);
  console.log('Patched ComponentLibrary.tsx');
}
