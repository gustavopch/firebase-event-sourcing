import firebase from 'firebase-admin'

import { FlowDefinition } from '../../../src'
import { TOTALS_ID, reports as reportsView } from '../views/reports'

export const everyNightSendReportEmail: FlowDefinition<never> = {
  cron: {
    'every day 01:00': async ctx => {
      const reportSnap = await firebase
        .firestore()
        .collection(reportsView.collectionName)
        .doc(TOTALS_ID)
        .get()
      const report = reportSnap.data() as Views.Reports.Report

      await ctx.email.send({
        to: 'admin@example.com',
        body: `We have ${report.orderCount} orders until now.`,
      })
    },
  },
}
