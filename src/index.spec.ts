import * as cp from 'child_process';
import * as path from 'path';
import * as process from 'process';

test('test runs', () => {
  process.env['INPUT_REPOSITORY'] = 'kula-app/remove-stale-workflow-runs';
  const ip = path.join(__dirname, '../', 'dist', 'index.js');
  const result = cp.execSync(`node ${ip}`, { env: process.env }).toString();
  console.log(result);
});
