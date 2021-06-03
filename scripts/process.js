const data = require("../assets/raw.json");

const fs = require("fs");

function percentRank(arr, v) {
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

const cache = {};

function combinePercentRank(field, value, position) {
  if (value === undefined || value === null) {
    return 0;
  }

  const key = `${field}.${position ? position : "ALL"}`;
  if (!cache[key]) {
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

const combineData = data.map((d) => ({
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

const percentileData = combineData.map((d) => ({
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

const positionPercentileData = combineData.map((d) => ({
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

const combinePercentileData = combineData.map((d) => ({
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

fs.writeFileSync("../assets/data.json", JSON.stringify(combineData));
fs.writeFileSync("../assets/percentiles.json", JSON.stringify(cache));
