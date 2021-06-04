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
  useClipboard,
  useToasts,
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
  const params = {
    position: player.position,
    player: player.player,
    stats: [
      player.height,
      player.weight,
      player.fortyYard,
      player.verticalJump,
      player.benchReps,
      player.broadJump,
      player.threeCone,
      player.shuttleRun,
    ].join("_"),
  };
  return `${baseUrl}?${new URLSearchParams(params).toString()}`;
}

function parseInput(val: string | number, precision = 0): number {
  if (typeof val === "number") {
    return val;
  }

  return parseFloat(parseFloat(val).toFixed(precision));
}

function parseQuery(query: Record<string, string | string[]>): CombineResult {
  const { position, player, stats } = query;
  if (!position || !player || !stats) {
    return {
      position: "WR",
      player: "My Player",
      height: 73,
      weight: 184,
      fortyYard: 4.29,
      verticalJump: 38.5,
      benchReps: 17,
      broadJump: 131,
      threeCone: 6.74,
      shuttleRun: 4.17,
    };
  }

  const [
    height,
    weight,
    fortyYard,
    verticalJump,
    benchReps,
    broadJump,
    threeCone,
    shuttleRun,
  ] = stringOrFirst(stats).split("_");

  return {
    position: stringOrFirst(position),
    player: stringOrFirst(player),
    height: parseInput(height) || 0,
    weight: parseInput(weight) || 0,
    fortyYard: parseInput(fortyYard, 2) || 0,
    verticalJump: parseInput(verticalJump, 1) || 0,
    benchReps: parseInput(benchReps) || 0,
    broadJump: parseInput(broadJump, 1) || 0,
    threeCone: parseInput(threeCone, 2) || 0,
    shuttleRun: parseInput(shuttleRun, 2) || 0,
  };
}

const IndexPage = ({ query }: { query: Record<string, string | string[]> }) => {
  const { copy } = useClipboard();
  const [, setToast] = useToasts();

  const [comparePlayers, setComparePlayers] = useState(true);
  const queryPlayer = parseQuery(query);

  const [position, setPosition] = useState(queryPlayer.position);
  const [name, setName] = useState(queryPlayer.player);
  const [height, setHeight] = useState<string | number>(queryPlayer.height!);
  const [weight, setWeight] = useState<string | number>(queryPlayer.weight!);
  const [fortyYard, setFortyYard] = useState<string | number>(
    queryPlayer.fortyYard!
  );
  const [verticalJump, setVerticalJump] = useState<string | number>(
    queryPlayer.verticalJump!
  );
  const [benchReps, setBenchReps] = useState<string | number>(
    queryPlayer.benchReps!
  );
  const [broadJump, setBroadJump] = useState<string | number>(
    queryPlayer.broadJump!
  );
  const [threeCone, setThreeCone] = useState<string | number>(
    queryPlayer.threeCone!
  );
  const [shuttleRun, setShuttleRun] = useState<string | number>(
    queryPlayer.shuttleRun!
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
    if (
      position &&
      (name ||
        height ||
        weight ||
        fortyYard ||
        verticalJump ||
        benchReps ||
        broadJump ||
        threeCone ||
        shuttleRun)
    )
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
              inputMode="numeric"
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
              inputMode="numeric"
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
              inputMode="decimal"
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
              inputMode="decimal"
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
              inputMode="numeric"
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
              inputMode="numeric"
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
              inputMode="decimal"
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
              inputMode="decimal"
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
                copy(getShareLink(player));
                setToast({ type: "success", text: "Copied to clipboard!" });
              }}
            >
              Share My Stats
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
