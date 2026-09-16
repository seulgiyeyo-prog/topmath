export interface NodePosition {
  x: number;
  y: number;
}

export type CourseId = 'home' | 'geometry' | 'diffusion' | 'bone' | 'workbook';

export type MissionKey =
  | 'net'
  | 'path'
  | 'bridge'
  | 'exp'
  | 'calc'
  | 'flatten'
  | 'sir'
  | 'herd'
  | 'fakeNews'
  | 'boneLogistic'
  | 'boneCascade';

export interface GameState {
  xp: number;
  level: number;
  score: number;
  streak: number;
  missions: Partial<Record<MissionKey, boolean>>;
  achievements: string[];
  pathBest: number | null;
}

export interface AchievementItem {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

