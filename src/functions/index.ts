import firebaseAdmin from 'firebase-admin'

import { ApplicationDefinition } from '../types/application'
import { createCommandsEndpoint } from './https/commands'
import { createCronJobFirebaseFunctions } from './pubsub/cron-jobs'

export const createFunctions = <
  TApplicationDefinition extends ApplicationDefinition
>(
  firebaseAdminApp: firebaseAdmin.app.App,
  application: TApplicationDefinition,
) => {
  const cronJobs = createCronJobFirebaseFunctions(firebaseAdminApp, application)

  return {
    commands: createCommandsEndpoint(firebaseAdminApp, application),
    ...cronJobs,
  }
}
