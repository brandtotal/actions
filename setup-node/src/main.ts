import * as core from "@actions/core";
import * as fs from "fs-extra";
import { runExternalAction } from "./external-action";
import { setInput } from "./set-input";
const nv = require("@pkgjs/nv");

async function run(): Promise<void> {
  try {
    const nvm = (await fs.readFile(".nvmrc", { encoding: "utf8" })).trim();
    core.info(`Found \`${nvm}\` in .nvmrc`);

    const normalizedNvm = nvm.startsWith("lts") ? nvm.replace("lts/", "") : nvm;
    const versions = await nv(normalizedNvm);
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

    core.info(`Set \`node-version\` input to \`${versions[0].versionName}\``);
    setInput("node-version", versions[0].versionName);

    await runExternalAction("actions/setup-node@v1");
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
