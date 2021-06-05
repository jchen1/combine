export const positions = [
  "C",
  "CB",
  "DB",
  "DE",
  "DT",
  "EDGE",
  "FB",
  "FS",
  "G",
  "ILB",
  "K",
  "LB",
  "LS",
  "NT",
  "OG",
  "OL",
  "OLB",
  "OT",
  "P",
  "QB",
  "RB",
  "S",
  "SS",
  "TE",
  "WR",
] as const;

export type Position = typeof positions[number];

export function isPosition(s: string): s is Position {
  return positions.find((x) => x === s) !== undefined;
}

export const orderedCombineKeys = [
  "height",
  "weight",
  "fortyYard",
  "verticalJump",
  "benchReps",
  "broadJump",
  "threeCone",
  "shuttleRun",
] as const;

export type CombineStat = typeof orderedCombineKeys[number];

export type CombineResultMetadata = {
  player: string;
  position: Position;
  year?: number;
  team?: number;
  av?: number;
  round?: number;
  pick?: number;
};

export type CombineStats = Record<CombineStat, number>;

export type CombineResult = CombineResultMetadata & CombineStats;
