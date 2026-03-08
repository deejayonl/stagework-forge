


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

export interface GeneratedFile {
  name: string;
  content: string;
  type: 'html' | 'css' | 'js' | 'json' | 'image' | 'other';
}

export interface ApiEndpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  body?: string;
  lastResponse?: any;
}

export interface ProjectVersion {
  id: string;
  files: GeneratedFile[];
  prompt: string;
  timestamp: number;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  versions: ProjectVersion[];
  currentVersionIndex: number;
  variables?: Record<string, string>;
  components?: Record<string, string>;
  theme?: Record<string, string>;
  customFonts?: string[];
  seo?: Record<string, string>;
  collections?: Record<string, Collection>;
  assets?: Record<string, string>;
  apis?: Record<string, ApiEndpoint>;
  
  // Cloud Sync State
  cloudFolderId?: number; // ID of the folder in cloud storage
  cloudFileMap?: Record<string, number>; // Map of filename -> cloud entry ID
  lastSyncedAt?: number;
}

export interface ProjectState {
  files: GeneratedFile[];
  status: 'idle' | 'generating' | 'error' | 'success';
  error?: string;
}

export interface ImageGenerationState {
  status: 'idle' | 'generating' | 'error' | 'success';
  imageUrl?: string;
  error?: string;
}

export enum ImageSize {
  Size1K = '1K',
  Size2K = '2K',
  Size4K = '4K'
}

export interface GenerationConfig {
  useThinking: boolean;
  model: string;
}

export interface Attachment {
  id: string;
  file: File;
  base64: string;
  mimeType: string;
}

export interface CloudConfig {
  token: string;
  enabled: boolean;
}

export interface DetectedAsset {
  id: string;
  url: string;
  type: 'img-tag' | 'css-url';
  location: string; 
  context?: string;
}

export interface BatchImageGeneration {
  targetUrl: string;
  newAsset: GeneratedFile;
}

export interface User {
  uid: string;
  email: string;
  username: string;
  exp: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}