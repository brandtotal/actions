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
    return __awaiter(this, void 0, void 0, function* () {
        core.debug("In create-branch action");
        try {
            const branchName = core.getInput("name", { required: true });
            const base = core.getInput("base", { required: true });
            const { owner, repo } = github.context.repo;
            const octokit = new github.GitHub(core.getInput("token", { required: true }));
            const { data: baseBranch } = yield octokit.git.getRef({
                owner,
                repo,
                ref: `heads/${base}`,
            });
            yield octokit.git.createRef({
                owner,
                repo,
                ref: `refs/heads/${branchName}`,
                sha: baseBranch.object.sha,
            });
        }
        catch (error) {
            core.error(`Caught error: ${JSON.stringify(error, null, 2)}`);
            core.setFailed(error.message);
        }
    });
}
run();
//# sourceMappingURL=main.js.map