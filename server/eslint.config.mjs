import next from "eslint-config-next";

const config = [
  // Ignore build output and deps
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**"
    ],
  },
  // Next.js recommended rules
  ...next,
];

export default config;
