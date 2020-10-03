import firebase from 'firebase-admin'

import { AppDefinition } from '../types/app'
import { createCommandsEndpoint } from './https/commands'
import { createCronJobFirebaseFunctions } from './pubsub/cron-jobs'

export const createFunctions = <TAppDefinition extends AppDefinition>(
  firebaseApp: firebase.app.App,
  appDefinition: TAppDefinition,
) => {
  const cronJobs = createCronJobFirebaseFunctions(firebaseApp, appDefinition)

  return {
    commands: createCommandsEndpoint(firebaseApp, appDefinition),
    ...cronJobs,
  }
}
