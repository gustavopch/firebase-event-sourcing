import firebaseAdmin from 'firebase-admin'

import { defineFlow } from '../../../src'
import { getEmailService } from '../services/email-service'
import { REPORTS, Report, TOTALS_ID } from '../views/reports'

export const everyNightSendReportEmail = defineFlow({
  cron: {
    'every day 01:00': async manager => {
      const db = firebaseAdmin.firestore()
      const emailService = getEmailService()

      const reportSnap = await db.collection(REPORTS).doc(TOTALS_ID).get()
      const report = reportSnap.data() as Report

      await emailService.send({
        to: 'admin@example.com',
        body: `We have ${report.orderCount} orders until now.`,
      })
    },
  },
})
