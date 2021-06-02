import { CombineResult, CombineResultWithPercentiles } from "../interfaces";

import data from "../assets/data.json";

// Returns the value at a given percentile in a sorted numeric array.
// "Linear interpolation between closest ranks" method
// function percentile(arr: number[], p: number) {
//   if (arr.length === 0) return 0;
//   if (typeof p !== "number") throw new TypeError("p must be a number");
//   if (p <= 0) return arr[0];
//   if (p >= 1) return arr[arr.length - 1];

//   var index = (arr.length - 1) * p,
//     lower = Math.floor(index),
//     upper = lower + 1,
//     weight = index % 1;

//   if (upper >= arr.length) return arr[lower];
//   return arr[lower] * (1 - weight) + arr[upper] * weight;
// }

// Returns the percentile of the given value in a sorted numeric array.
function percentRank(arr: number[], v: number) {
  if (typeof v !== "number") {
    console.log(v);
    throw new TypeError("v must be a number");
  }
  for (var i = 0, l = arr.length; i < l; i++) {
    if (v <= arr[i]) {
      while (i < l && v === arr[i]) i++;
      if (i === 0) return 0;
      if (v !== arr[i - 1]) {
        i += (v - arr[i - 1]) / (arr[i] - arr[i - 1]);
      }
      return i / l;
    }
  }
  return 1;
}

export const combineData: CombineResult[] = data.map((d) => ({
  player: d.Player,
  position: d.Pos,
  height: d.Ht || null,
  weight: d.Wt || null,
  fortyYard: d.Forty || null,
  verticalJump: d.Vertical || null,
  benchReps: d.BenchReps || null,
  broadJump: d.BroadJump || null,
  threeCone: d.Cone || null,
  shuttleRun: d.Shuttle || null,
  year: d.Year,
  team: d.Team,
  av: d.AV,
  round: d.Round,
  pick: d.Pick,
}));

// memoize some calls...
const cache: any = {};

export function combinePercentRank(
  field: keyof CombineResult,
  value?: number,
  position?: string
): number {
  if (value === undefined || value === null) {
    return 0;
  }

  const key = `${field}.${position ? position : "ALL"}`;
  if (!cache[key]) {
    cache[key] = combineData
      .filter((datum) => !position || position === datum.position)
      .map((datum) => datum[field])
      .sort();
  }
  const raw = percentRank(cache[key], value);

  if (["fortyYard", "threeCone", "shuttleRun"].includes(field)) {
    return (1 - raw) * 100;
  }

  return raw * 100;
}

export const percentileData: CombineResult[] = combineData.map((d) => ({
  ...d,
  height: combinePercentRank("height", d.height),
  weight: combinePercentRank("weight", d.weight),
  fortyYard: combinePercentRank("fortyYard", d.fortyYard),
  verticalJump: combinePercentRank("verticalJump", d.verticalJump),
  benchReps: combinePercentRank("benchReps", d.benchReps),
  broadJump: combinePercentRank("broadJump", d.broadJump),
  threeCone: combinePercentRank("threeCone", d.threeCone),
  shuttleRun: combinePercentRank("shuttleRun", d.shuttleRun),
}));

export const positionPercentileData: CombineResult[] = combineData.map((d) => ({
  ...d,
  height: combinePercentRank("height", d.height, d.position),
  weight: combinePercentRank("weight", d.weight, d.position),
  fortyYard: combinePercentRank("fortyYard", d.fortyYard, d.position),
  verticalJump: combinePercentRank("verticalJump", d.verticalJump, d.position),
  benchReps: combinePercentRank("benchReps", d.benchReps, d.position),
  broadJump: combinePercentRank("broadJump", d.broadJump, d.position),
  threeCone: combinePercentRank("threeCone", d.threeCone, d.position),
  shuttleRun: combinePercentRank("shuttleRun", d.shuttleRun, d.position),
}));

export const combinePercentileData: CombineResultWithPercentiles[] =
  combineData.map((d) => ({
    ...d,
    height: {
      raw: d.height,
      percentile: combinePercentRank("height", d.height),
      positionPercentile: combinePercentRank("height", d.height, d.position),
    },
    weight: {
      raw: d.weight,
      percentile: combinePercentRank("weight", d.weight),
      positionPercentile: combinePercentRank("weight", d.weight, d.position),
    },
    fortyYard: {
      raw: d.fortyYard,
      percentile: combinePercentRank("fortyYard", d.fortyYard),
      positionPercentile: combinePercentRank(
        "fortyYard",
        d.fortyYard,
        d.position
      ),
    },
    verticalJump: {
      raw: d.verticalJump,
      percentile: combinePercentRank("verticalJump", d.verticalJump),
      positionPercentile: combinePercentRank(
        "verticalJump",
        d.verticalJump,
        d.position
      ),
    },
    benchReps: {
      raw: d.benchReps,
      percentile: combinePercentRank("benchReps", d.benchReps),
      positionPercentile: combinePercentRank(
        "benchReps",
        d.benchReps,
        d.position
      ),
    },
    broadJump: {
      raw: d.broadJump,
      percentile: combinePercentRank("broadJump", d.broadJump),
      positionPercentile: combinePercentRank(
        "broadJump",
        d.broadJump,
        d.position
      ),
    },
    threeCone: {
      raw: d.threeCone,
      percentile: combinePercentRank("threeCone", d.threeCone),
      positionPercentile: combinePercentRank(
        "threeCone",
        d.threeCone,
        d.position
      ),
    },
    shuttleRun: {
      raw: d.shuttleRun,
      percentile: combinePercentRank("shuttleRun", d.shuttleRun),
      positionPercentile: combinePercentRank(
        "shuttleRun",
        d.shuttleRun,
        d.position
      ),
    },
  }));

export const orderedCombineKeys: (keyof CombineResult)[] = [
  "height",
  "weight",
  "fortyYard",
  "verticalJump",
  "benchReps",
  "broadJump",
  "threeCone",
  "shuttleRun",
];

export const combineKeyToUnit: Record<string, string> = {
  height: '"',
  weight: "lbs",
  fortyYard: "s",
  verticalJump: '"',
  benchReps: " reps",
  broadJump: '"',
  threeCone: "s",
  shuttleRun: "s",
};
