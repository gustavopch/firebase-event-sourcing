import { FlowService } from '../services/flow'
import { Event } from './event'

export type FlowCronHandler = (flow: FlowService) => Promise<void>

export type FlowReactionHandler<TEvent extends Event> = (
  event: TEvent,
  services: { flow: FlowService },
) => Promise<void>

export type FlowDefinition = {
  cron?: {
    [jobName: string]: FlowCronHandler
  }

  reactions?: {
    [eventName: string]: FlowReactionHandler<Event<any>>
  }
}
