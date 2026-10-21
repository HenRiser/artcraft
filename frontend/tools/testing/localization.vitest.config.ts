import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

const root = path.resolve(__dirname, "../..");

export default defineConfig({
  root,
  plugins: [react(), tsconfigPaths({ projects: [path.join(root, "tsconfig.base.json")] })],
  test: {
    environment: "jsdom",
    globals: true,
    include: [
      "libs/common/src/lib/i18n/*.spec.ts",
      "libs/components/keybinds/src/**/*.spec.{ts,tsx}",
      "libs/model-list/src/**/*.spec.ts",
      "libs/components/video-editor/src/**/compatibility*.test.ts",
      "libs/components/video-editor/src/**/compatibility*.spec.ts",
    ],
  },
});
