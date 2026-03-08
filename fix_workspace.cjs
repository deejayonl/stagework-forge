const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/Workspace.tsx');
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(/import React, \{ useState, useEffect \} from 'react';/, "import React, { useState, useEffect, useRef } from 'react';");
fs.writeFileSync(filePath, code);
console.log('patched');
