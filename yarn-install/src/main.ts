import * as core from "@actions/core";
import { ExternalAction } from "@brandtotal/actions_lib";
import * as fs from "fs-extra";

function buildNpmRcFileContent(registryUrl: string, authToken?: string) {
	const normalizedUrl = registryUrl.replace(/https?:/, "");
	if (!authToken) {
		return normalizedUrl;
	}

	return `${normalizedUrl}/:_authToken=${authToken}`;
}

async function run(): Promise<void> {
	try {
		const registryUrl = core.getInput("registryUrl") || "https://registry.npmjs.org";
		const authToken = process.env.NODE_AUTH_TOKEN;

		core.info(`Writing .npmrc file with registry: ${registryUrl}. Authentication: ${!!authToken}`);

		await fs.writeFile(".npmrc", buildNpmRcFileContent(registryUrl, authToken));

		core.info("Wrote .npmrc file");

		await ExternalAction.runExternalAction("bahmutov/npm-install@v1.3.0");
	} catch (error) {
		core.setFailed(error.message);
	}
}

run();
