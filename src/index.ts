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
    const authToken = core.getInput('token');

    // -- Perform Tasks --
    await removeStaleWorkflowRuns({
      authToken,
      owner,
      repo,
    });
  } catch (error: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    core.setFailed(error?.message);
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run();
