import { FlowService } from '../services/flow-service'
import { Event } from './event'

export type CronHandler = (flow: FlowService) => Promise<void>

export type ReactionHandler<TEvent extends Event> = (
  event: TEvent,
  services: { flow: FlowService },
) => Promise<void>

export type FlowDefinition = {
  cron?: {
    [jobName: string]: CronHandler
  }

  reactions?: {
    [eventName: string]: ReactionHandler<Event<any>>
  }
}
