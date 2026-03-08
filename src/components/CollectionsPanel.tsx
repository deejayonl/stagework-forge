import React, { useState } from 'react';
import { X, Plus, Trash2, List, Database, Table } from 'lucide-react';
import { Collection, CollectionField } from '../types';

interface CollectionsPanelProps {
  collections: Record<string, Collection>;
  onUpdateCollections: (collections: Record<string, Collection>) => void;
  onClose: () => void;
}

export const CollectionsPanel: React.FC<CollectionsPanelProps> = ({
  collections,
  onUpdateCollections,
  onClose
}) => {
  const [newCollectionName, setNewCollectionName] = useState('');
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'schema' | 'data'>('schema');

  const handleAddCollection = () => {
    if (!newCollectionName.trim()) return;
    const id = newCollectionName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!id || collections[id]) return;

    onUpdateCollections({
      ...collections,
      [id]: {
        id,
        name: newCollectionName,
        fields: [],
        data: []
      }
    });
    setNewCollectionName('');
    setActiveCollectionId(id);
    setActiveTab('schema');
  };

  const handleDeleteCollection = (id: string) => {
    const updated = { ...collections };
    delete updated[id];
    onUpdateCollections(updated);
    if (activeCollectionId === id) setActiveCollectionId(null);
  };

  const handleAddField = (collectionId: string, fieldName: string, fieldType: CollectionField['type']) => {
    const collection = collections[collectionId];
    if (!collection) return;

    onUpdateCollections({
      ...collections,
      [collectionId]: {
        ...collection,
        fields: [...collection.fields, { name: fieldName, type: fieldType }]
      }
    });
  };

  const handleDeleteField = (collectionId: string, fieldIndex: number) => {
    const collection = collections[collectionId];
    if (!collection) return;

    const newFields = [...collection.fields];
    newFields.splice(fieldIndex, 1);

    onUpdateCollections({
      ...collections,
      [collectionId]: {
        ...collection,
        fields: newFields
      }
    });
  };

  const handleAddDataRow = (collectionId: string) => {
    const collection = collections[collectionId];
    if (!collection) return;

    const newRow: any = { id: Math.random().toString(36).substr(2, 9) };
    collection.fields.forEach(f => {
      newRow[f.name] = f.type === 'number' ? 0 : f.type === 'boolean' ? false : '';
    });

    onUpdateCollections({
      ...collections,
      [collectionId]: {
        ...collection,
        data: [...collection.data, newRow]
      }
    });
  };

  const handleUpdateDataRow = (collectionId: string, rowIndex: number, fieldName: string, value: any) => {
    const collection = collections[collectionId];
    if (!collection) return;

    const newData = [...collection.data];
    newData[rowIndex] = { ...newData[rowIndex], [fieldName]: value };

    onUpdateCollections({
      ...collections,
      [collectionId]: {
        ...collection,
        data: newData
      }
    });
  };

  const handleDeleteDataRow = (collectionId: string, rowIndex: number) => {
    const collection = collections[collectionId];
    if (!collection) return;

    const newData = [...collection.data];
    newData.splice(rowIndex, 1);

    onUpdateCollections({
      ...collections,
      [collectionId]: {
        ...collection,
        data: newData
      }
    });
  };

  return (
    <div className="w-96 h-full bg-white dark:bg-hall-950 border-r border-hall-200 dark:border-hall-800 flex flex-col shadow-2xl backdrop-blur-xl z-50">
      <div className="p-4 border-b border-hall-200 dark:border-hall-800 flex items-center justify-between bg-hall-50/50 dark:bg-hall-900/50">
        <h3 className="font-semibold text-hall-900 dark:text-hall-100 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-500" />
          Data Collections
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 text-hall-500 hover:text-hall-900 dark:hover:text-hall-100 hover:bg-hall-200 dark:hover:bg-hall-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!activeCollectionId ? (
          <>
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/50 rounded-lg p-3 text-xs text-emerald-800 dark:text-emerald-400">
              Create collections to manage dynamic data in your app. Bind them to lists or grids in the inspector.
            </div>
            <div className="space-y-3">
              {Object.entries(collections).length === 0 ? (
                <div className="text-center py-6 text-sm text-hall-500 dark:text-hall-400">
                  No collections defined yet.
                </div>
              ) : (
                Object.values(collections).map((collection) => (
                  <div key={collection.id} className="group relative border border-hall-200 dark:border-hall-800 rounded-lg p-3 bg-hall-50 dark:bg-hall-900/30 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors cursor-pointer" onClick={() => { setActiveCollectionId(collection.id); setActiveTab('schema'); }}>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-hall-900 dark:text-hall-100">
                        {collection.name}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCollection(collection.id); }}
                        className="text-hall-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-xs text-hall-500 mt-1">
                      {collection.fields.length} fields • {collection.data.length} items
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="space-y-4 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => setActiveCollectionId(null)} className="text-xs text-emerald-500 hover:underline">
                &larr; Back
              </button>
              <h4 className="font-semibold text-sm">{collections[activeCollectionId]?.name}</h4>
            </div>

            <div className="flex gap-2 border-b border-hall-200 dark:border-hall-800 pb-2">
              <button
                onClick={() => setActiveTab('schema')}
                className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${activeTab === 'schema' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'text-hall-500 hover:bg-hall-100 dark:hover:bg-hall-800'}`}
              >
                Schema
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${activeTab === 'data' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'text-hall-500 hover:bg-hall-100 dark:hover:bg-hall-800'}`}
              >
                Data
              </button>
            </div>

            {activeTab === 'schema' ? (
              <div className="space-y-2 flex-1 overflow-y-auto">
                <h5 className="text-xs font-semibold uppercase text-hall-500">Fields</h5>
                {collections[activeCollectionId]?.fields.map((field, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm p-2 bg-hall-50 dark:bg-hall-900/50 rounded border border-hall-200 dark:border-hall-800">
                    <span>{field.name} <span className="text-xs text-hall-500">({field.type})</span></span>
                    <button onClick={() => handleDeleteField(activeCollectionId, idx)} className="text-hall-400 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <input id="newFieldName" type="text" placeholder="Field name" className="flex-1 text-sm bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded px-2 py-1" />
                  <select id="newFieldType" className="text-sm bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded px-2 py-1">
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="image">Image</option>
                    <option value="date">Date</option>
                  </select>
                  <button onClick={() => {
                    const nameInput = document.getElementById('newFieldName') as HTMLInputElement;
                    const typeSelect = document.getElementById('newFieldType') as HTMLSelectElement;
                    if (nameInput.value) {
                      handleAddField(activeCollectionId, nameInput.value, typeSelect.value as any);
                      nameInput.value = '';
                    }
                  }} className="bg-emerald-500 text-white px-2 py-1 rounded text-sm">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto">
                {collections[activeCollectionId]?.fields.length === 0 ? (
                  <div className="text-center py-6 text-sm text-hall-500">
                    Add fields in the Schema tab first.
                  </div>
                ) : (
                  <>
                    <button onClick={() => handleAddDataRow(activeCollectionId)} className="w-full flex items-center justify-center gap-2 bg-hall-100 dark:bg-hall-800 hover:bg-hall-200 dark:hover:bg-hall-700 text-hall-900 dark:text-hall-100 py-1.5 rounded text-xs font-medium transition-colors">
                      <Plus className="w-3 h-3" /> Add Row
                    </button>
                    <div className="space-y-4">
                      {collections[activeCollectionId]?.data.map((row, rowIndex) => (
                        <div key={row.id || rowIndex} className="relative p-3 bg-hall-50 dark:bg-hall-900/30 border border-hall-200 dark:border-hall-800 rounded-lg space-y-2">
                          <button onClick={() => handleDeleteDataRow(activeCollectionId, rowIndex)} className="absolute top-2 right-2 text-hall-400 hover:text-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="text-[10px] text-hall-500 font-mono mb-2">ID: {row.id}</div>
                          {collections[activeCollectionId]?.fields.map(field => (
                            <div key={field.name} className="flex flex-col gap-1">
                              <label className="text-[10px] font-semibold text-hall-600 dark:text-hall-400">{field.name}</label>
                              {field.type === 'boolean' ? (
                                <input
                                  type="checkbox"
                                  checked={!!row[field.name]}
                                  onChange={(e) => handleUpdateDataRow(activeCollectionId, rowIndex, field.name, e.target.checked)}
                                  className="w-4 h-4"
                                />
                              ) : (
                                <input
                                  type={field.type === 'number' ? 'number' : 'text'}
                                  value={row[field.name] || ''}
                                  onChange={(e) => handleUpdateDataRow(activeCollectionId, rowIndex, field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                                  className="w-full text-xs bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded px-2 py-1"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {!activeCollectionId && (
        <div className="p-4 border-t border-hall-200 dark:border-hall-800 bg-hall-50/50 dark:bg-hall-900/50 space-y-3">
          <div className="space-y-2">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded-lg px-3 py-2 text-sm text-hall-900 dark:text-hall-100 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Collection name (e.g. Products)"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCollection()}
            />
          </div>
          <button
            onClick={handleAddCollection}
            disabled={!newCollectionName.trim()}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-hall-300 dark:disabled:bg-hall-800 disabled:text-hall-500 text-white py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Collection
          </button>
        </div>
      )}
    </div>
  );
};
