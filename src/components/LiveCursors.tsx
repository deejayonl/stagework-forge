import React, { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

interface Cursor {
  x: number;
  y: number;
  color: string;
  name: string;
}

interface LiveCursorsProps {
  roomName: string;
}

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

export const LiveCursors: React.FC<LiveCursorsProps> = ({ roomName }) => {
  const [cursors, setCursors] = useState<Map<number, Cursor>>(new Map());
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);

  useEffect(() => {
    const ydoc = new Y.Doc();
    // Use a public y-websocket server for demo/preparation
    const wsProvider = new WebsocketProvider('wss://demos.yjs.dev', `forge-${roomName}`, ydoc);
    
    const awareness = wsProvider.awareness;
    
    // Assign a random color and name
    const myColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const myName = `User ${Math.floor(Math.random() * 1000)}`;
    
    awareness.setLocalStateField('user', {
      name: myName,
      color: myColor,
    });

    const handleMouseMove = (e: MouseEvent) => {
      awareness.setLocalStateField('cursor', {
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    awareness.on('change', () => {
      const states = awareness.getStates();
      const newCursors = new Map<number, Cursor>();
      
      states.forEach((state, clientID) => {
        if (clientID !== wsProvider.awareness.clientID) {
          if (state.cursor && state.user) {
            newCursors.set(clientID, {
              x: state.cursor.x,
              y: state.cursor.y,
              color: state.user.color,
              name: state.user.name
            });
          }
        }
      });
      
      setCursors(newCursors);
    });

    setProvider(wsProvider);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      wsProvider.disconnect();
      ydoc.destroy();
    };
  }, [roomName]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {Array.from(cursors.entries()).map(([id, cursor]) => (
        <div
          key={id}
          className="absolute transition-all duration-100 ease-linear"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={cursor.color}
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: 'rotate(-20deg)', transformOrigin: 'top left' }}
          >
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
          </svg>
          <div
            className="ml-4 mt-1 px-2 py-1 text-[10px] font-bold text-white rounded-full shadow-md whitespace-nowrap"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.name}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LiveCursors;
