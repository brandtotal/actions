import * as core from "@actions/core";
import * as github from "@actions/github";

async function run(): Promise<void> {
	try {
		const base = core.getInput("target", { required: true });
		const head = core.getInput("source", { required: true });
		const owner = core.getInput("owner") ?? DEFAULT_OWNER;
		const repo = github.context.repo.repo;
		const title = core.getInput("title", { required: true });
		const body = core.getInput("body") ?? DEFAULT_BODY;
		const labels = (core.getInput("labels") ?? "").split(",").map(label => label.trim());

		const octokit = new github.GitHub(core.getInput("token", { required: true }));

		const { data: existingPullRequests } = await octokit.pulls.list({ base, head, owner, repo });

		const { data: pullRequest } =
			existingPullRequests.length === 0
				? await octokit.pulls.create({
						title,
						body,
						draft: JSON.parse(core.getInput("draft") ?? JSON.stringify(DEFAULT_IS_DRAFT)),
						base,
						head,
						owner,
						repo,
				  })
				: await octokit.pulls.update({
						pull_number: existingPullRequests[0].number,
						title,
						body,
						owner,
						repo,
				  });

		if (labels.length > 0) {
			await octokit.issues.addLabels({
				issue_number: pullRequest.number,
				owner,
				repo,
				labels,
			});
		}
	} catch (error) {
		core.setFailed(error.message);
	}
}

run();

const DEFAULT_BODY = `✨ This is an automated PR`;
const DEFAULT_IS_DRAFT = false;
const DEFAULT_OWNER = "GitHub Action Bot";
