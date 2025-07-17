import { defineConfig as defineTestConfig, mergeConfig } from "vitest/config";
import { defineConfig } from "vite";
import { resolve } from "path";

// GitHub Pages 배포를 위한 base path 설정
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
      // GitHub Pages 배포를 위한 빌드 설정
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: false, // 프로덕션에서는 소스맵 비활성화
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
