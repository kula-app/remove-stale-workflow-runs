export declare function removeStaleWorkflowRuns({ owner, repo, authToken, }: {
    authToken: string;
    owner: string;
    repo: string;
}): Promise<void>;
