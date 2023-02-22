import * as core from '@actions/core';
import { removeStaleWorkflowRuns } from './removeStaleWorkflowRuns';

async function run() {
  try {
    // -- Read Inputs --
    const repository = core.getInput('repository', { required: true });
    const repoParts = repository.split('/');
    if (repoParts.length !== 2) {
      throw `Invalid repository "${repository}" (needs to have one slash, i.e. 'owner/repo')`;
    }
    const [owner, repo] = repoParts;
    const authToken = core.getInput('token', {
      required: true,
    });
    const dryRun = core.getBooleanInput('dry_run');
    const maxRunsLimit = parseInt(core.getInput('max_runs_limit'));

    // -- Perform Tasks --
    await removeStaleWorkflowRuns({
      authToken,
      owner,
      repo,
      dryRun,
      maxRunsLimit,
    });
  } catch (error: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    core.setFailed(error?.message);
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run();
