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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __importDefault(require("@actions/core"));
const external_action_1 = require("./external-action");
const fs_extra_1 = __importDefault(require("fs-extra"));
const set_input_1 = require("./set-input");
const nv_1 = __importDefault(require("@pkgjs/nv"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const nvm = yield fs_extra_1.default.readFile(".nvmrc", { encoding: "utf8" });
            core_1.default.info(`Found node ${nvm} in .nvmrc`);
            const versions = yield nv_1.default(nvm);
            core_1.default.info(`Matched with concrete version(s) of: ${JSON.stringify(versions, null, 2)}`);
            if (versions.length === 0) {
                return core_1.default.setFailed(`Didn't match any nvm versions`);
            }
            set_input_1.setInput("node-version", versions[0].versionName);
            yield external_action_1.runExternalAction("actions/setup-node@v1");
        }
        catch (error) {
            core_1.default.setFailed(error.message);
        }
    });
}
run();
//# sourceMappingURL=main.js.map