import firebaseAdmin from 'firebase-admin'
import * as functions from 'firebase-functions'

import { ApplicationDefinition } from '../application/definitions/application-definition'
import { createProcessEventFirebaseFunction } from './firestore/process-event'
import { createCronJobFirebaseFunctions } from './pubsub/cron-jobs'
import { createProcessJobsFirebaseFunction } from './pubsub/process-jobs'

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

  const cronJobs = createCronJobFirebaseFunctions(
    firebaseAdminApp,
    application.flows,
  )

  return {
    processEvent,
    processJobs,
    ...cronJobs,
  }
}
