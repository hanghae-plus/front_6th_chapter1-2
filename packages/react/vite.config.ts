import { createViteConfig } from "../../createViteConfig";

export default createViteConfig(
  {
    esbuild: {
      jsx: "transform",
      jsxDev: false,
    },
    optimizeDeps: {
      esbuildOptions: {
        jsx: "transform",
        jsxDev: false,
      },
    },
    build: {
      lib: {
        entry: "./src/index.ts",
        name: "react",
        formats: ["es", "cjs"],
        fileName: (format) => `${format}.js`,
      },
    },
  },
  {
    setupFiles: "./src/setupTests.ts",
  },
);
