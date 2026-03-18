export interface ScaleOption {
  value: number;
  label: string;
}

export interface ScaleQuestion {
  id: number;
  text: string;
  reverse?: boolean;
  weight?: number;
}

export interface ScaleDefinition {
  id: string;
  name: string;
  shortName: string;
  description: string;
  questions: ScaleQuestion[];
  options: ScaleOption[];
  reverseOptions?: ScaleOption[];
  getScoreInterpretation: (score: number, answers?: Record<number, number>) => {
    level: string;
    description: string;
    color: string;
  };
  aiPromptContext: string;
  skillContext?: string;
}
