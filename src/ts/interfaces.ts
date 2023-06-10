import { TMatch, TMatchLong } from './types.ts';
import { ERound } from './enums.ts';

interface IDict {
  [key: string]: any;
}

interface IDictParticipants {
  data: TMatch[] | TMatchLong[];
  lookup: { [key: string]: number };
  groups: string[][];
}

interface IDictParticipantSets {
  [key: string]: Set<string>;
}

interface IDictGridStatistics {
  home: number;
  draw?: number;
  away: number;
  et?: number;
  p?: number;
}

interface IObjStageGroupResult {
  arrStagesGroup?: ERound[];
  arrStagesKnockout?: ERound[];
}

export type {
  IDict,
  IDictParticipants,
  IDictParticipantSets,
  IDictGridStatistics,
  IObjStageGroupResult,
};
