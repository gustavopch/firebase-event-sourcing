import firebase from 'firebase-admin'

import { FlowDefinition } from '../../../src'
import { getEmailService } from '../services/email'
import { TOTALS_ID } from '../views/reports'

export const everyNightSendReportEmail: FlowDefinition = {
  cron: {
    'every day 01:00': async flow => {
      const emailService = getEmailService()

      const reportSnap = await firebase
        .firestore()
        .collection('reports')
        .doc(TOTALS_ID)
        .get()
      const report = reportSnap.data() as Views.Reports.Report

      await emailService.send({
        to: 'admin@example.com',
        body: `We have ${report.orderCount} orders until now.`,
      })
    },
  },
}
