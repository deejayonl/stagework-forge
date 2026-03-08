const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add PreviewView import
content = content.replace(
  "const AdminView = React.lazy(() => lazyRetry(() => import('./routes/admin/AdminView')) as Promise<any>);",
  "const AdminView = React.lazy(() => lazyRetry(() => import('./routes/admin/AdminView')) as Promise<any>);\nconst PreviewView = React.lazy(() => lazyRetry(() => import('./routes/preview/PreviewView')) as Promise<any>);"
);

// Add useLocation
content = content.replace(
  "import { Routes, Route, Navigate, NavLink } from 'react-router-dom'",
  "import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom'"
);

// Add useLocation hook inside App
content = content.replace(
  "export default function App() {\n  const [theme, setTheme]",
  "export default function App() {\n  const location = useLocation();\n  const isPreview = location.pathname.startsWith('/preview');\n  const [theme, setTheme]"
);

// Conditionally render sidebar
content = content.replace(
  "{/* Sidebar wrapper to prevent layout shift */}",
  "{!isPreview && (\n      {/* Sidebar wrapper to prevent layout shift */}"
);

// End sidebar conditional
content = content.replace(
  "</div>\n\n      \n      {/* Mobile Bottom Navigation */}",
  "</div>\n      )}\n\n      \n      {/* Mobile Bottom Navigation */}"
);

// Conditionally render bottom nav
content = content.replace(
  "{/* Mobile Bottom Navigation */}",
  "{!isPreview && (\n      {/* Mobile Bottom Navigation */}"
);

// End bottom nav conditional
content = content.replace(
  "</div>\n\n      {/* Main content */}",
  "</div>\n      )}\n\n      {/* Main content */}"
);

// Add Route
content = content.replace(
  "<Route path=\"/admin/*\" element={<AdminView />} />",
  "<Route path=\"/admin/*\" element={<AdminView />} />\n              <Route path=\"/preview/:projectId\" element={<PreviewView />} />"
);

fs.writeFileSync('src/App.tsx', content);
