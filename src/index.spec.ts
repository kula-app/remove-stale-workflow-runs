import * as cp from 'child_process';
import * as path from 'path';
import * as process from 'process';

test('test runs', () => {
  process.env['INPUT_REPOSITORY'] = 'kula-app/remove-stale-workflow-runs';
  process.env['INPUT_MAX_RUNS_LIMIT'] = '5000';
  const ip = path.join(__dirname, '../', 'dist', 'index.js');
  const cmd = `node ${ip}`;
  try {
    const result = cp.execSync(cmd, { env: process.env }).toString();
    console.log(result);
  } catch (error) {
    console.error(error);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    console.error(error.stdout.toString());
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    console.error(error.stderr.toString());
    fail(error);
  }
});
