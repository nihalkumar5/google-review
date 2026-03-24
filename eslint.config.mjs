import { dirname } from "path";
import { fileURLToPath } from "url";

import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const config = [
  {
    ignores: [
      ".next/**",
      ".next-app/**",
      "node_modules/**",
      "next-env.d.ts",
      "eslint.config.mjs",
      "next.config.ts",
      "postcss.config.mjs",
      "tailwind.config.ts"
    ]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript")
];

export default config;
