import * as timekeepingService
from "../services/timekeeping.service.js";

export const autoAssignFulltimeOffJob =
  async () => {

    const periods =
      await timekeepingService.getExpiredSchedulePeriods();

    for (const period of periods) {

      const employees =
        await timekeepingService.getFulltimeWithoutRegister(
          period.month,
          period.year,
        );

      for (const emp of employees) {

        try {

          await timekeepingService.autoAssignFulltimeOffDays(
            emp.user_id,
            period.month,
            period.year,
          );

        } catch (err) {
          console.error(err);
        }
      }
    }
  };