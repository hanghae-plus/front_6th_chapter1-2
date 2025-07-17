import { defineConfig as defineTestConfig, mergeConfig } from "vitest/config";
import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";

const base = process.env.NODE_ENV === "production" ? "/front_6th_chapter1-2/" : "";

export default mergeConfig(
  defineConfig({
    esbuild: {
      jsx: "transform",
      jsxFactory: "createVNode",
      jsxDev: false,
    },
    optimizeDeps: {
      esbuildOptions: {
        jsx: "transform",
        jsxFactory: "createVNode",
        jsxDev: false,
      },
    },
    base,
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, "index.html"),
          404: resolve(__dirname, "index.html"),
        },
      },
    },
    plugins: [
      {
        name: "copy-index-to-404",
        closeBundle() {
          fs.copyFileSync(resolve(__dirname, "dist/index.html"), resolve(__dirname, "dist/404.html"));
        },
      },
    ],
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
