
import { GeneratedFile } from '../types';
import JSZip from 'jszip';

// Points directly to the Cardsite Cloud API
const API_BASE = 'https://storage.onl/api/v1';

export const cloudService = {
  /**
   * Validates the provided token.
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/drive/file-entries?perPage=1`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  /**
   * Finds a folder by name within a parent directory.
   */
  async findFolder(token: string, name: string, parentId: number | null = null) {
    const url = new URL(`${API_BASE}/drive/file-entries`);
    if (parentId) url.searchParams.append('parentIds', parentId.toString());
    url.searchParams.append('type', 'folder');
    url.searchParams.append('query', name);

    const res = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    
    if (!res.ok) return null;

    const json = await res.json();
    if (!json.data) return null;
    
    // Precise matching since query can be fuzzy
    return json.data.find((f: any) => f.name === name);
  },

  /**
   * Creates a new folder.
   */
  async createFolder(token: string, name: string, parentId: number | null = null) {
    const res = await fetch(`${API_BASE}/folders`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, parentId })
    });
    
    const json = await res.json();
    return json.folder;
  },

  /**
   * Gets an existing folder or creates it if it doesn't exist.
   */
  async getOrCreateFolder(token: string, name: string, parentId: number | null = null) {
    const existing = await this.findFolder(token, name, parentId);
    if (existing) return existing;
    return this.createFolder(token, name, parentId);
  },

  /**
   * Uploads a file to the cloud.
   */
  async uploadFile(token: string, file: File, parentId: number | null = null) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('parentId', parentId ? parentId.toString() : 'null');
    formData.append('uploadType', 'bedrive'); // Required by Cardsite Cloud

    const res = await fetch(`${API_BASE}/uploads`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json'
      },
      body: formData
    });
    
    if (!res.ok) {
        throw new Error(`Upload failed: ${res.statusText}`);
    }
    const json = await res.json();
    return json.fileEntry;
  },

  /**
   * Deletes a file entry.
   */
  async deleteEntry(token: string, entryId: number) {
    await fetch(`${API_BASE}/file-entries/delete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ entryIds: [entryId], deleteForever: true })
    });
  },

  /**
   * Helper to convert GeneratedFile to a File object for upload.
   */
  convertGeneratedFileToFile(genFile: GeneratedFile): File {
    let blob: Blob;

    if (genFile.type === 'image' || genFile.content.startsWith('data:image')) {
      try {
        // Convert Base64 to Blob
        const parts = genFile.content.split(',');
        if (parts.length < 2) throw new Error("Invalid base64 data");
        
        const byteString = atob(parts[1]);
        const mimeString = parts[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        blob = new Blob([ab], { type: mimeString });
      } catch (e) {
        console.warn("Failed to convert image to blob, creating empty file", e);
        blob = new Blob([""], { type: 'application/octet-stream' });
      }
    } else {
      // Text content
      const mimeType = genFile.type === 'html' ? 'text/html' : 
                       genFile.type === 'css' ? 'text/css' : 
                       genFile.type === 'js' ? 'text/javascript' : 'text/plain';
      blob = new Blob([genFile.content], { type: mimeType });
    }

    return new File([blob], genFile.name, { type: blob.type });
  },

  /**
   * Zips a list of GeneratedFile objects.
   */
  async zipWorkspace(files: GeneratedFile[], projectName: string = 'workspace'): Promise<File> {
    const zip = new JSZip();
    
    for (const file of files) {
      if (file.type === 'image' || file.content.startsWith('data:image')) {
        const parts = file.content.split(',');
        if (parts.length >= 2) {
          zip.file(file.name, parts[1], { base64: true });
        }
      } else {
        zip.file(file.name, file.content);
      }
    }
    
    const blob = await zip.generateAsync({ type: 'blob' });
    return new File([blob], `${projectName}.zip`, { type: 'application/zip' });
  },

  /**
   * Uploads and deploys the zipped workspace.
   */
  async deployWorkspace(token: string, files: GeneratedFile[], projectName: string): Promise<any> {
    const zipFile = await this.zipWorkspace(files, projectName);
    return this.uploadFile(token, zipFile);
  }
};
