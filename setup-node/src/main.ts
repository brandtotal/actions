import * as core from "@actions/core";
import { ExternalAction } from "@brandtotal/actions_lib";
import * as fs from "fs-extra";
import nv = require("@pkgjs/nv");

async function run(): Promise<void> {
	try {
		const nvm = (await fs.readFile(".nvmrc", { encoding: "utf8" })).trim();
		core.info(`Found '${nvm}' in .nvmrc`);

		const normalizedNvm = nvm.startsWith("lts") ? nvm.replace("lts/", "") : nvm;
		const versions = await nv(normalizedNvm);
		core.info(`Matched with concrete version(s) of: ${JSON.stringify(versions, null, 2)}`);

		if (versions.length === 0) {
			return core.setFailed(`Didn't match any nvm versions`);
		}

		await ExternalAction.runExternalAction("actions/setup-node@v1", {
			"node-version": versions[0].versionName,
		});
	} catch (error) {
		core.setFailed(error.message);
	}
}

run();
