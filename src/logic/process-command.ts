import { ApplicationDefinition } from '../application/application-definition'
import { CommandWithMetadata } from '../elements/command-with-metadata'
import { EventStore } from '../stores/event-store'
import { runProjections } from './run-projections'
import { runReactions } from './run-reactions'

export const processCommand = async (
  eventStore: EventStore,
  application: ApplicationDefinition,
  command: CommandWithMetadata,
): Promise<
  | { ok: false; reason: 'aggregate-not-found' }
  | { ok: false; reason: 'command-handler-not-found' }
  | { ok: false; reason: 'unauthorized' }
  | { ok: true; eventId: string }
> => {
  const aggregateDefinition =
    application.domain[command.contextName]?.[command.aggregateName]

  if (!aggregateDefinition) {
    return {
      ok: false,
      reason: 'aggregate-not-found',
    }
  }

  const commandDefinition = aggregateDefinition.commands[command.name]

  if (!commandDefinition) {
    return {
      ok: false,
      reason: 'command-handler-not-found',
    }
  }

  const isAuthorized = await commandDefinition.isAuthorized(command)

  if (!isAuthorized) {
    return {
      ok: false,
      reason: 'unauthorized',
    }
  }

  const { name: eventName, data: eventData } = commandDefinition.handle(command)

  const eventId = await eventStore.saveEvent({
    contextName: command.contextName,
    aggregateName: command.aggregateName,
    aggregateId: command.aggregateId,
    name: eventName,
    data: eventData,
    causationId: command.metadata.causationId,
    correlationId: command.metadata.correlationId,
    client: command.metadata.client,
  })
  const event = (await eventStore.getEvent(eventId))!
  console.log('Saved event:', event)

  const eventDefinition = aggregateDefinition.events[event.name]

  if (eventDefinition) {
    const snapshot = await eventStore.getSnapshot(command.aggregateId)
    const revision = snapshot?.revision ?? 0

    const state = await eventDefinition.handle(event)

    await eventStore.saveSnapshot({
      aggregateId: command.aggregateId,
      revision: revision + 1, // TODO: Increment within a transaction
      state,
    })
  }

  await runProjections(application, event)

  await runReactions(eventStore, application, event)

  return {
    ok: true,
    eventId,
  }
}
