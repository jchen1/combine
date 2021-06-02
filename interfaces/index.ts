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
];

export type Position = typeof positions[number];

export type RawPercentileTuple = {
  raw?: number;
  percentile?: number;
  positionPercentile?: number;
};

export type CombineResult = {
  player: string;
  position: string;
  height?: number;
  weight?: number;
  fortyYard?: number;
  verticalJump?: number;
  benchReps?: number;
  broadJump?: number;
  threeCone?: number;
  shuttleRun?: number;
  year?: number;
  team?: string;
  av?: number;
  round?: number;
  pick?: number;
};

export type CombineResultWithPercentiles = {
  player: string;
  position: string;
  height: RawPercentileTuple;
  weight: RawPercentileTuple;
  fortyYard?: RawPercentileTuple;
  verticalJump?: RawPercentileTuple;
  benchReps?: RawPercentileTuple;
  broadJump?: RawPercentileTuple;
  threeCone?: RawPercentileTuple;
  shuttleRun?: RawPercentileTuple;
  year: number;
  team: string;
  av: number;
  round: number;
  pick: number;
};
