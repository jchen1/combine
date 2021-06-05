import data from "../assets/data.json";
import percentiles from "../assets/percentiles.json";
import {
  CombineResult,
  CombineResultMetadata,
  CombineStat,
  CombineStats,
  isPosition,
  orderedCombineKeys,
  Position,
} from "../interfaces";
import { mapVals, parseInput } from "../utils/core";

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
export const combinePlayerToResult: Record<string, CombineResult> =
  Object.fromEntries(combineData.map((d) => [d.player, d]));

const cache: Record<string, number[]> = percentiles;

export function combinePercentRank(
  field: CombineStat,
  value?: number,
  position?: Position
): number {
  if (value === undefined || value === null) {
    return 0;
  }

  const key = `${field}.${position ? position : "ALL"}`;
  if (!cache[key]) {
    console.error(`cache miss: ${key}`);
    cache[key] = combineData
      .filter(
        (datum) => datum[field] && (!position || position === datum.position)
      )
      .map((datum) => datum[field])
      .sort((a, b) => a - b);
  }

  const raw = percentRank(cache[key], value);

  if (["fortyYard", "threeCone", "shuttleRun"].includes(field)) {
    return (1 - raw) * 100;
  }

  return raw * 100;
}

type CombineKeyMetadata = {
  unit: string;
  label: string;
  default: number;
  precision?: number;
};

export const combineKeyMetadata: Record<CombineStat, CombineKeyMetadata> = {
  height: {
    unit: '"',
    label: "Height",
    default: 73,
  },
  weight: {
    unit: "lbs",
    label: "Weight",
    default: 184,
  },
  fortyYard: {
    unit: "s",
    label: "40y Dash",
    default: 4.29,
    precision: 2,
  },
  verticalJump: {
    unit: '"',
    label: "Vertical Jump",
    default: 38.5,
    precision: 1,
  },
  benchReps: {
    unit: " reps",
    label: "225lb Bench Press",
    default: 17,
  },
  broadJump: {
    unit: '"',
    label: "Broad Jump",
    default: 131,
  },
  threeCone: {
    unit: "s",
    label: "Three Cone Drill",
    default: 6.74,
    precision: 2,
  },
  shuttleRun: {
    unit: "s",
    label: "20y Shuttle Run",
    default: 4.17,
    precision: 2,
  },
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
    orderedCombineKeys.map((k) => a[k]),
    orderedCombineKeys.map((k) => b[k])
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

const meta: CombineResultMetadata = {
  position: "WR",
  player: "My Player",
};
const stats: CombineStats = mapVals(combineKeyMetadata, (m) => m.default);
export const defaultPlayer: CombineResult = { ...meta, ...stats };

export function parseSlug(slug: string): CombineResult | void {
  const split = slug.split("_");
  if (split.length !== 10) return;

  const [position, player, ...rawStats] = split;

  if (!isPosition(position)) {
    return;
  }

  const meta: CombineResultMetadata = { position, player };

  const stats: CombineStats = mapVals(combineKeyMetadata, (meta, field) => {
    const precision = meta.precision || 0;
    const index = orderedCombineKeys.indexOf(field);
    const val = rawStats[index];

    return parseInput(val, precision);
  });

  return { ...meta, ...stats };
}

export function toSlug(player: CombineResult): string {
  return [player.position, player.player]
    .concat(orderedCombineKeys.map((field) => player[field].toString()))
    .join("_");
}
