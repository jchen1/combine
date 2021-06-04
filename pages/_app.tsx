import { CssBaseline, GeistProvider } from "@geist-ui/react";
import type { AppProps /*, AppContext */ } from "next/app";
import { useRouter } from "next/router";
import Meta from "../components/Meta";
import "../styles/global.scss";

function MyApp({ Component, pageProps }: AppProps) {
  const { asPath } = useRouter();

  const metas = {
    "twitter:creator": "@iambald",
    "twitter:site": "@iambald",
    "twitter:card": "summary_large_image",
    // todo parameterize BASE_URL
    "og:url": `https://nflcombinestats.com${asPath}`,
    "og:image": `https://nflcombinestats.com/images/og.png`,
    description: "Test how you stack up compared to NFL players!",
    "og:type": "website",
    "og:title": "NFL Combine Comparator",
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
