import { Event } from '../types/event'

export const getFullyQualifiedEventName = (event: Event): string => {
  return `${event.aggregateName}.${event.name}`
}
