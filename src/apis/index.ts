import firebaseAdmin from 'firebase-admin'

import { ApplicationDefinition } from '../application/application-definition'
import { createCommandsEndpoint } from './https/commands'
import { createCronJobFirebaseFunctions } from './pubsub/cron-jobs'

export const createFunctions = <
  TApplicationDefinition extends ApplicationDefinition
>(
  firebaseAdminApp: firebaseAdmin.app.App,
  application: TApplicationDefinition,
) => {
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
    ...cronJobs,
  }
}
