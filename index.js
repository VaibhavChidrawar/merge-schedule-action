const core = require("@actions/core");

const handlePullRequest = require("./lib/handle_pull_request");
const handleSchedule = require("./lib/handle_schedule");

main();

async function main() {
  process.env.MC_PR_NO = 0;
  
  if (process.env.GITHUB_EVENT_NAME === "pull_request") {
    return handlePullRequest();
  }

  process.env.MC_PR_NO = await handleSchedule();
  core.info(`Merge conflict PR NO is ${process.env.MC_PR_NO}`);
}

process.on("unhandledRejection", (reason, promise) => {
  core.warning("Unhandled Rejection at:");
  core.warning(promise);
  core.setFailed(reason);
});
