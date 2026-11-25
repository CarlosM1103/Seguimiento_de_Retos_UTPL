import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const cli = require.resolve('@angular/cli/bin/ng.js');

// The extra chunk optimization can emit syntax newer than the configured WebView.
const build = spawnSync(process.execPath, [cli, 'build', ...process.argv.slice(2)], {
  env: { ...process.env, NG_BUILD_OPTIMIZE_CHUNKS: 'false' },
  stdio: 'inherit',
});

if (build.error) throw build.error;
process.exitCode = build.status ?? 1;
