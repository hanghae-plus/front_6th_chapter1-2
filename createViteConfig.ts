import { defineConfig as defineTestConfig, mergeConfig, ViteUserConfig } from "vitest/config";
import { defineConfig, UserConfig } from "vite";

export function createViteConfig(options: UserConfig = {}, testOptions: ViteUserConfig["test"] = {}): UserConfig {
  return mergeConfig(
    defineConfig(options),
    defineTestConfig({
      test: {
        globals: true,
        environment: "jsdom",
        exclude: ["**/e2e/**", "**/*.e2e.spec.js", "**/node_modules/**"],
        ...testOptions,
      },
    }),
  );
}
