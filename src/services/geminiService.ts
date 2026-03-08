// @ts-ignore
import { parse as parsePartialJson } from "partial-json";
import { GeneratedFile, ImageSize, Attachment, DetectedAsset } from "../types";

const getApiKey = () => {
    let localKey = '';
    const savedKeys = localStorage.getItem('forge_api_keys');
    if (savedKeys) {
        try { localKey = JSON.parse(savedKeys).gemini; } catch(e){}
    }
    return localKey || (import.meta as any).env?.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || '';
};

// Use proxy in dev, or relative in prod
const API_BASE = import.meta.env?.DEV ? 'http://localhost:3001/api/generate' : '/api/generate';

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
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("Gemini API Key is missing. Please add it to your settings.");
    }

    const MUTATE_URL = import.meta.env?.DEV ? 'http://localhost:3001/api/mutate' : '/api/mutate';
    const response = await fetch(MUTATE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
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
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("Gemini API Key is missing. Please add it to your settings.");
    }

    const response = await fetch(`${API_BASE}/generate-image`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
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
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("Gemini API Key is missing. Please add it to your settings.");
    }

    const response = await fetch(`${API_BASE}/plan-images`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
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
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("Gemini API Key is missing.");
    }

    const AUTOFIX_URL = import.meta.env?.DEV ? 'http://localhost:3001/api/autofix' : '/api/autofix';
    const response = await fetch(AUTOFIX_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
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
