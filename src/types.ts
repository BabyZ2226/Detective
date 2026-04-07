export type Difficulty = 'fácil' | 'normal' | 'difícil';

export interface Choice {
  text: string;
  nextNode: string;
  requiredClues?: string[];
  requiredFlags?: string[];
  forbiddenFlags?: string[];
  unlockClue?: string;
  setFlag?: string;
}

export interface StoryNode {
  id: string;
  text: string;
  choices: Choice[];
  image?: string;
}

export interface CaseInfo {
  title: string;
  description: string;
  totalClues?: number;
  imageKeyword?: string;
}

export interface HistoryEntry {
  action: string;
  result?: string;
}

export interface GameState {
  currentNodeId: string;
  inventory: string[];
  flags: string[];
  history: HistoryEntry[];
}
