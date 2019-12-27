import * as core from "@actions/core";
import * as fs from "fs-extra";
import { runExternalAction } from "./external-action";
import { setInput } from "./set-input";
const nv = require("@pkgjs/nv");

async function run(): Promise<void> {
  try {
    const nvm = await fs.readFile(".nvmrc", { encoding: "utf8" });
    core.info(`Found node ${nvm} in .nvmrc`);

    const versions = await nv(nvm);
    core.info(
      `Matched with concrete version(s) of: ${JSON.stringify(
        versions,
        null,
        2
      )}`
    );

    if (versions.length === 0) {
      return core.setFailed(`Didn't match any nvm versions`);
    }

    setInput("node-version", versions[0].versionName);

    await runExternalAction("actions/setup-node@v1");
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
