import { defineConfig } from "vitest/config";
import path from "node:path";

const pkg = (name: string) => path.resolve(__dirname, `packages/${name}/src/index.ts`);

export default defineConfig({
  test: {
    include: ["**/__tests__/**/*.bdd.test.ts", "**/__tests__/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/apps/**"],
    testTimeout: 30_000,
    env: { ARCR_ALLOW_SIMULATOR: "1", NODE_ENV: "test" },
  },
  resolve: {
    alias: {
      "@arcr/engine": pkg("engine"),
      "@arcr/db": pkg("db"),
      "@arcr/rak-bridge": pkg("rak-bridge"),
      "@arcr/command": pkg("command"),
      "@arcr/registry": pkg("registry"),
      "@arcr/collectors": pkg("collectors"),
      "@arcr/acquisition": pkg("acquisition"),
      "@arcr/underwriting": pkg("underwriting"),
      "@arcr/locator": pkg("locator"),
      "@arcr/outreach": pkg("outreach"),
      "@arcr/intake": pkg("intake"),
      "@arcr/engagement": pkg("engagement"),
      "@arcr/filings": pkg("filings"),
      "@arcr/trust": pkg("trust"),
      "@arcr/memo": pkg("memo"),
      "@arcr/verify": pkg("verify"),
    },
  },
});
