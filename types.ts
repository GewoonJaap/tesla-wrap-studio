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

export enum ToolType {
  BRUSH = 'BRUSH',
  ERASER = 'ERASER',
  FILL = 'FILL',
  GRADIENT = 'GRADIENT'
}

export interface DrawingState {
  color: string;
  secondaryColor: string;
  gradientType: 'linear' | 'radial';
  brushSize: number;
  tool: ToolType;
  opacity: number;
}