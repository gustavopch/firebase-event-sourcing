import { FlowManager } from '../services/flow-manager'
import { Event } from './event'

export type ReactionHandler<TEvent extends Event> = (
  manager: FlowManager,
  event: TEvent,
) => Promise<void>
