import * as io from "@actions/io";
import * as core from "@actions/core";
import { STATE_PATHS_TO_DELETE } from "./consts";

/**
 * Deletes the folder used for the repository clone
 */
async function deleteFolder(tempFolder: string) {
	// Cleanup
	if (tempFolder) {
		try {
			await io.rmRF(tempFolder);
		} catch (err) {
			core.error(err);
			core.setFailed(`There was an error while trying to delete temp folder '${tempFolder}'`);
		}
	}
}

export async function cleanup() {
	const pathsToDelete: string[] = JSON.parse(core.getState(STATE_PATHS_TO_DELETE));

	await Promise.all(pathsToDelete.map(deleteFolder));
}
