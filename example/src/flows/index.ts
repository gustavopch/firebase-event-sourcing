import { everyNightSendReportEmail } from './every-night-send-report-email'
import { ifOrderPlacedThenSendEmail } from './if-order-placed-then-send-email'

export const flows = {
  everyNightSendReportEmail,
  ifOrderPlacedThenSendEmail,
}
