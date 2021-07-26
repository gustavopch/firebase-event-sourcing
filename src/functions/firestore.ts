import * as functions from 'firebase-functions'

import { Trigger } from '../constants'
import { createLoggerService } from '../services/logger'
import { AppDefinition } from '../types/app'
import { Services } from '../types/service'

type FirestoreFunctions = {
  [functionName: string]: functions.CloudFunction<any>
}

export const createFirestoreFunctions = (
  appDefinition: AppDefinition,
): FirestoreFunctions => {
  const loggerService = createLoggerService(null)
  const userlandServices = (appDefinition.services?.({
    logger: loggerService,
  }) ?? {}) as Services

  const firestoreFunctions: FirestoreFunctions = {}

  for (const [viewName, view] of Object.entries(appDefinition.views)) {
    const viewNameInKebabCase = viewName
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()

    const createHandler = view.reactions?.[Trigger.CREATE]
    const updateHandler = view.reactions?.[Trigger.UPDATE]
    const deleteHandler = view.reactions?.[Trigger.DELETE]
    const writeHandler = view.reactions?.[Trigger.WRITE]

    if (createHandler) {
      firestoreFunctions[`${viewNameInKebabCase}-create`] = functions.firestore
        .document(viewName)
        .onCreate(async snap => {
          await createHandler(snap.data(), {
            logger: loggerService,
            ...userlandServices,
          })
        })
    }

    if (updateHandler) {
      firestoreFunctions[`${viewNameInKebabCase}-update`] = functions.firestore
        .document(viewName)
        .onUpdate(async change => {
          await updateHandler(
            {
              before: change.before.data(),
              after: change.after.data(),
            },
            {
              logger: loggerService,
              ...userlandServices,
            },
          )
        })
    }

    if (deleteHandler) {
      firestoreFunctions[`${viewNameInKebabCase}-delete`] = functions.firestore
        .document(viewName)
        .onDelete(async snap => {
          await deleteHandler(snap.data(), {
            logger: loggerService,
            ...userlandServices,
          })
        })
    }

    if (writeHandler) {
      firestoreFunctions[`${viewNameInKebabCase}-write`] = functions.firestore
        .document(viewName)
        .onWrite(async change => {
          await writeHandler(
            {
              before: change.before.data() ?? null,
              after: change.after.data() ?? null,
            },
            {
              logger: loggerService,
              ...userlandServices,
            },
          )
        })
    }
  }

  return firestoreFunctions
}
