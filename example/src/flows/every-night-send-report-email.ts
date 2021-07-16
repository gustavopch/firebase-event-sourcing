import { FlowDefinition } from '../../../src'
import { getEmailService } from '../services/email-service'
import { Report, TOTALS_ID, reportsCollection } from '../views/reports'

export const everyNightSendReportEmail: FlowDefinition = {
  cron: {
    'every day 01:00': async flow => {
      const emailService = getEmailService()

      const reportSnap = await reportsCollection().doc(TOTALS_ID).get()
      const report = reportSnap.data() as Report

      await emailService.send({
        to: 'admin@example.com',
        body: `We have ${report.orderCount} orders until now.`,
      })
    },
  },
}
