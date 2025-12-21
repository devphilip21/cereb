import { resolve } from "node:path";
import type { InlineConfig } from "vite";

export function createViteDevConfig(): InlineConfig {
  const cwd = process.cwd();

  return {
    root: resolve(cwd, "examples"),
    server: {
      host: "0.0.0.0",
      port: 3000,
    },
  };
}
