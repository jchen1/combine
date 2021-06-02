import {
  Button,
  Card,
  Checkbox,
  Divider,
  Grid,
  Input,
  Row,
  Select,
  Spacer,
  Text,
} from "@geist-ui/react";
import { Radar } from "react-chartjs-2";
import { useState } from "react";

import Layout from "../components/Layout";
import {
  combinePercentRank,
  // combinePercentileData,
  orderedCombineKeys,
  combineKeyToUnit,
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

function copyShareLink(player: CombineResult): Promise<void> {
  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}`
      : "http://localhost:3000";
  const params = Object.entries(player).reduce(
    (p, [k, v]) => ({ ...p, [k]: `${v}` }),
    {}
  );
  const s = `${baseUrl}?${new URLSearchParams(params).toString()}`;
  return navigator.clipboard.writeText(s);
}

const IndexPage = ({ query }: { query: Record<string, string | string[]> }) => {
  const [copied, setCopied] = useState(false);

  const [compareVsPosition, setCompareVsPosition] = useState(true);

  const [position, setPosition] = useState(
    stringOrFirst(query.position) || "WR"
  );
  const [name, setName] = useState(stringOrFirst(query.name) || "My Player");
  const [height, setHeight] = useState(
    parseInt(stringOrFirst(query.height)) || 73
  );
  const [weight, setWeight] = useState(
    parseInt(stringOrFirst(query.weight)) || 184
  );
  const [fortyYard, setFortyYard] = useState(
    parseFloat(stringOrFirst(query.fortyYard)) || 4.29
  );
  const [verticalJump, setVerticalJump] = useState(
    parseFloat(stringOrFirst(query.verticalJump)) || 38.5
  );
  const [benchReps, setBenchReps] = useState(
    parseInt(stringOrFirst(query.benchReps)) || 17
  );
  const [broadJump, setBroadJump] = useState(
    parseInt(stringOrFirst(query.broadJump)) || 131
  );
  const [threeCone, setThreeCone] = useState(
    parseFloat(stringOrFirst(query.threeCone)) || 6.74
  );
  const [shuttleRun, setShuttleRun] = useState(
    parseFloat(stringOrFirst(query.shuttleRun)) || 4.17
  );

  const player: CombineResult = {
    position,
    player: name,
    height,
    weight,
    fortyYard,
    verticalJump,
    benchReps,
    broadJump,
    threeCone,
    shuttleRun,
  };

  // const allData = compareVsPosition
  //   ? combinePercentileData.filter((datum) => datum.position === position)
  //   : combinePercentileData;

  const playerColor = stringToColor(name);

  const data = {
    labels: [
      "Height",
      "Weight",
      "40yd",
      "Vertical Jump (in)",
      "Bench Press",
      "Broad Jump (in)",
      "Three Cone",
      "Shuttle Run",
    ],
    datasets: [
      {
        label: `${name} (${position})`,
        data: orderedCombineKeys.map((key) =>
          combinePercentRank(
            key,
            player[key] as number | undefined,
            compareVsPosition ? position : ""
          )
        ),
        player,
        backgroundColor: `hsla(${playerColor.h}, ${playerColor.s}%, ${playerColor.l}%, 0.5)`,
        borderColor: `hsla(${playerColor.h}, ${playerColor.s}%, ${playerColor.l}%, 1)`,
        borderWidth: 1,
        pointRadius: 5,
        pointBackgroundColor: `hsla(${playerColor.h}, ${playerColor.s}%, ${playerColor.l}%, 1)`,
      },
    ],
    // todo; comparables
    // .concat(
    //   allData.slice(0, 0).map((datum) => {
    //     const { h, s, l } = stringToColor(datum.player);
    //     const key = compareVsPosition ? "positionPercentile" : "percentile";

    //     return {
    //       label: `${datum.player} (${datum.position})`,
    //       data: [
    //         datum.height[key],
    //         datum.weight[key],
    //         datum.fortyYard[key],
    //         datum.verticalJump[key],
    //         datum.benchReps[key],
    //         datum.broadJump[key],
    //         datum.threeCone[key],
    //         datum.shuttleRun[key],
    //       ],
    //       backgroundColor: `hsla(${h}, ${s}%, ${l}%, 0.2)`,
    //       borderColor: `hsla(${h}, ${s}%, ${l}%, 1)`,
    //       borderWidth: 1,
    //     };
    //   })
    // ),
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
              return `${label}: ${player[key]}${combineKeyToUnit[key]} (${data[
                dataIndex
              ].toFixed(2)}%)`;
            }
          },
        },
      },
    },
  };
  return (
    <Layout title="Combine Comparator">
      <h1>NFL Combine Comparator</h1>
      {/* todo: mobile ordering */}
      <Grid.Container gap={2} justify="center" wrap="wrap">
        <Grid xs={24} md={16}>
          <Card>
            <Row align="middle" justify="end">
              <Text>Compare vs position</Text>
              <Spacer x={1} />
              <Checkbox
                checked={compareVsPosition}
                onChange={(_e) => setCompareVsPosition(!compareVsPosition)}
              />
            </Row>
            <Spacer y={1} />
            <Radar type="radar" data={data} options={options} />
          </Card>
        </Grid>
        <Grid xs={24} md={8}>
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
              onChange={(e) => setHeight(e.target.valueAsNumber)}
              onBlur={(_e) => setHeight(Math.round(height))}
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
              onChange={(e) => setWeight(e.target.valueAsNumber)}
              onBlur={(_e) => setWeight(Math.round(weight))}
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
              onChange={(e) => setFortyYard(e.target.valueAsNumber)}
              onBlur={(_e) => setFortyYard(parseFloat(fortyYard.toFixed(2)))}
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
              onChange={(e) => setVerticalJump(e.target.valueAsNumber)}
              onBlur={(_e) =>
                setVerticalJump(parseFloat(verticalJump.toFixed(1)))
              }
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
              onChange={(e) => setBenchReps(e.target.valueAsNumber)}
              onBlur={(_e) => setBenchReps(Math.round(benchReps))}
            >
              <Text b>225 lb Bench Press</Text>
            </Input>
            <Spacer y={1} />
            <Input
              type="number"
              labelRight={combineKeyToUnit.broadJump.trim()}
              placeholder="131"
              width="100%"
              value={`${broadJump}`}
              onChange={(e) => setBroadJump(e.target.valueAsNumber)}
              onBlur={(_e) => setBroadJump(Math.round(broadJump))}
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
              onChange={(e) => setThreeCone(e.target.valueAsNumber)}
              onBlur={(_e) => setThreeCone(parseFloat(threeCone.toFixed(2)))}
            >
              <Text b>Three Cone</Text>
            </Input>
            <Spacer y={1} />
            <Input
              type="number"
              labelRight={combineKeyToUnit.shuttleRun.trim()}
              placeholder="4.17"
              width="100%"
              step="0.01"
              value={`${shuttleRun}`}
              onChange={(e) => setShuttleRun(e.target.valueAsNumber)}
              onBlur={(_e) => setShuttleRun(parseFloat(shuttleRun.toFixed(2)))}
            >
              <Text b>20yd Shuttle Run</Text>
            </Input>
          </Card>
        </Grid>
        <Grid xs={24} md={24}>
          <Button
            type="success"
            onClick={async (e) => {
              await copyShareLink(player);
              setCopied(true);
              setTimeout(() => setCopied(false), 5000);
            }}
          >
            {copied ? "Copied to clipboard!" : "Share My Stats"}
          </Button>
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
