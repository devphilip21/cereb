import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import type { InlineConfig } from 'vite';

function resolveEntry(cwd: string): string {
  const tsEntry = resolve(cwd, 'src', 'index.ts');
  if (existsSync(tsEntry)) {
    return tsEntry;
  }
  return resolve(cwd, 'src', 'index.js');
}

export function createViteProdConfig(): InlineConfig {
  const cwd = process.cwd();

  return {
    build: {
      lib: {
        entry: resolveEntry(cwd),
        formats: ['es'],
        fileName: () => 'index.esm.js',
      },
      outDir: resolve(cwd, 'dist'),
      sourcemap: true,
      minify: 'esbuild',
    },
  };
}
