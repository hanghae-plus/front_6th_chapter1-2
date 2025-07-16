import { defineConfig as defineTestConfig, mergeConfig } from "vitest/config";
import { defineConfig } from "vite";
import { resolve } from "path";

const base = process.env.NODE_ENV === "production" ? "/front_6th_chapter1-2/" : "";

export default mergeConfig(
  defineConfig({
    esbuild: {
      jsx: "transform",
      jsxFactory: "createVNode",
    },
    optimizeDeps: {
      esbuildOptions: {
        jsx: "transform",
        jsxFactory: "createVNode",
      },
    },
    base,
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, "index.html"),
          404: resolve(__dirname, "404.html"),
        },
      },
    },
  }),
  defineTestConfig({
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.js",
      exclude: ["**/e2e/**", "**/*.e2e.spec.js", "**/node_modules/**"],
    },
  }),
);
