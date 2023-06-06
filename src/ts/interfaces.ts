import { TMatch, TMatchLong } from './types.ts';

interface IDictParticipants {
  data: TMatch[] | TMatchLong[];
  lookup: { [key: string]: number };
  groups: string[][];
}

interface IDictParticipantSets {
  [key: string]: Set<string>;
}

export type { IDictParticipants, IDictParticipantSets };
