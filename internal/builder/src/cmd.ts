#!/usr/bin/env node
import { existsSync } from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { program } from "commander";
import { build, createServer, mergeConfig } from "vite";
import { createViteDevConfig } from "./configs/vite.dev.js";
import { createViteProdConfig } from "./configs/vite.prod.js";

async function loadProjectConfig(mode: "development" | "production") {
  const cwd = process.cwd();
  const configFile = path.resolve(cwd, "vite.config.ts");

  if (!existsSync(configFile)) {
    return {};
  }

  const module = await import(pathToFileURL(configFile).href);
  const config = module.default;

  if (typeof config === "function") {
    return config({ dirname: cwd, mode, path });
  }

  return config ?? {};
}

program.name("builder").description("Build tool for anylab packages");

program
  .command("build")
  .description("Production build")
  .action(async () => {
    const baseConfig = createViteProdConfig();
    const projectConfig = await loadProjectConfig("production");
    const config = mergeConfig(baseConfig, projectConfig);
    await build({ ...config, configFile: false });
    console.log("Build completed!");
  });

program
  .command("dev")
  .description("Start dev server with HMR")
  .action(async () => {
    const baseConfig = createViteDevConfig();
    const projectConfig = await loadProjectConfig("development");
    const config = mergeConfig(baseConfig, projectConfig);
    const server = await createServer({ ...config, configFile: false });
    await server.listen();
    server.printUrls();
  });

program.parse();
