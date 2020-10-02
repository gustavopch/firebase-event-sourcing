import { Event } from '../elements/event'

export const getFullyQualifiedEventName = (event: Event): string => {
  return `${event.contextName}.${event.aggregateName}.${event.name}`
}
