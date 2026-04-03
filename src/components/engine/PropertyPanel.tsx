import React from 'react';
import { X } from 'lucide-react';
import type { Scene } from './types';

interface PropertyPanelProps {
  activeScene: Scene;
  editingButtonId: string | null;
  editingObjectId: string | null;
  scenes: Scene[];
  onUpdateScenes: (scenes: Scene[]) => void;
  onClose: () => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({
  activeScene, editingButtonId, editingObjectId, scenes, onUpdateScenes, onClose,
}) => {
  const updateScene = (updater: (s: Scene) => Scene) => {
    onUpdateScenes(scenes.map(s => s.id === activeScene.id ? updater(s) : s));
  };

  return (
    <div className="absolute right-6 top-24 w-80 bg-card/[0.98] backdrop-blur-2xl border border-border rounded-2xl p-6 shadow-2xl z-50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">Configuration</h3>
        <button onClick={onClose} className="hover:text-foreground transition-all text-muted-foreground">
          <X size={18} />
        </button>
      </div>

      {editingButtonId ? (
        <div className="space-y-5">
          <input
            type="text"
            value={activeScene.buttons.find(b => b.id === editingButtonId)?.text || ''}
            onChange={(e) => updateScene(s => ({
              ...s, buttons: s.buttons.map(b => b.id === editingButtonId ? { ...b, text: e.target.value } : b),
            }))}
            className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:border-primary outline-none text-foreground"
          />
          <select
            value={activeScene.buttons.find(b => b.id === editingButtonId)?.targetSceneId || ''}
            onChange={(e) => updateScene(s => ({
              ...s, buttons: s.buttons.map(b => b.id === editingButtonId ? { ...b, targetSceneId: e.target.value } : b),
            }))}
            className="w-full bg-background border border-border rounded-xl p-3 text-sm outline-none focus:border-primary text-foreground"
          >
            <option value="">Unlinked</option>
            {scenes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Position X</label>
            <input type="range" value={activeScene.buttons.find(b => b.id === editingButtonId)?.x || 50}
              onChange={(e) => updateScene(s => ({ ...s, buttons: s.buttons.map(b => b.id === editingButtonId ? { ...b, x: parseInt(e.target.value) } : b) }))}
              className="w-full accent-primary" />
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Position Y</label>
            <input type="range" value={activeScene.buttons.find(b => b.id === editingButtonId)?.y || 50}
              onChange={(e) => updateScene(s => ({ ...s, buttons: s.buttons.map(b => b.id === editingButtonId ? { ...b, y: parseInt(e.target.value) } : b) }))}
              className="w-full accent-primary" />
          </div>
          <button
            onClick={() => { updateScene(s => ({ ...s, buttons: s.buttons.filter(b => b.id !== editingButtonId) })); onClose(); }}
            className="w-full py-3 bg-destructive/10 text-destructive border border-destructive/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-destructive hover:text-destructive-foreground transition-all"
          >
            Delete Choice
          </button>
        </div>
      ) : editingObjectId ? (
        <div className="space-y-5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Scale</label>
          <input type="range" min="5" max="150"
            value={activeScene.objects.find(o => o.id === editingObjectId)?.scale || 20}
            onChange={(e) => updateScene(s => ({ ...s, objects: s.objects.map(o => o.id === editingObjectId ? { ...o, scale: parseInt(e.target.value) } : o) }))}
            className="w-full accent-primary" />
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Position X</label>
          <input type="range"
            value={activeScene.objects.find(o => o.id === editingObjectId)?.x || 50}
            onChange={(e) => updateScene(s => ({ ...s, objects: s.objects.map(o => o.id === editingObjectId ? { ...o, x: parseInt(e.target.value) } : o) }))}
            className="w-full accent-primary" />
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Position Y</label>
          <input type="range"
            value={activeScene.objects.find(o => o.id === editingObjectId)?.y || 50}
            onChange={(e) => updateScene(s => ({ ...s, objects: s.objects.map(o => o.id === editingObjectId ? { ...o, y: parseInt(e.target.value) } : o) }))}
            className="w-full accent-primary" />
          <button
            onClick={() => { updateScene(s => ({ ...s, objects: s.objects.filter(o => o.id !== editingObjectId) })); onClose(); }}
            className="w-full py-3 bg-destructive/10 text-destructive border border-destructive/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-destructive hover:text-destructive-foreground transition-all"
          >
            Delete Object
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default PropertyPanel;
