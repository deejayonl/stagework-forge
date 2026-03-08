import React, { useState } from 'react';
import { ApiEndpoint } from '../types';
import { Database, Plus, Trash2, Save, Play, X } from 'lucide-react';

interface ApiIntegrationsPanelProps {
  apis: Record<string, ApiEndpoint>;
  onUpdate: (apis: Record<string, ApiEndpoint>) => void;
  onClose: () => void;
}

export function ApiIntegrationsPanel({ apis, onUpdate, onClose }: ApiIntegrationsPanelProps) {
  const [selectedApiId, setSelectedApiId] = useState<string | null>(null);
  const [editingApi, setEditingApi] = useState<ApiEndpoint | null>(null);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleAdd = () => {
    const id = 'api_' + Math.random().toString(36).substr(2, 9);
    const newApi: ApiEndpoint = {
      id,
      name: 'New API Endpoint',
      url: 'https://api.example.com/data',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: ''
    };
    setEditingApi(newApi);
    setSelectedApiId(id);
  };

  const handleSave = () => {
    if (editingApi) {
      onUpdate({ ...apis, [editingApi.id]: editingApi });
      setEditingApi(null);
      setSelectedApiId(null);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newApis = { ...apis };
    delete newApis[id];
    onUpdate(newApis);
    if (selectedApiId === id) {
      setSelectedApiId(null);
      setEditingApi(null);
    }
  };

  const handleTest = async () => {
    if (!editingApi) return;
    setIsTesting(true);
    setTestResponse(null);
    try {
      const options: RequestInit = {
        method: editingApi.method,
        headers: editingApi.headers,
      };
      if (editingApi.method !== 'GET' && editingApi.method !== 'HEAD' && editingApi.body) {
        options.body = editingApi.body;
      }
      const res = await fetch(editingApi.url, options);
      const data = await res.text();
      try {
        const json = JSON.parse(data);
        setTestResponse(JSON.stringify(json, null, 2));
      } catch {
        setTestResponse(data);
      }
    } catch (err: any) {
      setTestResponse('Error: ' + err.message);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="absolute left-14 top-14 bottom-0 w-80 bg-hall-950 border-r border-hall-800 shadow-2xl z-40 flex flex-col">
      <div className="p-4 border-b border-hall-800 flex justify-between items-center bg-hall-900/50">
        <h3 className="font-semibold text-hall-100 flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" />
          API Integrations
        </h3>
        <button onClick={onClose} className="p-1.5 text-hall-400 hover:text-hall-100 rounded-lg hover:bg-hall-800 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!editingApi ? (
          <div className="p-4 space-y-4">
            <button
              onClick={handleAdd}
              className="w-full py-2 px-4 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-500/20 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add API Endpoint
            </button>

            <div className="space-y-2">
              {Object.values(apis).map(api => (
                <div
                  key={api.id}
                  onClick={() => {
                    setSelectedApiId(api.id);
                    setEditingApi(api);
                  }}
                  className="p-3 bg-hall-900 border border-hall-800 rounded-xl cursor-pointer hover:border-indigo-500/50 transition-colors group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium text-hall-100 text-sm">{api.name}</div>
                    <button
                      onClick={(e) => handleDelete(api.id, e)}
                      className="text-hall-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs font-mono text-hall-400 truncate flex items-center gap-2">
                    <span className="text-indigo-400 font-bold">{api.method}</span>
                    {api.url}
                  </div>
                </div>
              ))}
              {Object.keys(apis).length === 0 && (
                <div className="text-center py-8 text-hall-500 text-sm">
                  No APIs defined yet.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-hall-400 mb-1">Endpoint Name</label>
              <input
                type="text"
                value={editingApi.name}
                onChange={e => setEditingApi({ ...editingApi, name: e.target.value })}
                className="w-full bg-hall-900 border border-hall-800 rounded-lg px-3 py-2 text-sm text-hall-100 focus:outline-none focus:border-indigo-500"
                placeholder="e.g. Fetch Users"
              />
            </div>

            <div className="flex gap-2">
              <div className="w-24">
                <label className="block text-xs font-medium text-hall-400 mb-1">Method</label>
                <select
                  value={editingApi.method}
                  onChange={e => setEditingApi({ ...editingApi, method: e.target.value as any })}
                  className="w-full bg-hall-900 border border-hall-800 rounded-lg px-2 py-2 text-sm text-hall-100 focus:outline-none focus:border-indigo-500"
                >
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-hall-400 mb-1">URL</label>
                <input
                  type="text"
                  value={editingApi.url}
                  onChange={e => setEditingApi({ ...editingApi, url: e.target.value })}
                  className="w-full bg-hall-900 border border-hall-800 rounded-lg px-3 py-2 text-sm text-hall-100 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="https://api..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-hall-400 mb-1">Headers (JSON)</label>
              <textarea
                value={JSON.stringify(editingApi.headers, null, 2)}
                onChange={e => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setEditingApi({ ...editingApi, headers: parsed });
                  } catch (err) {
                    // ignore invalid json while typing
                  }
                }}
                className="w-full h-24 bg-hall-900 border border-hall-800 rounded-lg px-3 py-2 text-sm text-hall-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {editingApi.method !== 'GET' && (
              <div>
                <label className="block text-xs font-medium text-hall-400 mb-1">Body (JSON)</label>
                <textarea
                  value={editingApi.body || ''}
                  onChange={e => setEditingApi({ ...editingApi, body: e.target.value })}
                  className="w-full h-24 bg-hall-900 border border-hall-800 rounded-lg px-3 py-2 text-sm text-hall-100 font-mono focus:outline-none focus:border-indigo-500"
                  placeholder='{"key": "value"}'
                />
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center gap-2 transition-colors text-sm font-medium"
              >
                <Save className="w-4 h-4" />
                Save API
              </button>
              <button
                onClick={() => {
                  setEditingApi(null);
                  setSelectedApiId(null);
                  setTestResponse(null);
                }}
                className="py-2 px-4 bg-hall-800 hover:bg-hall-700 text-hall-100 rounded-xl transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>

            <div className="pt-4 border-t border-hall-800">
              <button
                onClick={handleTest}
                disabled={isTesting}
                className="w-full py-2 px-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm font-medium disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                {isTesting ? 'Testing...' : 'Test Endpoint'}
              </button>
              
              {testResponse && (
                <div className="mt-4">
                  <label className="block text-xs font-medium text-hall-400 mb-1">Response</label>
                  <div className="bg-black/50 border border-hall-800 rounded-lg p-3 overflow-x-auto max-h-48 overflow-y-auto">
                    <pre className="text-xs font-mono text-hall-300 whitespace-pre-wrap">{testResponse}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
