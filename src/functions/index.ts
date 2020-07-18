import firebaseAdmin from 'firebase-admin'
import * as functions from 'firebase-functions'

import { ApplicationDefinition } from '../application/definitions/application-definition'
import { createCronJobFirebaseFunctions } from './cron-jobs'
import { createProcessEventFirebaseFunction } from './process-event'
import { createProcessJobsFirebaseFunction } from './process-jobs'

type Functions = {
  processEvent: functions.CloudFunction<any>
  processJobs: functions.CloudFunction<any>
  [functionName: string]: functions.CloudFunction<any>
}

export const createFunctions = <
  TApplicationDefinition extends ApplicationDefinition
>(
  firebaseAdminApp: firebaseAdmin.app.App,
  application: TApplicationDefinition,
): Functions => {
  const processEvent = createProcessEventFirebaseFunction(
    firebaseAdminApp,
    application.flows,
    application.views,
  )

  const processJobs = createProcessJobsFirebaseFunction(
    firebaseAdminApp,
    application.domain,
  )

  return {
    processEvent,
    processJobs,
  }
}
