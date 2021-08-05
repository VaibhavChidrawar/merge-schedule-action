const core = require("@actions/core");

const handlePullRequest = require("./lib/handle_pull_request");
const handleSchedule = require("./lib/handle_schedule");

main();

async function main() {
  // Setting MC_PR_NO to 0 initially
  core.info(`::set-output name=MC_PR_NO::0`);
  
  if (process.env.GITHUB_EVENT_NAME === "pull_request") {
    return handlePullRequest();
  }

  handleSchedule();
}

process.on("unhandledRejection", (reason, promise) => {
  core.warning("Unhandled Rejection at:");
  core.warning(promise);
  core.setFailed(reason);
});
