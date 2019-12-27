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
const io = require("@actions/io");
const core = require("@actions/core");
const consts_1 = require("./consts");
/**
 * Deletes the folder used for the repository clone
 */
function deleteFolder(tempFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        // Cleanup
        if (tempFolder) {
            try {
                yield io.rmRF(tempFolder);
            }
            catch (err) {
                core.error(err);
                core.setFailed(`There was an error while trying to delete temp folder '${tempFolder}'`);
            }
        }
    });
}
function cleanup() {
    return __awaiter(this, void 0, void 0, function* () {
        const pathsToDelete = JSON.parse(core.getState(consts_1.STATE_PATHS_TO_DELETE));
        yield Promise.all(pathsToDelete.map(deleteFolder));
    });
}
exports.cleanup = cleanup;
//# sourceMappingURL=cleanup.js.map