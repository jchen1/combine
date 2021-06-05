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
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Radar } from "react-chartjs-2";
import Layout from "../components/Layout";
import {
  CombineResult,
  CombineStat,
  isPosition,
  orderedCombineKeys,
  positions,
} from "../interfaces";
import { parseInput, stringOrFirst, stringToColor } from "../utils/core";
import {
  combineKeyMetadata,
  combinePercentRank,
  mostSimilarPlayers,
  toSlug,
} from "../utils/data";

function getShareLink(player: CombineResult) {
  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}`
      : "http://localhost:3000";

  return `${baseUrl}/${toSlug(player)}`;
}

function playerToGraphData(
  player: CombineResult,
  availableKeys: CombineStat[]
) {
  const { h, s, l } = stringToColor(player.player);

  return {
    label: `${player.player} (${player.position})`,
    data: orderedCombineKeys
      .map(
        (key) =>
          availableKeys.includes(key) &&
          (combinePercentRank(key, player[key], player.position) || 0)
      )
      .filter((x) => x),
    player,
    backgroundColor: `hsla(${h}, ${s}%, ${l}%, 0.2)`,
    borderColor: `hsla(${h}, ${s}%, ${l}%, 1)`,
    borderWidth: 1,
    pointRadius: 5,
    pointBackgroundColor: `hsla(${h}, ${s}%, ${l}%, 1)`,
  };
}

type NumericInputProps = {
  field: CombineStat;
  value: string | number;
  setValue: Dispatch<SetStateAction<string | number>>;
};

const NumericInput = ({ field, value, setValue }: NumericInputProps) => {
  const precision = combineKeyMetadata[field].precision || 0;

  const step = precision > 0 ? `0.${"0".repeat(precision - 1)}1` : "1";
  const inputMode = precision > 0 ? "decimal" : "numeric";

  return (
    <Input
      type="number"
      labelRight={combineKeyMetadata[field].unit.trim()}
      value={value.toString()}
      inputMode={inputMode}
      width="100%"
      placeholder={combineKeyMetadata[field].default.toString()}
      onChange={(e) => setValue(e.target.value)}
      onBlur={(_e) => setValue(parseInput(value, precision))}
      step={step}
    >
      <Text b>{combineKeyMetadata[field].label}</Text>
    </Input>
  );
};
const Main = ({ initialPlayer }: { initialPlayer: CombineResult }) => {
  const { copy } = useClipboard();
  const [, setToast] = useToasts();

  const [comparePlayers, setComparePlayers] = useState(true);

  const [position, setPosition] = useState(initialPlayer.position);
  const [name, setName] = useState(initialPlayer.player);
  const [height, setHeight] = useState<string | number>(initialPlayer.height!);
  const [weight, setWeight] = useState<string | number>(initialPlayer.weight!);
  const [fortyYard, setFortyYard] = useState<string | number>(
    initialPlayer.fortyYard!
  );
  const [verticalJump, setVerticalJump] = useState<string | number>(
    initialPlayer.verticalJump!
  );
  const [benchReps, setBenchReps] = useState<string | number>(
    initialPlayer.benchReps!
  );
  const [broadJump, setBroadJump] = useState<string | number>(
    initialPlayer.broadJump!
  );
  const [threeCone, setThreeCone] = useState<string | number>(
    initialPlayer.threeCone!
  );
  const [shuttleRun, setShuttleRun] = useState<string | number>(
    initialPlayer.shuttleRun!
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

  const actions: Record<
    CombineStat,
    Dispatch<SetStateAction<string | number>>
  > = {
    height: setHeight,
    weight: setWeight,
    fortyYard: setFortyYard,
    verticalJump: setVerticalJump,
    benchReps: setBenchReps,
    broadJump: setBroadJump,
    threeCone: setThreeCone,
    shuttleRun: setShuttleRun,
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

  const availableKeys = orderedCombineKeys.filter((k) => player[k]);

  const data = {
    labels: availableKeys.map((k) => combineKeyMetadata[k].label),
    datasets: [playerToGraphData(player, availableKeys)].concat(
      comparePlayers
        ? mostSimilarPlayers(player)
            .slice(0, 3)
            .map((p) => playerToGraphData(p, availableKeys))
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
                combineKeyMetadata[key].unit
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
              // anything but an underscore, which is used for slug parsing
              pattern="[^_]*"
              onChange={(e) => setName(e.target.value.replace("_", ""))}
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
              onChange={(v) => {
                const pos = stringOrFirst(v);
                setPosition(isPosition(pos) ? pos : "WR");
              }}
            >
              {positions.map((p) => (
                <Select.Option value={p} key={p}>
                  {p}
                </Select.Option>
              ))}
            </Select>
            {orderedCombineKeys.map((field) => (
              <React.Fragment key={field}>
                <Spacer y={1} />
                <NumericInput
                  field={field}
                  value={player[field]!}
                  setValue={actions[field]!}
                />
              </React.Fragment>
            ))}
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

export default Main;
