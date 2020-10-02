import firebase from 'firebase-admin'

import { FlowDefinition } from '../../../src'
import { getEmailService } from '../services/email-service'
import { REPORTS, Report, TOTALS_ID } from '../views/reports'

export const everyNightSendReportEmail: FlowDefinition = {
  cron: {
    'every day 01:00': async flow => {
      const db = firebase.firestore()
      const emailService = getEmailService()

      const reportSnap = await db.collection(REPORTS).doc(TOTALS_ID).get()
      const report = reportSnap.data() as Report

      await emailService.send({
        to: 'admin@example.com',
        body: `We have ${report.orderCount} orders until now.`,
      })
    },
  },
}
