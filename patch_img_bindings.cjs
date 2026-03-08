const fs = require('fs');
const path = './src/components/PropertyInspector.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldImgBindings = `<optgroup label="List Item Bindings">
                    <option value="item">Bind: item (string URL)</option>
                    <option value="item.image">Bind: item.image</option>
                    <option value="item.url">Bind: item.url</option>
                    <option value="item.src">Bind: item.src</option>
                  </optgroup>`;

const newImgBindings = `{Object.values(collections || {}).length > 0 ? (
                    Object.values(collections || {}).map((c: any) => (
                      <optgroup key={c.id} label={\`Collection: \${c.name}\`}>
                        {c.fields.filter((f: any) => f.type === 'image' || f.type === 'text').map((f: any) => (
                          <option key={\`\${c.id}.\${f.name}\`} value={\`item.\${f.name}\`}>
                            Bind: item.{f.name}
                          </option>
                        ))}
                      </optgroup>
                    ))
                  ) : (
                    <optgroup label="List Item Bindings">
                      <option value="item">Bind: item (string URL)</option>
                      <option value="item.image">Bind: item.image</option>
                      <option value="item.url">Bind: item.url</option>
                      <option value="item.src">Bind: item.src</option>
                    </optgroup>
                  )}`;

code = code.replace(oldImgBindings, newImgBindings);
fs.writeFileSync(path, code);
