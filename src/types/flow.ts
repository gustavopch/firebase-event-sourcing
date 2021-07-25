import { FlowService } from '../services/flow'
import { LoggerService } from '../services/logger'
import { Event } from './event'
import { Services } from './service'

export type FlowContext = Services & {
  flow: FlowService
  logger: LoggerService
}

export type FlowCronHandler = (context: FlowContext) => Promise<void>

export type FlowReactionHandler<TEvent extends Event> = (
  event: TEvent,
  context: FlowContext,
) => Promise<void>

export type FlowDefinition = {
  cron?: {
    [jobName: string]: FlowCronHandler
  }

  reactions?: {
    [eventName: string]: FlowReactionHandler<Event<any>>
  }
}
