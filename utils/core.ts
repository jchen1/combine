export function parseInput(val: string | number, precision = 0): number {
  if (typeof val === "number") {
    return val;
  }

  const ret = parseFloat(parseFloat(val).toFixed(precision));
  return ret === NaN ? 0 : ret;
}

export function mapVals<Value, MappedValue, Key extends string>(
  map: Record<Key, Value>,
  f: (_v: Value, _k: Key) => MappedValue
): Record<Key, MappedValue> {
  const entries = Object.entries(map) as [Key, Value][];
  const newEntries = entries.map(([k, v]) => [k, f(v, k)]);
  return Object.fromEntries(newEntries);
}

export function stringOrFirst(s: string | string[]): string {
  if (typeof s === "string") {
    return s;
  }
  return (s && s.length > 0 && s[0]) || "";
}

type StringToColorOpts = {
  hue?: [number, number];
  sat?: [number, number];
  lit?: [number, number];
};

export function stringToColor(str: string, opts?: StringToColorOpts) {
  opts = opts || {};
  opts.hue = opts.hue || [0, 360];
  opts.sat = opts.sat || [75, 100];
  opts.lit = opts.lit || [40, 60];

  const range = function (hash: number, min: number, max: number) {
    var diff = max - min;
    var x = ((hash % diff) + diff) % diff;
    return x + min;
  };

  let hash = 0;
  if (str.length === 0) return { h: 0, s: 0, l: 0 };
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }

  const h = range(hash, opts.hue[0], opts.hue[1]);
  const s = range(hash, opts.sat[0], opts.sat[1]);
  const l = range(hash, opts.lit[0], opts.lit[1]);

  return { h, s, l };
}
