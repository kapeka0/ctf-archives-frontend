import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import "./lib/env/client";
import "./lib/env/server";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
};

export default withNextIntl(nextConfig);
