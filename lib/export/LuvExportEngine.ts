/**
 * Learning Universe Export Engine
 * 
 * Handles the .luv (Learning Universe) file format for full canvas export/import.
 * Format: JSON with metadata, version, graph state, viewport, theme, and settings.
 * Extension: .luv
 */

import { LearningNodeType, LearningEdgeData } from '@/stores/learningUniverseStore';
import { Edge, Viewport } from '@xyflow/react';

export const LUV_VERSION = '1.0.0';
export const LUV_EXTENSION = '.luv';

export interface LuvFileFormat {
  version: string;
  format: 'learning-universe-v1';
  metadata: {
    exportedAt: string;
    canvasName: string;
    canvasId?: string;
    description?: string;
    generatedBy: 'user' | 'ai_mock' | 'langgraph';
    totalNodes: number;
    totalEdges: number;
    tags?: string[];
  };
  graph: {
    nodes: LearningNodeType[];
    edges: Edge<LearningEdgeData>[];
  };
  viewport: Viewport;
  theme: string;
  settings: {
    layoutMode: string;
    autoSave: boolean;
  };
  checksum: string;
}

// Simple checksum for validation
const computeChecksum = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const chr = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
};

export class LuvExportEngine {
  
  // ── Export ─────────────────────────────────────────────────────────────────
  
  static export(params: {
    canvasName: string;
    canvasId?: string;
    nodes: LearningNodeType[];
    edges: Edge<LearningEdgeData>[];
    viewport: Viewport;
    theme?: string;
    layoutMode?: string;
  }): LuvFileFormat {
    const graphStr = JSON.stringify({ nodes: params.nodes, edges: params.edges });
    
    return {
      version: LUV_VERSION,
      format: 'learning-universe-v1',
      metadata: {
        exportedAt: new Date().toISOString(),
        canvasName: params.canvasName,
        canvasId: params.canvasId,
        generatedBy: 'user',
        totalNodes: params.nodes.length,
        totalEdges: params.edges.length,
      },
      graph: {
        nodes: params.nodes,
        edges: params.edges,
      },
      viewport: params.viewport,
      theme: params.theme || 'dark',
      settings: {
        layoutMode: params.layoutMode || 'free',
        autoSave: true,
      },
      checksum: computeChecksum(graphStr),
    };
  }

