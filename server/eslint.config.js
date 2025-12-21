import next from "eslint-config-next";

export default [
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
