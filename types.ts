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
  FILL = 'FILL'
}

export interface DrawingState {
  color: string;
  brushSize: number;
  tool: ToolType;
  opacity: number;
}