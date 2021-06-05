import { GetStaticPaths, GetStaticProps } from "next";
import Main from "../components/Main";
import { CombineResult } from "../interfaces";
import { stringOrFirst } from "../utils/core";
import { defaultPlayer, parseSlug } from "../utils/data";

type PlayerPageProps = {
  player?: CombineResult;
};

const PlayerPage = ({ player }: PlayerPageProps) => {
  return <Main initialPlayer={player || defaultPlayer} />;
};

export const getStaticProps: GetStaticProps = async (context) => {
  const slug = stringOrFirst(context.params!.slug);

  if (!slug) {
    return { props: { player: defaultPlayer } };
  }

  return {
    props: {
      player: parseSlug(slug) || defaultPlayer,
    },
    revalidate: 60,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: "blocking" };
};

export default PlayerPage;
