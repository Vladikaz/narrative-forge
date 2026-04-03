import React, { useState, useRef, useEffect } from 'react';
import {
  ImagePlus, Play, Pause, Plus, Map as MapIcon,
  X, MousePointerClick, MonitorPlay, Music,
  Edit3, Image as ImageIcon, Wand2, Video, FolderOpen,
  ChevronRight,
} from 'lucide-react';
import type { Scene } from '@/components/engine/types';
import EffectRenderer from '@/components/engine/EffectRenderer';
import NarrativeMap from '@/components/engine/NarrativeMap';
import PropertyPanel from '@/components/engine/PropertyPanel';

const IS_PRODUCTION = false;

const Index = () => {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [view, setView] = useState<'menu' | 'game'>('menu');

  const [isLocked] = useState(IS_PRODUCTION);
  const [showMap, setShowMap] = useState(false);
  const [branchParentId, setBranchParentId] = useState<string | null>(null);
  const [appMode, setAppMode] = useState<'edit' | 'play'>(IS_PRODUCTION ? 'play' : 'edit');

  const [editingButtonId, setEditingButtonId] = useState<string | null>(null);
  const [editingObjectId, setEditingObjectId] = useState<string | null>(null);
  const [showEffectMenu, setShowEffectMenu] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const objectInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const activeScene = scenes.find(s => s.id === activeSceneId);
  const firstScene = scenes.filter(s => !s.parentId)[0] || scenes[0];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      if (view === 'game' && activeScene?.audioUrl) {
        audioRef.current.src = activeScene.audioUrl;
        audioRef.current.load();
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
      } else {
        audioRef.current.src = '';
        setIsPlaying(false);
      }
    }
  }, [activeSceneId, activeScene?.audioUrl, view]);

  const exportProject = () => {
    const dataStr = JSON.stringify(scenes);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', 'narrative_project.json');
    link.click();
  };

  const importProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string) as Scene[];
          setScenes(imported);
          if (imported.length > 0) {
            const root = imported.filter(s => !s.parentId)[0] || imported[0];
            setActiveSceneId(root.id);
          }
        } catch (err) {
          console.error('Import failed', err);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    const file = event.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      const mediaUrl = URL.createObjectURL(file);
      const defaultName = branchParentId
        ? `Branch of ${scenes.find(s => s.id === branchParentId)?.name || 'Scene'}`
        : `Scene ${scenes.filter(s => !s.parentId).length + 1}`;

      const newScene: Scene = {
        id: Date.now().toString(),
        name: defaultName,
        mediaUrl,
        mediaType: isVideo ? 'video' : 'image',
        audioUrl: null,
        audioName: null,
        parentId: branchParentId,
        buttons: [],
        objects: [],
        effect: 'none',
      };

      setScenes(prev => [...prev, newScene]);
      if (scenes.length === 0) setActiveSceneId(newScene.id);
    }
    event.target.value = '';
    setBranchParentId(null);
  };

  const handleObjectUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeSceneId) {
      const url = URL.createObjectURL(file);
      const newObj = { id: Date.now().toString(), imageUrl: url, x: 50, y: 50, scale: 20 };
      setScenes(prev => prev.map(s =>
        s.id === activeSceneId ? { ...s, objects: [...s.objects, newObj] } : s
      ));
      setEditingObjectId(newObj.id);
    }
  };

  return (
    <div className="relative w-full h-screen bg-background text-foreground overflow-hidden font-sans select-none">
      <input type="file" accept="image/*,video/*" ref={mediaInputRef} onChange={handleMediaUpload} className="hidden" />
      <input type="file" accept="image/png,image/webp" ref={objectInputRef} onChange={handleObjectUpload} className="hidden" />
      <input type="file" accept="audio/*" ref={audioInputRef} onChange={(e) => {
        const file = e.target.files?.[0];
        if (file && activeSceneId) {
          const url = URL.createObjectURL(file);
          setScenes(prev => prev.map(s => s.id === activeSceneId ? { ...s, audioUrl: url, audioName: file.name } : s));
        }
      }} className="hidden" />
      <input type="file" accept=".json" ref={importInputRef} onChange={importProject} className="hidden" />
      <audio ref={audioRef} loop />

      {/* MAIN MENU */}
      {view === 'menu' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center">
          {firstScene ? (
            <div
              className="absolute inset-0 bg-cover bg-center blur-md opacity-40 scale-105"
              style={{ backgroundImage: `url(${firstScene.mediaUrl})` }}
            />
          ) : (
            <div className="absolute inset-0 bg-card" />
          )}

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-2 flex items-center gap-3">
              <div className="h-[2px] w-12 bg-primary rounded-full" />
              <span className="text-[10px] font-black tracking-[0.5em] text-primary uppercase">Engine v1.0</span>
              <div className="h-[2px] w-12 bg-primary rounded-full" />
            </div>

            <h1 className="text-6xl font-black tracking-tighter mb-12 flex flex-col items-center leading-none">
              <span className="text-muted-foreground text-3xl tracking-[0.2em] mb-2 font-light">PROJECT</span>
              NARRATIVE
            </h1>

            <div className="flex flex-col gap-4 w-64">
              <button
                onClick={() => {
                  if (firstScene) {
                    setActiveSceneId(firstScene.id);
                    setView('game');
                  } else if (!isLocked) {
                    mediaInputRef.current?.click();
                  }
                }}
                className="group flex items-center justify-between bg-foreground text-background px-6 py-4 rounded-2xl font-black text-sm hover:bg-primary hover:text-primary-foreground transition-all shadow-xl"
              >
                {scenes.length > 0 ? 'START ADVENTURE' : 'CREATE NEW PROJECT'}
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </button>

              {scenes.length > 0 && (
                <button
                  onClick={() => setView('game')}
                  className="flex items-center gap-3 bg-card/80 backdrop-blur-md border border-foreground/10 px-6 py-4 rounded-2xl font-bold text-sm hover:bg-secondary transition-all text-secondary-foreground"
                >
                  <MonitorPlay size={18} /> CONTINUE
                </button>
              )}

              <button
                onClick={() => importInputRef.current?.click()}
                className="flex items-center gap-3 bg-card/80 backdrop-blur-md border border-foreground/10 px-6 py-4 rounded-2xl font-bold text-sm hover:bg-secondary transition-all text-secondary-foreground"
              >
                <FolderOpen size={18} /> LOAD PROJECT
              </button>

              {!isLocked && (
                <button
                  onClick={() => { setAppMode('edit'); setView('game'); }}
                  className="flex items-center gap-3 bg-card/80 backdrop-blur-md border border-foreground/10 px-6 py-4 rounded-2xl font-bold text-sm hover:bg-secondary transition-all text-secondary-foreground"
                >
                  <Edit3 size={18} /> OPEN EDITOR
                </button>
              )}
            </div>

            <div className="absolute bottom-[-15vh] text-[10px] text-muted-foreground font-bold tracking-widest uppercase">
              Labyrinthine Narrative Engine
            </div>
          </div>
        </div>
      )}

      {/* GAME VIEW */}
      {view === 'game' && (
        <>
          {activeScene ? (
            activeScene.mediaType === 'video' ? (
              <video key={activeScene.id} src={activeScene.mediaUrl} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-cover bg-center transition-opacity duration-700" style={{ backgroundImage: `url(${activeScene.mediaUrl})` }} />
            )
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <ImagePlus size={64} className="mb-4 opacity-20" />
              <h2 className="text-xl font-light tracking-widest uppercase">No Active Scene</h2>
              <button onClick={() => setView('menu')} className="mt-6 px-8 py-3 bg-foreground text-background rounded-full font-bold">Back to Menu</button>
            </div>
          )}

          {activeScene && <EffectRenderer effect={activeScene.effect} />}
          <div className="absolute inset-0 bg-engine-overlay/20 pointer-events-none" />

          {/* Objects */}
          {activeScene?.objects.map(obj => (
            <div
              key={obj.id}
              onClick={(e) => { e.stopPropagation(); if (appMode === 'edit') { setEditingButtonId(null); setEditingObjectId(obj.id); } }}
              style={{
                left: `${obj.x}%`, top: `${obj.y}%`,
                width: `${obj.scale}vw`, transform: 'translate(-50%, -50%)',
                backgroundImage: `url(${obj.imageUrl})`,
              }}
              className={`absolute bg-contain bg-center bg-no-repeat aspect-square transition-all duration-300 z-10 ${
                appMode === 'edit' && editingObjectId === obj.id
                  ? 'ring-2 ring-primary scale-105 cursor-move'
                  : appMode === 'edit'
                    ? 'hover:ring-2 hover:ring-foreground/50 cursor-pointer'
                    : 'pointer-events-none'
              }`}
            />
          ))}

          {/* Choice Buttons */}
          {activeScene?.buttons.map(btn => (
            <button
              key={btn.id}
              onClick={(e) => {
                e.stopPropagation();
                if (appMode === 'edit') {
                  setEditingObjectId(null);
                  setEditingButtonId(btn.id);
                } else if (appMode === 'play' && btn.targetSceneId) {
                  setActiveSceneId(btn.targetSceneId);
                }
              }}
              style={{ left: `${btn.x}%`, top: `${btn.y}%`, transform: 'translate(-50%, -50%)' }}
              className={`absolute px-8 py-4 rounded-full font-bold shadow-2xl backdrop-blur-xl border-2 transition-all duration-300 z-20 ${
                appMode === 'edit' && editingButtonId === btn.id
                  ? 'bg-foreground text-background border-primary scale-110'
                  : 'bg-engine-overlay/40 text-foreground border-foreground/20 hover:bg-foreground hover:text-background hover:border-transparent'
              }`}
            >
              {btn.text}
            </button>
          ))}

          {/* Header Controls */}
          <div className="absolute top-6 right-6 flex items-center gap-3 z-30">
            <button onClick={() => setView('menu')} className="bg-engine-overlay/60 backdrop-blur-md p-2.5 rounded-full border border-foreground/10 hover:bg-foreground/10 transition-all text-secondary-foreground" title="Exit to Menu">
              <X size={18} />
            </button>
            <button onClick={() => setShowMap(true)} className="flex items-center gap-2 bg-engine-overlay/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-foreground/10 hover:bg-foreground/10 transition-all text-secondary-foreground">
              <MapIcon size={18} /><span className="text-sm font-medium">Map</span>
            </button>

            {!isLocked && (
              <div className="flex bg-engine-overlay/60 backdrop-blur-md rounded-full border border-foreground/10 p-1">
                <button
                  onClick={() => { setAppMode('edit'); setEditingButtonId(null); setEditingObjectId(null); }}
                  className={`px-5 py-1.5 rounded-full text-xs font-black transition-all ${appMode === 'edit' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  EDIT
                </button>
                <button
                  onClick={() => { setAppMode('play'); setEditingButtonId(null); setEditingObjectId(null); setShowEffectMenu(false); }}
                  className={`px-5 py-1.5 rounded-full text-xs font-black transition-all ${appMode === 'play' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  PLAY
                </button>
              </div>
            )}

            {appMode === 'edit' && activeScene && !isLocked && (
              <div className="flex bg-engine-overlay/60 backdrop-blur-md rounded-full border border-foreground/10 p-1 gap-1">
                <button
                  onClick={() => {
                    const id = Date.now().toString();
                    setScenes(prev => prev.map(s =>
                      s.id === activeSceneId
                        ? { ...s, buttons: [...s.buttons, { id, text: 'New Choice', targetSceneId: '', x: 50, y: 50 }] }
                        : s
                    ));
                    setEditingButtonId(id);
                    setEditingObjectId(null);
                  }}
                  className="p-2 text-engine-success hover:bg-foreground/10 rounded-full"
                  title="Add Choice"
                >
                  <MousePointerClick size={20} />
                </button>
                <button onClick={() => objectInputRef.current?.click()} className="p-2 text-primary hover:bg-foreground/10 rounded-full" title="Add Layer Object">
                  <ImageIcon size={20} />
                </button>
                <button onClick={() => setShowEffectMenu(!showEffectMenu)} className="p-2 text-accent hover:bg-foreground/10 rounded-full" title="Atmosphere">
                  <Wand2 size={20} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Effect Menu */}
      {showEffectMenu && activeScene && !isLocked && (
        <div className="absolute right-6 top-24 w-48 bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-2 shadow-2xl z-40">
          {['none', 'rain', 'fog', 'dust', 'grain'].map(effect => (
            <button
              key={effect}
              onClick={() => {
                setScenes(prev => prev.map(s => s.id === activeSceneId ? { ...s, effect } : s));
                setShowEffectMenu(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm capitalize transition-all ${
                activeScene.effect === effect
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-foreground/10 hover:text-foreground'
              }`}
            >
              {effect}
            </button>
          ))}
        </div>
      )}

      {/* Narrative Map */}
      {showMap && (
        <NarrativeMap
          scenes={scenes}
          activeSceneId={activeSceneId}
          isLocked={isLocked}
          onClose={() => setShowMap(false)}
          onSelectScene={(id) => { setActiveSceneId(id); setShowMap(false); setView('game'); }}
          onBranch={(id) => { setBranchParentId(id); mediaInputRef.current?.click(); }}
          onDeleteScene={(id) => setScenes(prev => prev.filter(s => s.id !== id))}
          onExport={exportProject}
          onImport={() => importInputRef.current?.click()}
        />
      )}

      {/* Scene Thumbnail Drawer */}
      {!showMap && appMode === 'edit' && !isLocked && view === 'game' && (
        <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-background via-background/80 to-transparent z-30">
          <div className="flex items-end gap-5 overflow-x-auto pb-4 max-w-6xl mx-auto custom-scrollbar">
            <button
              onClick={() => { setBranchParentId(null); mediaInputRef.current?.click(); }}
              className="shrink-0 w-40 h-24 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center hover:border-foreground hover:bg-foreground/5 transition-all group"
            >
              <Plus size={24} className="text-muted-foreground group-hover:text-foreground" />
              <span className="text-[10px] mt-2 text-muted-foreground font-black uppercase tracking-widest">New Scene</span>
            </button>
            {scenes.map(scene => (
              <div
                key={scene.id}
                onClick={() => setActiveSceneId(scene.id)}
                className={`relative shrink-0 w-40 h-24 rounded-2xl cursor-pointer overflow-hidden transition-all duration-300 border-2 ${
                  activeSceneId === scene.id
                    ? 'border-foreground scale-105 shadow-2xl z-10'
                    : 'border-transparent opacity-40 hover:opacity-100 hover:scale-105'
                }`}
              >
                {scene.mediaType === 'video' ? (
                  <div className="absolute inset-0 bg-secondary flex items-center justify-center"><Video size={24} className="text-muted-foreground" /></div>
                ) : (
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${scene.mediaUrl})` }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent flex items-end p-3">
                  <span className="text-[10px] font-bold truncate w-full tracking-wider uppercase opacity-80">{scene.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Property Panel */}
      {appMode === 'edit' && (editingButtonId || editingObjectId) && activeScene && !isLocked && view === 'game' && (
        <PropertyPanel
          activeScene={activeScene}
          editingButtonId={editingButtonId}
          editingObjectId={editingObjectId}
          scenes={scenes}
          onUpdateScenes={setScenes}
          onClose={() => { setEditingButtonId(null); setEditingObjectId(null); }}
        />
      )}
    </div>
  );
};

export default Index;
