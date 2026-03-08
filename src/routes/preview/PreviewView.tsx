import { useParams } from 'react-router-dom';
import { flattenFilesForPreview } from '../../utils/fileUtils';

export default function PreviewView() {
  const { projectId } = useParams();
  const [html, setHtml] = useState<string>('');
  const [error, setError] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!projectId) return;

    // Fetch initial state via API
    const API_BASE = 'https://sgfbackend.deejay.onl/api/projects';
    fetch(`${API_BASE}/${projectId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load project');
        return res.json();
      })
      .then(data => {
        if (data && data.project && data.project.mutations && data.project.mutations.length > 0) {
          const latestMutation = data.project.mutations[data.project.mutations.length - 1];
          if (latestMutation.files) {
            const flattenedHtml = flattenFilesForPreview(latestMutation.files);
            setHtml(flattenedHtml);
          }
        }
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load preview');
      });

    // Connect to WebSocket Live Sync
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = import.meta.env.DEV 
      ? `ws://localhost:3001/sync?projectId=${projectId}`
      : `${protocol}//${window.location.host}/sync?projectId=${projectId}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to Live Sync');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'SYNC_FILES' && data.files) {
          const newHtml = flattenFilesForPreview(data.files);
          setHtml(newHtml);
        }
      } catch (err) {
        console.error('Error parsing WS message', err);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from Live Sync');
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [projectId]);

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!html) {
    return <div className="flex items-center justify-center h-screen bg-black text-white">Loading Live Preview...</div>;
  }

  return (
    <iframe 
      title="Live Preview"
      srcDoc={html}
      className="w-full h-screen border-none"
      sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
    />
  );
}
