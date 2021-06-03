import type { AppProps /*, AppContext */ } from "next/app";

import { GeistProvider, CssBaseline } from "@geist-ui/react";

import Meta from "../components/Meta";

import "../styles/global.scss";

function MyApp({ Component, pageProps }: AppProps) {
  const metas = {
    "twitter:creator": "@iambald",
    "twitter:site": "@iambald",
    "twitter:card": "summary",
    // todo parameterize
    "og:url": `https://nflcombinestats.com`,
    "og:image": `https://nflcombinestats.com/images/og.png`,
    description: "Test how you stack up compared to NFL players!",
    "og:type": "website",
  };

  return (
    <GeistProvider>
      <Meta {...metas} />
      <CssBaseline />
      <Component {...pageProps} />
    </GeistProvider>
  );
}
export default MyApp;
