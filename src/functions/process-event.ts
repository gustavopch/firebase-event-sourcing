import firebaseAdmin from 'firebase-admin'
import * as functions from 'firebase-functions'

import { FlowsDefinition } from '../application/definitions/flows-definition'
import { ViewsDefinition } from '../application/definitions/views-definition'
import { createProjectionsTriggerer } from '../application/projections-triggerer'
import { createReactionsTriggerer } from '../application/reactions-triggerer'
import { Event } from '../elements/event'
import { createEventStore } from '../stores/event-store'
import { EVENTS } from '../stores/event-store/constants'

export const createProcessEventFirebaseFunction = (
  firebaseAdminApp: firebaseAdmin.app.App,
  flows: FlowsDefinition,
  views: ViewsDefinition,
): functions.CloudFunction<functions.firestore.QueryDocumentSnapshot> => {
  return functions.firestore
    .document(`${EVENTS}/{eventId}`)
    .onCreate(async (snap, ctx) => {
      const event = snap.data() as Event

      // Background functions (like this one, triggered by Firestore) are invoked
      // *at least once*[1]. In case the incoming event was already processed by
      // another invocation, we don't want to process it again.
      // [1] https://cloud.google.com/functions/docs/concepts/exec#execution_guarantees
      if (event.metadata.status !== 'pending') {
        console.log(
          `Skipped processing event "${event.id}" for aggregate "${event.aggregateName}"; ` +
            `already processed (status "${event.metadata.status}")`,
        )
        return
      }

      const eventStore = createEventStore(firebaseAdminApp)

      const triggerProjections = createProjectionsTriggerer(
        firebaseAdminApp,
        views,
      )

      const triggerReactions = createReactionsTriggerer(
        firebaseAdminApp,
        flows,
        event,
      )

      try {
        // Invocation ordering is not guaranteed[1]. Suppose a client saved two
        // events almost at the same time:
        // - 'product.created' (revision: 4)
        // - 'product.updated' (revision: 5)
        // It may happen that the events are processed in the inverted order:
        // - 'product.updated' (revision: 5)
        // - 'product.created' (revision: 4)
        // Obviously, that would be problematic. We can't update something that
        // wasn't even created. So whenever an event triggers this function in
        // the wrong order, that event is skipped. When the next event is
        // processed, we'll also process any other events are 'pending' for the
        // given aggregate. For example:
        // - The function is invoked with 'product.updated' (revision: 5), but
        //   the current revision of the aggregate is 3. Of course, we can't
        //   bump the revision from 3 directly to 5, so processing is skipped.
        // - The function is invoked with 'product.created' (revision: 4). It
        //   will be successfully processed and will also try to process all
        //   other 'pending' events of that aggregate.
        // [1] https://firebase.google.com/docs/functions/firestore-events
        const nextRevision = event.metadata.revision + 1
        const storedButYetUnprocessedEvents: Event[] = []
        await eventStore.getReplayForAggregate(
          event.aggregateId,
          nextRevision,
          event => {
            storedButYetUnprocessedEvents.push(event)
          },
          { status: 'pending' },
        )

        const events = [event, ...storedButYetUnprocessedEvents]
        for (const event of events) {
          console.log(
            `Processing event ${event.name} (${event.id}) ` +
              `for aggregate ${event.aggregateName} (${event.aggregateId})`,
          )

          const aggregate = await eventStore.getAggregateSnapshot(event.aggregateId) // prettier-ignore

          if (!aggregate && event.metadata.revision !== 1) {
            throw new Error(
              `Can't update aggregate to revision ${event.metadata.revision} ` +
                "as the aggregate snapshot wasn't found",
            )
          }

          const aggregateRevision = aggregate?.revision ?? 0
          if (event.metadata.revision !== aggregateRevision + 1) {
            throw new Error(
              `Can't update aggregate to revision ${event.metadata.revision} ` +
                `as its current revision is ${aggregateRevision}`,
            )
          }

          await eventStore.saveAggregateSnapshot({
            aggregateId: event.aggregateId,
            revision: event.metadata.revision,
          })

          try {
            await triggerProjections(event)

            await triggerReactions(event)

            await eventStore.markEventAsApproved(event)
          } catch (error) {
            await eventStore.markEventAsFailed(event)
            console.error(`Event ${event.name} (${event.id}) failed:`, error)
          }
        }
      } catch (error) {
        console.error(error)
      }
    })
}
