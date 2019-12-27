import * as io from "@actions/io";
import * as core from "@actions/core";

const pathsToDelete: string[] = JSON.parse(core.getState("pathsToDelete"));

pathsToDelete.forEach(path => {
  deleteFolder(path);
});

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
      core.setFailed(
        `There was an error while trying to delete temp folder '${tempFolder}'`
      );
    }
  }
}
