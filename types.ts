export interface CarModel {
  id: string;
  name: string;
  folderName: string;
  examples: string[];
}

export interface Point {
  x: number;
  y: number;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
}

export enum ToolType {
  BRUSH = 'BRUSH',
  ERASER = 'ERASER',
  FILL = 'FILL',
  GRADIENT = 'GRADIENT',
  TRANSFORM = 'TRANSFORM',
  TEXT = 'TEXT',
  RECTANGLE = 'RECTANGLE',
  ELLIPSE = 'ELLIPSE',
  LINE = 'LINE'
}

export interface DrawingState {
  color: string;
  secondaryColor: string;
  gradientType: 'linear' | 'radial';
  brushSize: number;
  tool: ToolType;
  opacity: number;
  // Text Tool State
  fontFamily: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  hasShadow: boolean;
  shadowColor: string;
  shadowBlur: number;
}

export interface EditorHandle {
  clearLayer: () => void;
  getCompositeData: () => string | undefined;
}