// @ts-ignore
import { parse as parsePartialJson } from "partial-json";
import { GeneratedFile, ImageSize, Attachment, DetectedAsset } from "../types";


const getAiConfig = () => {
    const provider = localStorage.getItem('forge_ai_provider') || 'gemini';
    let apiKey = '';
    
    if (provider === 'gemini') {
        apiKey = localStorage.getItem('gemini_api_key') || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
    } else if (provider === 'anthropic') {
        apiKey = localStorage.getItem('anthropic_api_key') || (import.meta as any).env?.VITE_ANTHROPIC_API_KEY || '';
    } else if (provider === 'openai') {
        apiKey = localStorage.getItem('openai_api_key') || (import.meta as any).env?.VITE_OPENAI_API_KEY || '';
    }

    // Fallback to legacy forge_api_keys if present
    if (!apiKey) {
        const savedKeys = localStorage.getItem('forge_api_keys');
        if (savedKeys) {
            try { 
                const keys = JSON.parse(savedKeys);
                apiKey = keys[provider] || keys.gemini || ''; 
            } catch(e){}
        }
    }

    return { provider, apiKey };
};


// Use proxy in dev, or relative in prod
const API_BASE = 'https://sgfbackend.deejay.onl/api/generate';

/**
 * Generates web artifact code based on a text prompt and optional attachments.
 * Calls the Backend-for-Frontend (BFF).
 */
export const generateCode = async (
  prompt: string,
  useThinking: boolean,
  attachments: Attachment[] = [],
  currentFiles: GeneratedFile[] = [],
  onProgress?: (partialFiles: GeneratedFile[]) => void,
  signal?: AbortSignal
): Promise<GeneratedFile[]> => {
  try {
    const { provider, apiKey } = getAiConfig();

    const MUTATE_URL = 'https://sgfbackend.deejay.onl/api/mutate';
    const response = await fetch(MUTATE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}),
            'X-AI-Provider': provider
        },
        body: JSON.stringify({
            prompt,
            useThinking,
            attachments,
            currentFiles
        }),
        signal
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response stream from BFF");

    const decoder = new TextDecoder("utf-8");
    let fullText = "";

    while (true) {
        if (signal?.aborted) throw new Error("AbortError");
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        if (onProgress) {
            try {
                const parsed = parsePartialJson(fullText);
                if (parsed && parsed.files && Array.isArray(parsed.files)) {
                    const partialRestoredFiles = parsed.files.map((f: any) => {
                        if (f.content && typeof f.content === 'string' && f.content.includes('[IMAGE_ASSET_DATA_PRESERVED_BY_SYSTEM]')) {
                            const original = currentFiles.find(cf => cf.name === f.name);
                            if (original) {
                                return { ...f, content: original.content };
                            }
                        }
                        return f;
                    });
                    onProgress(partialRestoredFiles as GeneratedFile[]);
                }
            } catch (e) {
                // Ignore partial parse errors
            }
        }
    }

    if (!fullText) throw new Error("No response from BFF");

    const parsed = JSON.parse(fullText);
    if (!parsed.files || !Array.isArray(parsed.files)) {
      throw new Error("Invalid response format from BFF");
    }

    // Post-processing: Restore image data if the model returned the placeholder
    const restoredFiles = parsed.files.map((f: GeneratedFile) => {
        if (f.content && f.content.includes('[IMAGE_ASSET_DATA_PRESERVED_BY_SYSTEM]')) {
            const original = currentFiles.find(cf => cf.name === f.name);
            if (original) {
                return { ...f, content: original.content };
            }
        }
        return f;
    });

    return restoredFiles;

  } catch (error) {
    console.error("Forge Code Generation Error:", error);
    throw error;
  }
};

/**
 * Generates an image based on a prompt and size configuration.
 * Calls the Backend-for-Frontend (BFF).
 */
export const generateImage = async (
  prompt: string,
  size: ImageSize
): Promise<string> => {
  try {
    const { provider, apiKey } = getAiConfig();

    const response = await fetch(`${API_BASE}/generate-image`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}),
            'X-AI-Provider': provider
        },
        body: JSON.stringify({ prompt, size })
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;

  } catch (error: any) {
    console.error("Forge Image Generation Error:", error);
    throw error;
  }
};

/**
 * Plans image replacements by analyzing existing assets and user intent.
 * Calls the Backend-for-Frontend (BFF).
 */
export const planImageReplacements = async (
  assets: DetectedAsset[],
  userInstruction: string
): Promise<Array<{ assetId: string; prompt: string; suggestedName: string }>> => {
  try {
    const { apiKey, provider } = getAiConfig();

    const response = await fetch(`${API_BASE}/plan-images`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}),
            'X-AI-Provider': provider
        },
        body: JSON.stringify({ assets, userInstruction })
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.plan || [];

  } catch (error) {
    console.error("Forge Planning Error:", error);
    return assets.map(a => ({
      assetId: a.id,
      prompt: userInstruction,
      suggestedName: `image-${a.id}.png`
    }));
  }
};

export const fixHtmlNode = async (html: string): Promise<string> => {
  try {
    const { apiKey, provider } = getAiConfig();

    const AUTOFIX_URL = 'https://sgfbackend.deejay.onl/api/autofix';
    const response = await fetch(AUTOFIX_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}),
            'X-AI-Provider': provider
        },
        body: JSON.stringify({ html })
    });

    if (!response.ok) {
        throw new Error("Failed to autofix HTML");
    }

    const data = await response.json();
    return data.html;

  } catch (error) {
    console.error("AutoFix Error:", error);
    throw error;
  }
};

export const rewriteText = async (text: string, tone: string): Promise<string> => {
  try {
    const { apiKey, provider } = getAiConfig();

    const REWRITE_URL = 'https://sgfbackend.deejay.onl/api/rewrite';
    const response = await fetch(REWRITE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}),
            'X-AI-Provider': provider
        },
        body: JSON.stringify({ text, tone })
    });

    if (!response.ok) {
        throw new Error("Failed to rewrite text");
    }

    const data = await response.json();
    return data.text;

  } catch (error) {
    console.error("Rewrite Error:", error);
    throw error;
  }
};
