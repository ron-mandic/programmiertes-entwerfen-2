import { TMatch, TMatchLong } from './types.ts';

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

export type { IDict, IDictParticipants, IDictParticipantSets };
