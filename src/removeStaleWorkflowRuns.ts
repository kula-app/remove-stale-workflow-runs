import * as core from '@actions/core';
import { Octokit } from '@octokit/rest';

export async function removeStaleWorkflowRuns({
  owner,
  repo,
  authToken,
  dryRun,
  maxRunsLimit,
}: {
  authToken: string;
  owner: string;
  repo: string;
  dryRun: boolean;
  maxRunsLimit: number;
}) {
  const octokit = new Octokit({
    auth: authToken,
    log: {
      debug: core.debug,
      info: core.info,
      warn: core.warning,
      error: core.error,
    },
  });

  // Fetch all existing branches
  core.info(`Fetching branches of repo '${owner}/${repo}'`);
  const branches = await octokit.paginate(octokit.repos.listBranches, {
    owner: owner,
    repo: repo,
  });
  core.info(`Found ${branches.length} branches:`);
  for (const branch of branches) {
    core.info(`- ${branch.name}`);
  }
  const branchNames = new Set(branches.map((branch) => branch.name));

  // Fetch all workflows
  core.info(`Fetching workflows of repo '${owner}/${repo}' ...`);
  const workflows = await octokit.paginate(octokit.actions.listRepoWorkflows, {
    owner: owner,
    repo: repo,
  });
  core.info(`Found ${workflows.length} workflows:`);
  for (const workflow of workflows) {
    core.info(`- [${workflow.id}] ${workflow.name} (${workflow.path})`);
  }

  // Fetch all workflow runs
  core.info(`Fetching all workflow runs of repo '${owner}/${repo}' ...`);
  if (maxRunsLimit > 0) {
    core.warning(`Number of workflows is limited to ${maxRunsLimit}`);
  } else {
    core.debug(`No limit for workflow runs given`);
  }
  let fetchedRunsCounter = 0;
  const runs = await octokit.paginate(
    octokit.actions.listWorkflowRunsForRepo,
    {
      owner: owner,
      repo: repo,
      per_page: 100,
    },
    (response, done) => {
      fetchedRunsCounter += response.data.length;
      core.debug(`Fetched ${fetchedRunsCounter}/${response.data.total_count} runs...`);
      if (maxRunsLimit > 0 && fetchedRunsCounter >= maxRunsLimit) {
        core.warning(`Workflow run limit of ${maxRunsLimit} reached, not fetching further pages!`);
        done();
      }
      return response.data;
    },
  );
  if (runs.length === 0) {
    core.info(`No workflow runs found, nothing left to do!`);
    return;
  }
  core.info(`Found ${runs.length} workflow runs`);

  // Build list of branch names
  core.info(`Building list of branches in workflow runs...`);
  const runBranches = new Set(runs.map((run) => run.head_branch));
  core.info(`Found ${[...runBranches].length} unique branch names in workflow runs`);

  // Filter out branches which still exist
  const staleBranches = new Set([...runBranches].filter((name) => name !== null && !branchNames.has(name)));
  const sortedStaleBranchNames = [...staleBranches].sort().flatMap((branch) => branch as string);
  if (sortedStaleBranchNames.length === 0) {
    core.info('No stale branch names found, nothing left to do!');
    return;
  }
  core.info(`Found ${sortedStaleBranchNames.length} stale workflow branch names:`);
  for (const branch of sortedStaleBranchNames) {
    core.info(`- ${branch}`);
  }

  // Iterate all runs and delete the ones of stale workflows
  let counter = 0;
  core.info(`Deleting workflow runs of stale branches...`);
  for (const [idx, run] of runs.entries()) {
    if (staleBranches.has(run.head_branch)) {
      core.info(
        `(${idx + 1}/${runs.length}) Workflow run #${run.run_number} used stale branch '${
          run.head_branch
        }', deleting it...`,
      );
      if (!dryRun) {
        await octokit.actions.deleteWorkflowRun({
          owner: owner,
          repo: repo,
          run_id: run.id,
        });
      } else {
        core.warning('Dry run is enabled, not deleting!');
      }
      counter += 1;
    } else {
      core.info(
        `(${idx + 1}/${runs.length}) Workflow run #${run.run_number} used active branch '${
          run.head_branch
        }', skipping it...`,
      );
    }
  }
  core.info(`Finished deleting workflow runs, deleted ${counter} of ${runs.length} runs`);
}
