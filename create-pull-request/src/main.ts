import * as core from "@actions/core";
import * as github from "@actions/github";

const DEFAULT_BODY = `✨ This is an automated PR`;
const DEFAULT_IS_DRAFT = false;

async function run(): Promise<void> {
	core.debug("In create-pull-request action");

	try {
		const base = core.getInput("target", { required: true });
		const head = core.getInput("source", { required: true });
		const { owner, repo } = github.context.repo;
		const title = core.getInput("title", { required: true });
		const body = core.getInput("body") || DEFAULT_BODY;
		const labels = (core.getInput("labels") || "").split(",").map(label => label.trim());
		const milestone = core.getInput("milestone");

		const octokit = new github.GitHub(core.getInput("token", { required: true }));

		const { data: existingPullRequests } = await octokit.pulls.list({
			base,
			head,
			owner,
			repo,
		});

		const { data: pullRequest } =
			existingPullRequests.length === 0
				? await octokit.pulls.create({
						title,
						body,
						draft: JSON.parse(core.getInput("draft") || JSON.stringify(DEFAULT_IS_DRAFT)),
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

		if (milestone) {
			await octokit.issues.update({
				issue_number: pullRequest.number,
				milestone: parseInt(milestone, 10),
				owner,
				repo,
			});
		}
	} catch (error) {
		core.error(`Caught error: ${JSON.stringify(error, null, 2)}`);
		core.setFailed(error.message);
	}
}

run();
