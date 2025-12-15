import { resolve } from 'node:path';
import type { UserConfig } from 'vite';

export default ({ dirname }: { dirname: string }): UserConfig => ({
  build: {
    lib: {
      entry: {
        index: resolve(dirname, 'src/index.ts'),
        operators: resolve(dirname, 'src/operators/index.ts'),
      },
      formats: ['es'],
      fileName: (_, entryName) => `${entryName}.js`,
    },
  },
});
