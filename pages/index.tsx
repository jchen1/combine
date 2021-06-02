import {
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
  combinePercentileData,
  orderedCombineKeys,
  combineKeyToUnit,
} from "../utils/data";
// import { stringToColor } from "../utils/colors";
import { CombineResult, positions } from "../interfaces";

const IndexPage = () => {
  const [compareVsPosition, setCompareVsPosition] = useState(true);

  const [position, setPosition] = useState("WR");
  const [name, setName] = useState("My Player");
  const [height, setHeight] = useState(73);
  const [weight, setWeight] = useState(184);
  const [fortyYard, setFortyYard] = useState(4.29);
  const [verticalJump, setVerticalJump] = useState(38.5);
  const [benchReps, setBenchReps] = useState(17);
  const [broadJump, setBroadJump] = useState(131);
  const [threeCone, setThreeCone] = useState(6.74);
  const [shuttleRun, setShuttleRun] = useState(4.17);

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
    // todo: custom tooltip that shows the raw value too...
    datasets: [
      {
        label: "",
        data: [0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "hsla(0, 100%, 100%, 0)",
        borderColor: "hsla(0, 100%, 100%, 0)",
        borderWidth: 0,
      },
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
        backgroundColor: "hsla(100, 95%, 80%, 0.5)",
        borderColor: "hsla(100, 95%, 80%, 1)",
        borderWidth: 1,
        pointRadius: 5,
        pointBackgroundColor: "hsla(100, 95%, 50%, 1)",
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
      ticks: { beginAtZero: true, min: 0, max: 100 },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: ({ dataset, dataIndex }: any) => {
            const { label, player } = dataset;
            const key = orderedCombineKeys[dataIndex];
            return `${label}: ${player[key]}${combineKeyToUnit[key]}`;
          },
        },
      },
    },
  };
  return (
    <Layout title="Combine Comparator">
      <h1>Combine Comparator</h1>
      <Grid.Container gap={2} justify="center">
        <Grid xs={24} md={18}>
          <Card>
            <Row align="middle" justify="end">
              <Text>Compare vs position</Text>
              <Spacer x={1} />
              <Checkbox
                checked={compareVsPosition}
                onChange={(e) => setCompareVsPosition(!compareVsPosition)}
              />
            </Row>
            <Spacer y={1} />
            <Radar type="radar" data={data} options={options} />
          </Card>
        </Grid>
        <Grid xs={24} md={6}>
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
      </Grid.Container>
    </Layout>
  );
};

export default IndexPage;
