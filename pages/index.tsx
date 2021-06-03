import {
  Button,
  Card,
  Divider,
  Grid,
  Input,
  Row,
  Select,
  Spacer,
  Text,
  Toggle,
} from "@geist-ui/react";
import { Radar } from "react-chartjs-2";
import { useEffect, useState } from "react";

import Layout from "../components/Layout";
import {
  combinePercentRank,
  // combinePercentileData,
  orderedCombineKeys,
  combineKeyToUnit,
  mostSimilarPlayers,
} from "../utils/data";
import { stringToColor } from "../utils/colors";
import { CombineResult, positions } from "../interfaces";
import { GetServerSideProps } from "next";

function stringOrFirst(s: string | string[]): string {
  if (typeof s === "string") {
    return s;
  }
  return (s && s.length > 0 && s[0]) || "";
}

function getShareLink(player: CombineResult) {
  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}`
      : "http://localhost:3000";
  const params = Object.entries(player).reduce(
    (p, [k, v]) => ({ ...p, [k]: `${v}` }),
    {}
  );
  return `${baseUrl}?${new URLSearchParams(params).toString()}`;
}

function copyShareLink(player: CombineResult): Promise<void> {
  return navigator.clipboard.writeText(getShareLink(player));
}

function isNilOrDefault(x: any, d: any) {
  return x === null || x === undefined ? d : x;
}

function parseInput(val: string, precision = 0): number {
  return parseFloat(parseFloat(val).toFixed(precision));
}

const IndexPage = ({ query }: { query: Record<string, string | string[]> }) => {
  const [copied, setCopied] = useState(false);

  const [comparePlayers, setComparePlayers] = useState(true);

  const [position, setPosition] = useState(
    stringOrFirst(query.position) || "WR"
  );
  const [name, setName] = useState(stringOrFirst(query.player) || "My Player");
  const [height, setHeight] = useState(
    isNilOrDefault(parseInt(stringOrFirst(query.height)), 73)
  );
  const [weight, setWeight] = useState(
    isNilOrDefault(parseInt(stringOrFirst(query.weight)), 184)
  );
  const [fortyYard, setFortyYard] = useState(
    isNilOrDefault(parseFloat(stringOrFirst(query.fortyYard)), 4.29)
  );
  const [verticalJump, setVerticalJump] = useState(
    isNilOrDefault(parseFloat(stringOrFirst(query.verticalJump)), 38.5)
  );
  const [benchReps, setBenchReps] = useState(
    isNilOrDefault(parseInt(stringOrFirst(query.benchReps)), 17)
  );
  const [broadJump, setBroadJump] = useState(
    isNilOrDefault(parseInt(stringOrFirst(query.broadJump)), 131)
  );
  const [threeCone, setThreeCone] = useState(
    isNilOrDefault(parseFloat(stringOrFirst(query.threeCone)), 6.74)
  );
  const [shuttleRun, setShuttleRun] = useState(
    isNilOrDefault(parseFloat(stringOrFirst(query.shuttleRun)), 4.17)
  );

  const player: CombineResult = {
    position,
    player: name,
    height: parseInput(height),
    weight: parseInput(weight),
    fortyYard: parseInput(fortyYard, 2),
    verticalJump: parseInput(verticalJump, 1),
    benchReps: parseInput(benchReps),
    broadJump: parseInput(broadJump, 1),
    threeCone: parseInput(threeCone, 2),
    shuttleRun: parseInput(shuttleRun, 2),
  };

  useEffect(() => {
    history.replaceState(null, "", getShareLink(player));
  }, [
    position,
    name,
    height,
    weight,
    fortyYard,
    verticalJump,
    benchReps,
    broadJump,
    threeCone,
    shuttleRun,
  ]);

  const playerColor = stringToColor(name);

  const data = {
    labels: [
      height && "Height",
      weight && "Weight",
      fortyYard && "40y Dash",
      verticalJump && "Vertical Jump",
      benchReps && "Bench Press",
      broadJump && "Broad Jump",
      threeCone && "Three Cone Drill",
      shuttleRun && "20y Shuttle Run",
    ].filter((x) => x),
    datasets: [
      {
        label: `${name} (${position})`,
        data: orderedCombineKeys
          .filter((key) => player[key])
          .map(
            (key) =>
              player[key] &&
              combinePercentRank(
                key,
                player[key] as number | undefined,
                position
              )
          ),
        player,
        backgroundColor: `hsla(${playerColor.h}, ${playerColor.s}%, ${playerColor.l}%, 0.5)`,
        borderColor: `hsla(${playerColor.h}, ${playerColor.s}%, ${playerColor.l}%, 1)`,
        borderWidth: 1,
        pointRadius: 5,
        pointBackgroundColor: `hsla(${playerColor.h}, ${playerColor.s}%, ${playerColor.l}%, 1)`,
      },
    ].concat(
      comparePlayers
        ? mostSimilarPlayers(player)
            .slice(0, 3)
            .map((datum) => {
              const { h, s, l } = stringToColor(datum.player);

              return {
                label: `${datum.player} (${datum.position})`,
                data: orderedCombineKeys
                  .map(
                    (key) =>
                      player[key] &&
                      (combinePercentRank(
                        key,
                        datum[key] as number | undefined,
                        position
                      ) ||
                        0)
                  )
                  .filter((x) => x),
                player: datum,
                backgroundColor: `hsla(${h}, ${s}%, ${l}%, 0.2)`,
                borderColor: `hsla(${h}, ${s}%, ${l}%, 1)`,
                borderWidth: 1,
                pointRadius: 5,
                pointBackgroundColor: `hsla(${h}, ${s}%, ${l}%, 1)`,
              };
            })
        : []
    ),
  };

  const options = {
    scale: {
      min: 0,
      max: 100,
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: ({ dataset, dataIndex }: any) => {
            const { label, player, data } = dataset;
            const key = orderedCombineKeys[dataIndex];
            if (player) {
              return `${label}: ${player[key] || 0}${
                combineKeyToUnit[key]
              } (${data[dataIndex].toFixed(2)}%)`;
            }
          },
        },
      },
    },
  };
  return (
    <Layout title="NFL Combine Comparator">
      <Text h1>NFL Combine Comparator</Text>
      <Text>Test how you stack up compared to NFL players!</Text>
      <Spacer y={1} />
      <Grid.Container gap={2} justify="center" wrap="wrap" id="main">
        <Grid xs={24} md={16} id="chart">
          <Card>
            <Row align="middle" justify="center">
              <Toggle
                checked={comparePlayers}
                size="large"
                onChange={(_e) => setComparePlayers(!comparePlayers)}
              />
              <Spacer x={0.5} />
              <Text>Show comparable players</Text>
            </Row>
            <Radar type="radar" data={data} options={options} />
          </Card>
        </Grid>
        <Grid xs={24} md={8} id="input">
          <Card>
            <Text h3>Player Stats</Text>
            <Divider />
            <Input
              placeholder="My Player"
              width="100%"
              value={name}
              onChange={(e) => setName(e.target.value)}
            >
              <Text b>Name</Text>
            </Input>
            <Spacer y={1} />
            <Text b style={{ marginBottom: "8pt", display: "block" }}>
              Position
            </Text>
            <Select
              placeholder="Position"
              width="100%"
              value={position}
              onChange={(v) => setPosition(`${v}`)}
            >
              {positions.map((p) => (
                <Select.Option value={p} key={p}>
                  {p}
                </Select.Option>
              ))}
            </Select>
            <Spacer y={1} />
            <Input
              type="number"
              labelRight={combineKeyToUnit.height.trim()}
              placeholder="73"
              width="100%"
              value={`${height}`}
              onChange={(e) => setHeight(e.target.value)}
              onBlur={(_e) => setHeight(parseInput(height))}
            >
              <Text b>Height</Text>
            </Input>
            <Spacer y={1} />
            <Input
              type="number"
              labelRight={combineKeyToUnit.weight.trim()}
              placeholder="184"
              width="100%"
              value={`${weight}`}
              onChange={(e) => setWeight(e.target.value)}
              onBlur={(_e) => setWeight(parseInput(weight))}
            >
              <Text b>Weight</Text>
            </Input>
            <Spacer y={1} />
            <Input
              type="number"
              labelRight={combineKeyToUnit.fortyYard.trim()}
              placeholder="4.29"
              width="100%"
              step="0.01"
              value={`${fortyYard}`}
              onChange={(e) => setFortyYard(e.target.value)}
              onBlur={(_e) => setFortyYard(parseInput(fortyYard, 2))}
            >
              <Text b>40 Yard Dash</Text>
            </Input>
            <Spacer y={1} />
            <Input
              type="number"
              labelRight={combineKeyToUnit.verticalJump.trim()}
              placeholder="38.5"
              width="100%"
              step="0.1"
              value={`${verticalJump}`}
              onChange={(e) => setVerticalJump(e.target.value)}
              onBlur={(_e) => setVerticalJump(parseInput(verticalJump, 1))}
            >
              <Text b>Vertical Jump</Text>
            </Input>
            <Spacer y={1} />
            <Input
              type="number"
              labelRight={combineKeyToUnit.benchReps.trim()}
              placeholder="17"
              width="100%"
              value={`${benchReps}`}
              onChange={(e) => setBenchReps(e.target.value)}
              onBlur={(_e) => setBenchReps(parseInput(benchReps))}
            >
              <Text b>225lb Bench Press</Text>
            </Input>
            <Spacer y={1} />
            <Input
              type="number"
              labelRight={combineKeyToUnit.broadJump.trim()}
              placeholder="131"
              width="100%"
              value={`${broadJump}`}
              onChange={(e) => setBroadJump(e.target.value)}
              onBlur={(_e) => setBroadJump(parseInput(broadJump))}
            >
              <Text b>Broad Jump</Text>
            </Input>
            <Spacer y={1} />
            <Input
              type="number"
              labelRight={combineKeyToUnit.threeCone.trim()}
              placeholder="6.74"
              width="100%"
              step="0.01"
              value={`${threeCone}`}
              onChange={(e) => setThreeCone(e.target.value)}
              onBlur={(_e) => setThreeCone(parseInput(threeCone, 2))}
            >
              <Text b>Three Cone Drill</Text>
            </Input>
            <Spacer y={1} />
            <Input
              type="number"
              labelRight={combineKeyToUnit.shuttleRun.trim()}
              placeholder="4.17"
              width="100%"
              step="0.01"
              value={`${shuttleRun}`}
              onChange={(e) => setShuttleRun(e.target.value)}
              onBlur={(_e) => setShuttleRun(parseInput(shuttleRun, 2))}
            >
              <Text b>20yd Shuttle Run</Text>
            </Input>
          </Card>
        </Grid>
        <Grid xs={24} md={24} id="share">
          <Row style={{ width: "100%" }}>
            <Button
              style={{ width: "100%" }}
              type="success"
              onClick={async (_e) => {
                await copyShareLink(player);
                setCopied(true);
                setTimeout(() => setCopied(false), 5000);
              }}
            >
              {copied ? "Copied to clipboard!" : "Share My Stats"}
            </Button>
          </Row>
        </Grid>
      </Grid.Container>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: { query: context.query },
  };
};

export default IndexPage;
