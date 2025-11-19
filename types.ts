export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface DetectedObject {
  id: number;
  label: string;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
}

export interface AnalysisResult {
  count: number;
  items: DetectedObject[];
  estimatedSizeCategory: string;
}

export enum AppState {
  CAMERA = 'CAMERA',
  PREVIEW = 'PREVIEW',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  ERROR = 'ERROR',
}

export enum AnalysisMode {
  CM_SCALE = '2-3cm',
  MM_SCALE = '<1cm (Micro)',
}
