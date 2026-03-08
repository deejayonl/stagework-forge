// ============================================================================
// Project Store — File-based JSON persistence for project state
// ============================================================================

import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export interface ProjectState {
  id: string;
  name: string;
  script: string;
  targets: string[];
  blueprints: any[]; // The generated designs
  mutations: any[]; // The real-time changes
  components?: Record<string, string>; // Saved custom components (name -> HTML)
  collections?: Record<string, any>; // CMS Collections
  customDomain?: string;
  updatedAt: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');

class ProjectStore {
  async init() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (err) {
      console.error('Failed to create data directory:', err);
    }
  }

  async save(project: Partial<ProjectState>): Promise<ProjectState> {
    await this.init();
    
    const id = project.id || randomUUID();
    const now = Date.now();
    
    let existing: Partial<ProjectState> = {};
    if (project.id) {
      existing = await this.get(project.id) || {};
    }

    const state: ProjectState = {
      id,
      name: project.name || existing.name || 'Untitled Project',
      script: project.script || existing.script || '',
      targets: project.targets || existing.targets || [],
      blueprints: project.blueprints || existing.blueprints || [],
      mutations: project.mutations || existing.mutations || [],
      components: project.components || existing.components || {},
      collections: project.collections || existing.collections || {},
      customDomain: project.customDomain || existing.customDomain,
      updatedAt: now,
    };

    const filePath = path.join(DATA_DIR, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(state, null, 2));
    
    return state;
  }

  async get(id: string): Promise<ProjectState | null> {
    await this.init();
    const filePath = path.join(DATA_DIR, `${id}.json`);
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as ProjectState;
    } catch (err) {
      return null;
    }
  }

  async list(): Promise<ProjectState[]> {
    await this.init();
    try {
      const files = await fs.readdir(DATA_DIR);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      const projects: ProjectState[] = [];
      for (const file of jsonFiles) {
        const data = await fs.readFile(path.join(DATA_DIR, file), 'utf-8');
        try {
          projects.push(JSON.parse(data));
        } catch (e) {
          // ignore corrupted files
        }
      }
      
      return projects.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (err) {
      return [];
    }
  }
}

export const projectStore = new ProjectStore();
