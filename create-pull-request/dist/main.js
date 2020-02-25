"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const github = require("@actions/github");
const DEFAULT_BODY = `✨ This is an automated PR`;
const DEFAULT_IS_DRAFT = false;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
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
            const { data: existingPullRequests } = yield octokit.pulls.list({
                base,
                head,
                owner,
                repo,
            });
            const { data: pullRequest } = existingPullRequests.length === 0
                ? yield octokit.pulls.create({
                    title,
                    body,
                    draft: JSON.parse(core.getInput("draft") || JSON.stringify(DEFAULT_IS_DRAFT)),
                    base,
                    head,
                    owner,
                    repo,
                })
                : yield octokit.pulls.update({
                    pull_number: existingPullRequests[0].number,
                    title,
                    body,
                    owner,
                    repo,
                });
            if (labels.length > 0) {
                yield octokit.issues.addLabels({
                    issue_number: pullRequest.number,
                    owner,
                    repo,
                    labels,
                });
            }
            if (milestone) {
                yield octokit.issues.update({
                    issue_number: pullRequest.number,
                    milestone: parseInt(milestone, 10),
                    owner,
                    repo,
                });
            }
        }
        catch (error) {
            core.error(`Caught error: ${JSON.stringify(error, null, 2)}`);
            core.setFailed(error.message);
        }
    });
}
run();
//# sourceMappingURL=main.js.map