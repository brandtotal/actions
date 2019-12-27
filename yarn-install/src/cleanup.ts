import { ExternalAction } from "@brandtotal/actions_lib";

async function cleanup() {
	await ExternalAction.cleanup();
}

cleanup();
