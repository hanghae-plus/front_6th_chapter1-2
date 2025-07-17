import { defineConfig as defineTestConfig, mergeConfig } from "vitest/config";
import { defineConfig } from "vite";
import path from "path";

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
        input: path.resolve(__dirname, "index.html"),
        output: {
          entryFileNames: "assets/main-[hash].js",
          manualChunks: undefined,
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
