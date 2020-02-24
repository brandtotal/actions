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
function run() {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const base = core.getInput("target", { required: true });
            const head = core.getInput("source", { required: true });
            const owner = (_a = core.getInput("owner"), (_a !== null && _a !== void 0 ? _a : DEFAULT_OWNER));
            const repo = github.context.repo.repo;
            const title = core.getInput("title", { required: true });
            const body = (_b = core.getInput("body"), (_b !== null && _b !== void 0 ? _b : DEFAULT_BODY));
            const labels = (_c = core.getInput("labels"), (_c !== null && _c !== void 0 ? _c : "")).split(",").map(label => label.trim());
            const octokit = new github.GitHub(core.getInput("token", { required: true }));
            const { data: existingPullRequests } = yield octokit.pulls.list({ base, head, owner, repo });
            const { data: pullRequest } = existingPullRequests.length === 0
                ? yield octokit.pulls.create({
                    title,
                    body,
                    draft: JSON.parse((_d = core.getInput("draft"), (_d !== null && _d !== void 0 ? _d : JSON.stringify(DEFAULT_IS_DRAFT)))),
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
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
const DEFAULT_BODY = `✨ This is an automated PR`;
const DEFAULT_IS_DRAFT = false;
const DEFAULT_OWNER = "GitHub Action Bot";
//# sourceMappingURL=main.js.map