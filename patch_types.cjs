const fs = require('fs');
const path = './src/types.ts';
let code = fs.readFileSync(path, 'utf8');

const collectionTypes = `
export interface CollectionField {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'image' | 'date';
}

export interface Collection {
  id: string;
  name: string;
  fields: CollectionField[];
  data: Record<string, any>[];
}
`;

code = code.replace("export interface GeneratedFile {", collectionTypes + "\nexport interface GeneratedFile {");

code = code.replace("seo?: Record<string, string>;", "seo?: Record<string, string>;\n  collections?: Record<string, Collection>;");

fs.writeFileSync(path, code);
