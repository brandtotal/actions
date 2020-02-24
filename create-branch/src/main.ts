import * as core from "@actions/core";
import * as github from "@actions/github";

async function run(): Promise<void> {
	core.debug("In create-branch action");

	try {
		const branchName = core.getInput("name", { required: true });
		const base = core.getInput("base", { required: true });
		const { owner, repo } = github.context.repo;

		const octokit = new github.GitHub(core.getInput("token", { required: true }));

		const { data: baseBranch } = await octokit.git.getRef({
			owner,
			repo,

			ref: `heads/${base}`,
		});

		await octokit.git.createRef({
			owner,
			repo,
			ref: `refs/heads/${branchName}`,
			sha: baseBranch.object.sha,
		});
	} catch (error) {
		core.error(`Caught error: ${JSON.stringify(error, null, 2)}`);
		core.setFailed(error.message);
	}
}

run();
