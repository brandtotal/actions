"use strict";
var __awaiter =
	(this && this.__awaiter) ||
	function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
				? value
				: new P(function(resolve) {
						resolve(value);
				  });
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const actions_lib_1 = require("@brandtotal/actions_lib");
const fs = require("fs-extra");
function buildNpmRcFileContent(registryUrl, authToken) {
	const normalizedUrl = registryUrl.replace(/https?:/, "");
	if (!authToken) {
		return normalizedUrl;
	}
	return `${normalizedUrl}/:_authToken=${authToken}`;
}
function run() {
	return __awaiter(this, void 0, void 0, function*() {
		try {
			const registryUrl = core.getInput("registry-url");
			const authToken = process.env.NODE_AUTH_TOKEN;
			yield fs.writeFile(".npmrc", buildNpmRcFileContent(registryUrl, authToken));
			yield actions_lib_1.ExternalAction.runExternalAction("bahmutov/npm-install@v1.3.0");
		} catch (error) {
			core.setFailed(error.message);
		}
	});
}
run();
//# sourceMappingURL=main.js.map
