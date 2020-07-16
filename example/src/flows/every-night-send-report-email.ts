import { defineFlow } from '../../../src'
import { getEmailService } from '../services/email-service'
import { reports } from '../views/reports'

export const everyNightSendReportEmail = defineFlow({
  cron: {
    'every day 01:00': async manager => {
      const emailService = getEmailService()

      const report = await manager.runQuery(reports.queries.getTotals)

      await emailService.send({
        to: 'admin@example.com',
        body: `We have ${report.orderCount} orders until now.`,
      })
    },
  },
})
