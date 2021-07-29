module.exports = handleSchedule;

const core = require("@actions/core");
const { Octokit } = require("@octokit/action");
const localeDate = require("./locale_date");

/**
 * handle "schedule" event
 */
async function handleSchedule() {
  const octokit = new Octokit();
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

  const mergeMethod = process.env.INPUT_MERGE_METHOD;

  // Setting MC_PR_NO to 0 initially
  core.info(`::set-output name=MC_PR_NO::0`);

  core.info(`Loading open pull request`);
  const pullRequests = await octokit.paginate(
    "GET /repos/:owner/:repo/pulls",
    {
      owner,
      repo,
      state: "open",
    },
    (response) => {
      return response.data
        .filter((pullRequest) => hasScheduleCommand(pullRequest))
        .filter((pullRequest) => isntFromFork(pullRequest))
        .map((pullRequest) => {
          return {
            number: pullRequest.number,
            html_url: pullRequest.html_url,
            scheduledDate: getScheduleDateString(pullRequest.body),
            ref: pullRequest.head.sha,
            headSha: pullRequest.head.sha,
          };
        });
    }
  );

  core.info(`${pullRequests.length} scheduled pull requests found`);

  if (pullRequests.length === 0) {
    return 0;
  }

  const duePullRequests = pullRequests.filter(
    (pullRequest) => new Date(pullRequest.scheduledDate) < localeDate()
  );

  core.info(`${duePullRequests.length} due pull requests found`);

  if (duePullRequests.length === 0) {
    return 0;
  }

  for await (const pullRequest of duePullRequests) {
    try {
      await octokit.pulls.merge({
        owner,
        repo,
        pull_number: pullRequest.number,
        merge_method: mergeMethod,
      });

      // find check runs by the Merge schedule action
      const checkRuns = await octokit.paginate(octokit.checks.listForRef, {
        owner,
        repo,
        ref: pullRequest.ref,
      });

      const checkRun = checkRuns.pop();
      if (!checkRun) continue;

      await octokit.checks.update({
        check_run_id: checkRun.id,
        owner,
        repo,
        name: "Merge Schedule",
        head_sha: pullRequest.headSha,
        conclusion: "success",
        output: {
          title: `Scheduled on ${pullRequest.scheduledDate}`,
          summary: "Merged successfully",
        },
      });

      core.info(`${pullRequest.html_url} merged`);
    } catch (err) {
      // Logging to see the error messages
      core.info(`Unable to merge ${pullRequest.html_url}`);
      core.info(`The Error is : ${err}`);
      
      // Setting value of pull request which unable to merge because of above error[Mostly merge conflict]
      // Setting in MC_PR_NO which can be used in Github action
      core.info(`::set-output name=MC_PR_NO::${pullRequest.html_url}`);

      // find check runs by the Merge schedule action
      const checkRuns = await octokit.paginate(octokit.checks.listForRef, {
        owner,
        repo,
        ref: pullRequest.ref,
      });

      const checkRun = checkRuns.pop();
      if (!checkRun) continue;

      await octokit.checks.update({
        check_run_id: checkRun.id,
        owner,
        repo,
        name: "Merge Schedule",
        head_sha: pullRequest.headSha,
        conclusion: "failure",
        output: {
          title: `Scheduled on ${pullRequest.scheduledDate}`,
          summary: "Failed to merge",
        },
      });
      return `${pullRequest.html_url}`;
    }
  }
  return 0;
}

function hasScheduleCommand(pullRequest) {
  return /(^|\n)\/schedule /.test(pullRequest.body);
}

function isntFromFork(pullRequest) {
  return !pullRequest.head.repo.fork;
}

function getScheduleDateString(text) {
  return text.match(/(^|\n)\/schedule (.*)/).pop();
}
