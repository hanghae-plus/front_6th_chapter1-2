import { resolve } from "path";
import { defineConfig } from "vite";
import { defineConfig as defineTestConfig, mergeConfig } from "vitest/config";

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
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: false,
      rollupOptions: {
        input: {
          main: resolve(__dirname, "index.html"),
          404: resolve(__dirname, "404.html"),
        },
      },
      output: {
        manualChunks: undefined,
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
