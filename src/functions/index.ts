import firebase from 'firebase-admin'

import { AppDefinition } from '../types/app'
import { createCommandsEndpoint } from './https/commands'
import { createPubsubFunctions } from './pubsub'

export const createFunctions = <TAppDefinition extends AppDefinition>(
  firebaseApp: firebase.app.App,
  appDefinition: TAppDefinition,
) => {
  const pubsubFunctions = createPubsubFunctions(firebaseApp, appDefinition)

  return {
    commands: createCommandsEndpoint(firebaseApp, appDefinition),
    ...pubsubFunctions,
  }
}