  static downloadAsLuv(data: LuvFileFormat, fileName?: string): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName || data.metadata.canvasName.replace(/\s+/g, '_')}${LUV_EXTENSION}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ── Import ─────────────────────────────────────────────────────────────────

  static async parseFile(file: File): Promise<LuvFileFormat> {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as LuvFileFormat;
      const validated = LuvExportEngine.validate(parsed);
      if (!validated.valid) {
        throw new Error(validated.error || 'Invalid .luv file');
      }
      return parsed;
    } catch (err: any) {
      throw new Error(`Failed to parse file: ${err.message}`);
    }
  }

  static async importFromFile(): Promise<LuvFileFormat> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.luv,.json';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) { reject(new Error('No file selected')); return; }
        
        try {
          const parsed = await LuvExportEngine.parseFile(file);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      };
      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    });
  }

  static validate(data: any): { valid: boolean; error?: string } {
    if (!data || typeof data !== 'object') return { valid: false, error: 'Not a valid object' };
    if (data.format !== 'learning-universe-v1') return { valid: false, error: 'Unrecognized format. Expected learning-universe-v1' };
    if (!data.graph?.nodes || !data.graph?.edges) return { valid: false, error: 'Missing graph data' };
    if (!Array.isArray(data.graph.nodes) || !Array.isArray(data.graph.edges)) return { valid: false, error: 'Graph nodes/edges must be arrays' };
    
    // Verify checksum
    const expectedChecksum = computeChecksum(JSON.stringify({ nodes: data.graph.nodes, edges: data.graph.edges }));
    if (data.checksum && data.checksum !== expectedChecksum) {
      return { valid: false, error: 'Checksum mismatch — file may be corrupted' };
    }
    
    return { valid: true };
  }

  // ── Rich Markdown Export ───────────────────────────────────────────────────

  static exportAsMarkdown(params: {
    canvasName: string;
    nodes: LearningNodeType[];
    edges: Edge<LearningEdgeData>[];
  }): string {
    const { canvasName, nodes, edges } = params;
    const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const completedNodes = nodes.filter(n => n.data.status === 'completed');
    const totalXP = nodes.reduce((sum, n) => sum + (n.data.xp || 0), 0);
    const totalHours = Math.round(nodes.reduce((sum, n) => sum + (n.data.estimated_time || 0), 0) / 60);
    const completionPct = nodes.length > 0 ? Math.round((completedNodes.length / nodes.length) * 100) : 0;

    // Group nodes by type
    const byType = (type: string) => nodes.filter(n => n.data.type === type);
    const milestones = byType('milestone');
    const topics = byType('topic');
    const subtopics = byType('subtopic');
    const lessons = byType('lesson');
    const concepts = byType('concept');
    const projects = [...byType('project'), ...byType('mini_project')];
    const revisions = byType('revision');
    const interviews = byType('interview');

    const nodeSection = (title: string, nodeList: LearningNodeType[]) => {
      if (nodeList.length === 0) return '';
      return `\n### ${title}\n\n${nodeList.map(n => {
        const badge = n.data.status === 'completed' ? '✅' : n.data.status === 'in-progress' ? '🔄' : '🔒';
        const xp = n.data.xp ? ` · ${n.data.xp} XP` : '';
        const time = n.data.estimated_time ? ` · ~${n.data.estimated_time}min` : '';
        const tags = n.data.tags?.length ? `\n   > Tags: \`${n.data.tags.join('`, `')}\`` : '';
        return `- ${badge} **${n.data.title}** *(${n.data.difficulty || 'N/A'}${xp}${time})*\n   > ${n.data.description || ''}${tags}`;
      }).join('\n\n')}`;
    };

    const edgeSection = () => {
      if (edges.length === 0) return '';
      const grouped = edges.reduce<Record<string, typeof edges>>((acc, e) => {
        const type = e.data?.semanticType || 'unknown';
        acc[type] = acc[type] || [];
        acc[type].push(e);
        return acc;
      }, {});
      
      return `\n### Dependency Map\n\n${Object.entries(grouped).map(([type, group]) =>
        `**${type.toUpperCase()}** (${group.length})\n${group.map(e => {
          const sourceNode = nodes.find(n => n.id === e.source);
          const targetNode = nodes.find(n => n.id === e.target);
          const reason = e.data?.reason ? ` — *${e.data.reason}*` : '';
          return `- ${sourceNode?.data.title || e.source} → ${targetNode?.data.title || e.target}${reason}`;
        }).join('\n')}`
      ).join('\n\n')}`;
    };

    return `# 🌌 ${canvasName}

> Exported from the Learning Universe on ${now}

---

## 📊 Roadmap Summary

| Metric | Value |
|--------|-------|
| Total Topics & Nodes | ${nodes.length} |
| Total Relationships | ${edges.length} |
| Completed | ${completedNodes.length} (${completionPct}%) |
| Total XP | ${totalXP} XP |
| Estimated Time | ~${totalHours} hours |
| Projects | ${projects.length} |
| Milestones | ${milestones.length} |

---

## 🗺️ Learning Path Overview

${nodes
  .filter(n => n.data.metadata?.hierarchyIndex)
  .sort((a, b) => {
    const ai = a.data.metadata?.hierarchyIndex || '';
    const bi = b.data.metadata?.hierarchyIndex || '';
    return ai.localeCompare(bi);
  })
  .map(n => {
    const idx = n.data.metadata?.hierarchyIndex;
    const indent = '  '.repeat((idx?.split('.').length || 1) - 1);
    const badge = n.data.status === 'completed' ? '✅' : n.data.status === 'in-progress' ? '🔄' : '🔒';
    return `${indent}- ${badge} [${idx}] **${n.data.title}** *(${n.data.type})*`;
  })
  .join('\n')}

---

## 📚 Topics & Subtopics
${nodeSection('Milestones', milestones)}
${nodeSection('Main Topics', topics)}
${nodeSection('Subtopics', subtopics)}
${nodeSection('Concepts', concepts)}
${nodeSection('Lessons', lessons)}

---

## 🏗️ Projects
${nodeSection('Projects', projects)}

---

## 🔄 Revision & Interview Prep
${nodeSection('Revision', revisions)}
${nodeSection('Interview Preparation', interviews)}

---

## 🔗 Dependencies
${edgeSection()}

---

*Generated by Learning Universe — AI Learning Operating System*`;
  }

  static downloadAsMarkdown(content: string, fileName: string): void {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
