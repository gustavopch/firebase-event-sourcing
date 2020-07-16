import { ViewStore } from '../stores/view-store'
import { Event } from './event'

export type ProjectionHandler<TEvent extends Event> = (
  store: ViewStore,
  event: TEvent,
) => Promise<void>
