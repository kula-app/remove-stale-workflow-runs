# Action: remove-stale-workflow-runs

<p align="center">
  <a href="https://github.com/kula-app/remove-stale-workflow-runs/actions"><img alt="javscript-action status" src="https://github.com/kula-app/remove-stale-workflow-runs/workflows/units-test/badge.svg"></a>
</p>

[GitHub Action][] to **to remove GitHub Action workflow runs of deleted branches**

## Usage

You can now consume the action by referencing the v1 branch

```yaml
steps:
  - uses: kula-app/remove-stale-workflow-runs@v1
```

### Inputs

- **`repository: ${{ github.repository}}`**

  **Required.** Name of a repository on GitHub, with owner, e.g. `username/reponame`; this refers to https://github.com/username/reponame.git.

- **`token: ${{ github.token }}`**

  **Required.** Name of a repository on GitHub, with owner; this refers to https://github.com/username/reponame.git. Defaults to the repository name where the GitHub action is run.

- **`dry_run: false`**

  Only find stale workflow runs but do not delete anything

- **`max_runs_limit: 0`**

  Limits the number of fetched workflow runs, e.g. `500`. Setting the limit to `0` means no limit
