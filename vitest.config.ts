const { defineConfig } = require("vitest/config");
const path = require("node:path");

module.exports = defineConfig({
  oxc: {
    jsx: { runtime: "automatic" },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
  test: {
    include: ["**/*.test.ts"],
  },
});
