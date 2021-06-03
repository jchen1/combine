import { CombineResult } from "../interfaces";

import data from "../assets/data.json";
import percentiles from "../assets/percentiles.json";

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

export const combineData: CombineResult[] = data;
const cache: Record<string, number[]> = percentiles;

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
      .filter(
        (datum) => datum[field] && (!position || position === datum.position)
      )
      .map((datum) => datum[field] as number)
      .sort((a, b) => a - b);
  }

  const raw = percentRank(cache[key], value);

  if (["fortyYard", "threeCone", "shuttleRun"].includes(field)) {
    return (1 - raw) * 100;
  }

  return raw * 100;
}

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

function cosineSim(a: number[], b: number[]) {
  let dp = 0,
    mA = 0,
    mB = 0;
  for (let i = 0; i < a.length; i++) {
    dp += a[i] * b[i];
    mA += a[i] * a[i];
    mB += b[i] * b[i];
  }
  return dp / (Math.sqrt(mA) * Math.sqrt(mB));
}

function playerSimilarity(a: CombineResult, b: CombineResult) {
  return cosineSim(
    orderedCombineKeys.map((k) => a[k] as number),
    orderedCombineKeys.map((k) => b[k] as number)
  );
}

export function mostSimilarPlayers(player: CombineResult) {
  return combineData
    .filter((p) => p.position === player.position)
    .map((comparator) => ({
      ...comparator,
      sim: playerSimilarity(comparator, player),
    }))
    .sort((a, b) => b.sim - a.sim)
    .slice(0, 10);
}
