import Main from "../components/Main";
import { defaultPlayer } from "../utils/data";
import { stringOrFirst, parseInput } from "../utils/core";

import { useRouter } from "next/router";
import { useState } from "react";
import { CombineResult, isPosition } from "../interfaces";

// maintain legacy query string rendering
function parseQuery(
  query: Record<string, string | string[]>
): CombineResult | void {
  const { position, player, stats } = query;
  if (!position || !player || !stats) {
    return;
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

  const parsedPosition = stringOrFirst(position);

  return {
    position: isPosition(parsedPosition) ? parsedPosition : "WR",
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

const IndexPage = () => {
  const { query } = useRouter();
  const [player, setPlayer] = useState(defaultPlayer);

  if (!query) {
    setPlayer(defaultPlayer);
  } else {
    const parsedPlayer = parseQuery(query) || defaultPlayer;

    if (JSON.stringify(player) !== JSON.stringify(parsedPlayer)) {
      setPlayer(parsedPlayer);
    }
  }

  return <Main initialPlayer={player} key={player.player} />;
};

export default IndexPage;
