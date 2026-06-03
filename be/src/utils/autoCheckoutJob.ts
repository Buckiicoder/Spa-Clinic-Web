import * as timekeepingService from "../services/timekeeping.service.js";
import * as overtimeService from "../services/overtime.service.js";

export const autoCheckoutJob =
  async () => {
    const records =
      await timekeepingService.getNeedAutoCheckout();

    for (const item of records) {
      try {
        const checkoutTime =
          item.final_checkout;

        const calc =
          await timekeepingService.calculateCheckoutData(
            item.id,
            checkoutTime,
          );

        await timekeepingService.updateTimekeepingAndReturn(
          item.id,
          {
            status: "COMPLETED",

            check_out_time:
              checkoutTime.toISOString(),
          },
          {
            work_minutes:
              calc.workMinutes,

            ot_minutes:
              calc.actualOtMinutes,

            break_minutes:
              calc.breakMinutes,

            is_full_work:
              calc.isFullWork,
          },
        );

        if (calc.approvedOt) {
          await overtimeService.completeApprovedOt(
            calc.approvedOt.id,
            {
              actual_ot_minutes:
                calc.actualOtMinutes,

              approved_end_time:
                calc.actualOtMinutes > 0
                  ? new Date(
                      calc.shiftEnd.getTime()
                        +
                        calc.actualOtMinutes *
                          60000,
                    ).toISOString()
                  : null,

              shift_end_time:
                calc.shiftEnd.toISOString(),

              is_locked: true,
            },
          );
        }
      } catch (err) {
        console.error(err);
      }
    }
  };