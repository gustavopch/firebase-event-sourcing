import type firebaseAdmin from 'firebase-admin'

import { Event } from '../elements/event'
import { ViewsDefinition } from './definitions/views-definition'

type TriggerProjectionsFn = (event: Event) => Promise<void>

export const createProjectionsTriggerer = (
  firebaseApp: firebase.app.App | firebaseAdmin.app.App,
  views: ViewsDefinition,
): TriggerProjectionsFn => {
  return async event => {
    const promises = []

    for (const view of Object.values(views)) {
      for (const [name, handler] of Object.entries(view.projections)) {
        if (name === event.name) {
          promises.push(handler(event))
        }
      }
    }

    await Promise.all(promises)
  }
}
