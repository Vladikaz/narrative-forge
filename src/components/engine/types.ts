export interface SceneButton {
  id: string;
  text: string;
  targetSceneId: string;
  x: number;
  y: number;
}

export interface SceneObject {
  id: string;
  imageUrl: string;
  x: number;
  y: number;
  scale: number;
}

export interface Scene {
  id: string;
  name: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  audioUrl: string | null;
  audioName: string | null;
  parentId: string | null;
  buttons: SceneButton[];
  objects: SceneObject[];
  effect: string;
}
