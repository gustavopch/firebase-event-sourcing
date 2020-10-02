import { FlowService } from '../services/flow-service'
import { Event } from './event'

export type ReactionHandler<TEvent extends Event> = (
  flow: FlowService,
  event: TEvent,
) => Promise<void>
