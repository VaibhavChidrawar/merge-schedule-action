const core = require("@actions/core");

const handlePullRequest = require("./lib/handle_pull_request");
const handleSchedule = require("./lib/handle_schedule");

main();

async function main() {
  core.info("In main()");
  process.env.MC_PR_NO = 1;
  core.info(`1 Merge conflict PR NO is ${process.env.MC_PR_NO}`);
  
  if (process.env.GITHUB_EVENT_NAME === "pull_request") {
    core.info(`2 Merge conflict PR NO is ${process.env.MC_PR_NO}`);
    core.info(`3 Merge conflict PR NO is ${process.env.MC_PR_NO}`);
    
    // return handlePullRequest();
    process.env.MC_PR_NO = await handlePullRequest();
    //core.info(`4 Merge conflict PR NO is ${mcprno}`);
    core.info(`5 Merge conflict PR NO is ${process.env.MC_PR_NO}`);
    return;
  }

  handleSchedule();
  core.info(`6 Merge conflict PR NO is ${process.env.MC_PR_NO}`);
}

process.on("unhandledRejection", (reason, promise) => {
  core.warning("Unhandled Rejection at:");
  core.warning(promise);
  core.setFailed(reason);
});
