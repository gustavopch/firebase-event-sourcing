import { EventStore } from '../stores/event-store'
import { ApplicationDefinition } from '../types/application'
import { CommandWithMetadata } from '../types/command'
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

  const eventId = await eventStore.saveEvent(
    {
      contextName: command.contextName,
      aggregateName: command.aggregateName,
      aggregateId: command.aggregateId,
      name: eventName,
      data: eventData,
      causationId: command.metadata.causationId,
      correlationId: command.metadata.correlationId,
      client: command.metadata.client,
    },
    event => {
      const eventDefinition = aggregateDefinition.events?.[event.name]
      return eventDefinition?.handle?.(event) ?? {}
    },
  )
  const event = (await eventStore.getEvent(eventId))!
  console.log('Saved event:', event)

  await runProjections(application, event)

  await runReactions(eventStore, application, event)

  return {
    ok: true,
    eventId,
  }
}
