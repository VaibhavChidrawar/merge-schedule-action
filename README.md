# merge-schedule-action

> GitHub Action to merge pull requests on a scheduled date and time.

## How to use merge-schedule-action

### Github Action Example

Create `.github/workflows/merge-schedule.yml`

```yml
name: Scheduled PR Merge
on:
  pull_request:
    types:
      - opened
      - edited
      - synchronize
      - labeled
      - unlabeled
  schedule:
    # https://crontab.guru/every-hour
    - cron: 0 * * * *

jobs:
  scheduled_PR_Merge_job:
    name: Scheduled PR Merge Job
    runs-on: ubuntu-latest
    outputs:
      mergedPRs: ${{ steps.mainActionStep.outputs.MPR_LIST }}
      mergeFailPR: ${{ steps.mainActionStep.outputs.MC_PR_NO }}
    steps:
      - id: mainActionStep
        uses: VaibhavChidrawar/merge-schedule-action@env-var
        with:
          # Merge method to use. Possible values are merge, squash or
          # rebase. Default is merge.
          merge_method: squash
          #  Time zone to use. Default is UTC.
          time_zone: "Asia/Tokyo"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  display_PR_status_job:
    name: Show status of PR
    runs-on: ubuntu-latest
    needs: scheduled_PR_Merge_job
    steps:
      - run: echo ${{needs.scheduled_PR_Merge_job.outputs.mergedPRs}} ${{needs.scheduled_PR_Merge_job.outputs.mergeFailPR}}
```

### How to schedule actual PR using schedule command

In your pull requests, add a line to the end of the pull request description like this,

```
/schedule 2021-08-05
```

Or if you need a more precise, timezone-safe setting, you can use an ISO 8601 date string

```
/schedule 2021-08-05T10:10:00
```

Any string that works with the [`new Date()` constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date) will work.

### How to set CRON Job

To control at which time of the day you want the pull request to be merged, I recommend to adapt the `- cron: ...` setting in the workflow file. Refer https://crontab.guru/

### How to get merged and failed PR URL

Get the list of PR's which successfully merged in `MPR_LIST` variable. `Default value is 0.`

Get failed PR URL in `MC_PR_NO` variable. `Default value is 0.`

### Note

The action sets a pending commit status if the pull request was recognized as being scheduled.

The pull requests from forks are ignored for security reasons.

## License

[ISC](LICENSE)
