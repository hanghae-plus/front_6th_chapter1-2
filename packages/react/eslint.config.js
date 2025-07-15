import baseConfig from "../../eslint.config.js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    rules: {
      // 패키지별 특정 룰이 필요하면 여기에 추가
    },
  },
];
