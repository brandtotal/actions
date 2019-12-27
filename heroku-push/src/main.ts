import * as core from "@actions/core";
import * as exec from "@actions/exec";

async function run(): Promise<void> {
  try {
    const appName = core.getInput("appName");
    const apiKey = core.getInput("apiKey");

    const remoteUrl = `https://heroku:${apiKey}@git.heroku.com/${appName}.git`;
    await exec.exec(`git`, [`push`, remoteUrl, `HEAD:master`]);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
