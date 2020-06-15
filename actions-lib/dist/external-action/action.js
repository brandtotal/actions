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
const exec = require("@actions/exec");
const yaml = require("js-yaml");
const path = require("path");
const set_input_1 = require("../utils/set-input");
const consts_1 = require("./consts");
// Default error message describing the `action` input parameter format
const ACTION_ERROR = `Provided 'action' is not valid, it must have the following format: '{org}/{repo}[/path]@ref'`;
/**
 * Generates a random string to be used as temporary folder to clone the action repo
 */
function randomFolderName() {
    const dirName = Math.random()
        .toString(36)
        .substring(2, 15);
    if (process.env.RUNNER_TEMP) {
        return path.join(process.env.RUNNER_TEMP, dirName);
    }
    return dirName;
}
/**
 * Clones the action repository
 */
function cloneRepository(tempFolder, repositoryUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exec.exec("git", ["clone", repositoryUrl, tempFolder]);
        }
        catch (err) {
            core.error(err);
            throw new Error("There was an error while trying to clone the action repository");
        }
    });
}
/**
 * Checks out the requested repo's reference (branch/tag/commit)
 */
function checkout(tempFolder, reference) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exec.exec("git", ["checkout", "-f", "--detach", reference], {
                cwd: tempFolder,
            });
        }
        catch (err) {
            core.error(err);
            throw new Error(`There was an error while trying to checkout '${reference}'`);
        }
    });
}
/**
 * Parses the `action.yml` file and execute the action
 */
function executeAction(actionFileFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        // Prepare an empty string which will contain the content of the `action.yml` file
        let actionFileContent = "";
        // Create an object to listen on the stdout of the cat command
        const options = {
            listeners: {
                stdout: (data) => {
                    actionFileContent += data.toString();
                },
            },
        };
        try {
            // Use cat to fetch the content of `action.yml` file
            yield exec.exec("cat", [actionFileFolder + "/action.yml"], options);
        }
        catch (err) {
            core.error(err);
            throw new Error(`There was an error while trying to read 'action.yml'`);
        }
        let actionFileObject;
        try {
            // Convert the YML file into a javascript object
            actionFileObject = yield yaml.safeLoad(actionFileContent);
        }
        catch (err) {
            core.error(err);
            throw new Error(`The 'action.yml' file seems to have an invalid format`);
        }
        // Check if the `action.yml` file has properly written
        if (!("runs" in actionFileObject) || !("using" in actionFileObject.runs)) {
            throw new Error(`There was an error while paesing 'action.yml' file, missing 'runs.using'`);
        }
        // Check if the action is based on node
        if (!actionFileObject.runs.using.startsWith("node")) {
            throw new Error(`Unexpected value '${actionFileObject.runs.using}' for 'runs.using' in the 'action.yml' file`);
        }
        try {
            // Get the full path of the main file of the action to execute
            const mainFullPath = path.join(actionFileFolder, actionFileObject.runs.main.replace(/^((.\/)|(\/))/, ""));
            core.info(`DEBUG: Going to run ${mainFullPath}`);
            // Execute the action
            yield require(mainFullPath);
        }
        catch (err) {
            core.error(err);
            throw new Error(`There was an error while trying to execute the action`);
        }
    });
}
function registerPathToDelete(path) {
    const existingState = core.getState(consts_1.STATE_PATHS_TO_DELETE);
    const pathsToDelete = existingState ? JSON.parse(existingState).concat(path) : [path];
    core.saveState(consts_1.STATE_PATHS_TO_DELETE, JSON.stringify(pathsToDelete));
}
/**
 * Checks out the code from the repository and branch where the action has been called
 *
 * @important ***Remember to call `await cleanup()` in your `cleanup` script.**
 */
function runExternalAction(uses, inputs) {
    return __awaiter(this, void 0, void 0, function* () {
        if (inputs) {
            Object.entries(inputs).forEach(([key, value]) => {
                core.info(`Setting '${key}' input to '${value}'`);
                set_input_1.setInput(key, value);
            });
        }
        // Extract `ref` from `action`
        const [repoParts, ref] = uses.split("@");
        // If `ref` is missing, return an error
        if (!ref) {
            core.error("ref not found in `uses`");
            return core.setFailed(ACTION_ERROR);
        }
        // Extract all components from `action` input parameter
        const [org, repo, path] = repoParts.split("/");
        if (!org || !repo) {
            core.error("org or repo not found");
            return core.setFailed(ACTION_ERROR);
        }
        // Create a random folder name where to checkout the action
        const tempFolderName = randomFolderName();
        registerPathToDelete(tempFolderName);
        try {
            // Generate repository URL for the action to checkout
            const url = `https://github.com/${org}/${repo}.git`;
            // Clone the action repository
            yield cloneRepository(tempFolderName, url);
            // Checkout the reference
            yield checkout(tempFolderName, ref);
            // Set the expected path for the `action.yml` file
            const actionFileFolder = [tempFolderName, path].filter(p => p).join("/");
            // Execute the action
            yield executeAction(actionFileFolder);
        }
        catch (err) {
            core.setFailed(err);
        }
    });
}
exports.runExternalAction = runExternalAction;
//# sourceMappingURL=action.js.map