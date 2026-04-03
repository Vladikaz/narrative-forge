import React from 'react';
import { GitMerge, Trash2, Video, X, FolderOpen, Save } from 'lucide-react';
import type { Scene } from './types';

interface NarrativeMapProps {
  scenes: Scene[];
  activeSceneId: string | null;
  isLocked: boolean;
  onClose: () => void;
  onSelectScene: (id: string) => void;
  onBranch: (parentId: string) => void;
  onDeleteScene: (id: string) => void;
  onExport: () => void;
  onImport: () => void;
}

const NarrativeMap: React.FC<NarrativeMapProps> = ({
  scenes, activeSceneId, isLocked, onClose, onSelectScene,
  onBranch, onDeleteScene, onExport, onImport,
}) => {
  const renderTree = (sceneId: string, depth = 0): React.ReactNode => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return null;
    const children = scenes.filter(s => s.parentId === sceneId);

    return (
      <div key={sceneId} className="flex flex-col mt-3">
        <div className="flex items-center gap-4 group">
          {depth > 0 && <div className="w-8 h-[2px] bg-border" />}
          <div
            onClick={() => onSelectScene(sceneId)}
            className={`flex items-center gap-3 p-2 pr-4 rounded-lg cursor-pointer border transition-all ${
              activeSceneId === sceneId
                ? 'border-foreground bg-foreground/10 shadow-lg'
                : 'border-border bg-card/80 hover:border-muted-foreground'
            }`}
          >
            {scene.mediaType === 'video' ? (
              <div className="w-12 h-8 bg-secondary rounded flex items-center justify-center text-muted-foreground">
                <Video size={14} />
              </div>
            ) : (
              <div
                className="w-12 h-8 bg-cover bg-center rounded bg-secondary"
                style={{ backgroundImage: `url(${scene.mediaUrl})` }}
              />
            )}
            <span className="text-sm font-medium w-32 truncate">{scene.name}</span>
          </div>
          {!isLocked && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); onBranch(sceneId); }}
                className="p-1.5 bg-secondary hover:bg-muted rounded-md text-muted-foreground text-xs border border-border flex items-center gap-1"
              >
                <GitMerge size={14} /> Branch
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteScene(sceneId); }}
                className="p-1.5 bg-destructive/20 hover:bg-destructive rounded-md text-destructive hover:text-destructive-foreground text-xs border border-destructive/30 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
        {children.length > 0 && (
          <div className="ml-6 border-l-2 border-border pl-4 flex flex-col relative">
            {children.map(child => renderTree(child.id, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="absolute inset-0 z-[60] bg-background/[0.98] backdrop-blur-2xl overflow-y-auto p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-12 border-b border-border pb-8">
          <h2 className="text-3xl font-light tracking-widest flex items-center gap-4">
            <GitMerge className="text-muted-foreground" size={32} /> SCENE ARCHITECTURE
          </h2>
          <div className="flex gap-4">
            {!isLocked && (
              <>
                <button onClick={onImport} className="flex items-center gap-2 bg-card border border-border px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-secondary">
                  <FolderOpen size={18} /> LOAD
                </button>
                <button onClick={onExport} className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-xl text-xs font-bold hover:opacity-90">
                  <Save size={18} /> SAVE
                </button>
              </>
            )}
            <button onClick={onClose} className="p-3 hover:bg-foreground/10 rounded-full transition-all">
              <X size={28} />
            </button>
          </div>
        </div>
        <div className="bg-engine-overlay/40 p-10 rounded-3xl border border-foreground/5 shadow-2xl">
          {scenes.filter(s => !s.parentId).map(scene => renderTree(scene.id))}
        </div>
      </div>
    </div>
  );
};

export default NarrativeMap;
