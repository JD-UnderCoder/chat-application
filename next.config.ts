import type { NextConfig } from "next";

const isPages = process.env.GITHUB_PAGES === "true";
const repoName = "chat-application";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isPages ? `/${repoName}` : undefined,
  assetPrefix: isPages ? `/${repoName}/` : undefined,
};

export default nextConfig;
