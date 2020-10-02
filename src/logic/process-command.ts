import { EventStore } from '../stores/event-store'
import { ApplicationDefinition } from '../types/application'
import { CommandWithMetadata } from '../types/command'
import { runProjections } from './run-projections'
import { runReactions } from './run-reactions'

export const processCommand = async (
  eventStore: EventStore,
  applicationDefinition: ApplicationDefinition,
  command: CommandWithMetadata,
): Promise<{ eventId: string }> => {
  const aggregateDefinition =
    applicationDefinition.domain[command.contextName]?.[command.aggregateName]

  if (!aggregateDefinition) {
    const error = new Error()
    error.name = 'AggregateNotFound'
    error.message = `Aggregate '${command.contextName}.${command.aggregateName}' not found`
    throw error
  }

  const commandDefinition = aggregateDefinition.commands[command.name]

  if (!commandDefinition) {
    const error = new Error()
    error.name = 'CommandHandlerNotFound'
    error.message = `Command handler for '${command.contextName}.${command.aggregateName}.${command.name}' not found`
    throw error
  }

  const isAuthorized = (await commandDefinition.isAuthorized?.(command)) ?? true

  if (!isAuthorized) {
    const error = new Error()
    error.name = 'Unauthorized'
    error.message = 'Unauthorized'
    throw error
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

  await runProjections(applicationDefinition, event)

  await runReactions(eventStore, applicationDefinition, event)

  return { eventId }
}
