const core = require("@actions/core");

const handlePullRequest = require("./lib/handle_pull_request");
const handleSchedule = require("./lib/handle_schedule");

main();

async function main() {
  MC_PR_NO = 100;
  console.log(`::set-output name=MC_PR_NO_NEW::${MC_PR_NO}`);
  MC_PR_NO = MC_PR_NO + 50
  core.info(`::set-output name=MC_PR_NO_NEWW::${MC_PR_NO}`);
  if (process.env.GITHUB_EVENT_NAME === "pull_request") {
    return handlePullRequest();
  }

  MC_PR_NO = await handleSchedule();
  // console.log("::set-output name=MC_PR_NO_NEW::${MC_PR_NO}");
  // core.info("::set-output name=MC_PR_NO_NEWW::${MC_PR_NO}");
  // core.info(`Merge conflict PR NO is ${process.env.MC_PR_NO}`);
  // console.log(“::set-output name=KEY_NAME_YOU_CAN_DEFINE:” + yourValue)
  // console.log(“echo ::set-output name=MC_PR_NO_NEW:” + yourValue)
  // echo "::set-output name=test::world"
}

process.on("unhandledRejection", (reason, promise) => {
  core.warning("Unhandled Rejection at:");
  core.warning(promise);
  core.setFailed(reason);
});
