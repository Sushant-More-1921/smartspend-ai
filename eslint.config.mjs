import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextVitals,
  {
    ignores: ["scripts/**", "ml-service/**", ".next/**", "node_modules/**"],
  },
  {
    rules: {
      "no-unused-vars": "warn",
    },
  },
];

export default eslintConfig;
