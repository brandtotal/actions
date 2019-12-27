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
const actions_lib_1 = require("@brandtotal/actions_lib");
const fs = require("fs-extra");
const nv = require("@pkgjs/nv");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const nvm = (yield fs.readFile(".nvmrc", { encoding: "utf8" })).trim();
            core.info(`Found '${nvm}' in .nvmrc`);
            const normalizedNvm = nvm.startsWith("lts") ? nvm.replace("lts/", "") : nvm;
            const versions = yield nv(normalizedNvm);
            core.info(`Matched with concrete version(s) of: ${JSON.stringify(versions, null, 2)}`);
            if (versions.length === 0) {
                return core.setFailed(`Didn't match any nvm versions`);
            }
            yield actions_lib_1.ExternalAction.runExternalAction("actions/setup-node@v1", {
                "node-version": versions[0].versionName,
            });
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
//# sourceMappingURL=main.js.map