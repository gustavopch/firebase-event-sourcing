import firebase from 'firebase-admin'

import { ApplicationDefinition } from '../types/application'
import { createCommandsEndpoint } from './https/commands'
import { createCronJobFirebaseFunctions } from './pubsub/cron-jobs'

export const createFunctions = <
  TApplicationDefinition extends ApplicationDefinition
>(
  firebaseApp: firebase.app.App,
  applicationDefinition: TApplicationDefinition,
) => {
  const cronJobs = createCronJobFirebaseFunctions(firebaseApp, applicationDefinition) // prettier-ignore

  return {
    commands: createCommandsEndpoint(firebaseApp, applicationDefinition),
    ...cronJobs,
  }
}
