import { createViteConfig } from "../../createViteConfig";
import { resolve } from "path";

const base: string = process.env.NODE_ENV === "production" ? "/front_6th_chapter1-2/" : "";

export default createViteConfig({
  base,
  esbuild: {
    jsx: "transform",
    jsxInject: `import React from 'react';`,
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
    jsxDev: false,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        404: resolve(__dirname, "404.html"),
      },
    },
  },
});
