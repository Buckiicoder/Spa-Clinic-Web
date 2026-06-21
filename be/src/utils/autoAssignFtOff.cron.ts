import cron from "node-cron";

import { autoAssignFulltimeOffJob } from "./autoAssignFtOff.js";

export const startAutoAssignFulltimeOffCron =
  () => {

    cron.schedule(
      "0 1 * * *",
      async () => {
        await autoAssignFulltimeOffJob();
      },
    );

    console.log(
      "Auto Assign Fulltime Off Cron Started",
    );
  };