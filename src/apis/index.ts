import firebaseAdmin from 'firebase-admin'

import { ApplicationDefinition } from '../application/definitions/application-definition'
import { createCommandsEndpoint } from './https/commands'
import { createCronJobFirebaseFunctions } from './pubsub/cron-jobs'
import { createProcessJobsFirebaseFunction } from './pubsub/process-jobs'

export const createFunctions = <
  TApplicationDefinition extends ApplicationDefinition
>(
  firebaseAdminApp: firebaseAdmin.app.App,
  application: TApplicationDefinition,
) => {
  const processJobs = createProcessJobsFirebaseFunction(
    firebaseAdminApp,
    application.domain,
  )

  const cronJobs = createCronJobFirebaseFunctions(
    firebaseAdminApp,
    application.flows,
  )

  return {
    commands: createCommandsEndpoint(
      firebaseAdminApp,
      application.domain,
      application.flows,
      application.views,
    ),
    processJobs,
    ...cronJobs,
  }
}
