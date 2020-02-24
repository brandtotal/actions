import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as path from "path";
import * as yaml from "js-yaml";
import { STATE_PATHS_TO_DELETE } from "./consts";
import { setInput } from "../utils/set-input";

// Default error message describing the `action` input parameter format
const ACTION_ERROR = `Provided 'action' is not valid, it must have the following format: '{org}/{repo}[/path]@ref'`;

// Interface describing the `action.yml` file format
interface ActionFileContent {
	runs: {
		using: string;
		main: string;
	};
}

/**
 * Generates a random string to be used as temporary folder to clone the action repo
 */
function randomFolderName() {
	return Math.random()
		.toString(36)
		.substring(2, 15);
}

/**
 * Clones the action repository
 */
async function cloneRepository(tempFolder: string, repositoryUrl: string) {
	try {
		await exec.exec("git", ["clone", repositoryUrl, tempFolder]);
	} catch (err) {
		core.error(err);
		throw new Error("There was an error while trying to clone the action repository");
	}
}

/**
 * Checks out the requested repo's reference (branch/tag/commit)
 */
async function checkout(tempFolder: string, reference: string) {
	try {
		await exec.exec("git", ["checkout", "-f", "--detach", reference], {
			cwd: tempFolder,
		});
	} catch (err) {
		core.error(err);
		throw new Error(`There was an error while trying to checkout '${reference}'`);
	}
}

/**
 * Parses the `action.yml` file and execute the action
 */
async function executeAction(actionFileFolder: string) {
	// Prepare an empty string which will contain the content of the `action.yml` file
	let actionFileContent = "";

	// Create an object to listen on the stdout of the cat command
	const options = {
		listeners: {
			stdout: (data: Buffer) => {
				actionFileContent += data.toString();
			},
		},
	};

	try {
		// Use cat to fetch the content of `action.yml` file
		await exec.exec("cat", [actionFileFolder + "/action.yml"], options);
	} catch (err) {
		core.error(err);
		throw new Error(`There was an error while trying to read 'action.yml'`);
	}

	let actionFileObject: ActionFileContent;
	try {
		// Convert the YML file into a javascript object
		actionFileObject = await yaml.safeLoad(actionFileContent);
	} catch (err) {
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
		const currentPath = await new Promise<string>(async (resolve, reject) => {
			// Get the full path of the current path
			await exec.exec("pwd", [], {
				listeners: {
					stdline: resolve,
					stderr: reject,
				},
			});
		});

		// Get the full path of the main file of the action to execute
		const mainFullPath = path.join(
			currentPath,
			actionFileFolder,
			actionFileObject.runs.main.replace(/^((.\/)|(\/))/, "")
		);

		// Execute the action
		await require(mainFullPath);
	} catch (err) {
		core.error(err);
		throw new Error(`There was an error while trying to execute the action`);
	}
}

function registerPathToDelete(path: string) {
	const existingState = core.getState(STATE_PATHS_TO_DELETE);
	const pathsToDelete = existingState ? (JSON.parse(existingState) as string[]).concat(path) : [path];
	core.saveState(STATE_PATHS_TO_DELETE, JSON.stringify(pathsToDelete));
}

/**
 * Checks out the code from the repository and branch where the action has been called
 *
 * @important ***Remember to call `await cleanup()` in your `cleanup` script.**
 */
export async function runExternalAction(uses: string, inputs?: Record<string, string>) {
	if (inputs) {
		Object.entries(inputs).forEach(([key, value]) => {
			core.info(`Setting '${key}' input to '${value}'`);
			setInput(key, value);
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
		await cloneRepository(tempFolderName, url);

		// Checkout the reference
		await checkout(tempFolderName, ref);

		// Set the expected path for the `action.yml` file
		const actionFileFolder = [tempFolderName, path].filter(p => p).join("/");

		// Execute the action
		await executeAction(actionFileFolder);
	} catch (err) {
		core.setFailed(err);
	}
}
