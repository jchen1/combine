import React, { ReactNode } from "react";
import Head from "next/head";

import { Divider, Page, Spacer } from "@geist-ui/react";

type Props = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children, title = "This is the default title" }: Props) => (
  <Page size="large">
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    {children}
    <footer>
      <Spacer y={1} />

      <Divider />
      <span>
        © 2021{" "}
        <a href="https://jeffchen.dev" target="_blank">
          Jeff Chen
        </a>
      </span>
    </footer>
  </Page>
);

export default Layout;
