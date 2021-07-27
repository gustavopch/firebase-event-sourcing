import { FlowService } from '../services/flow'
import { LoggerService } from '../services/logger'
import { Event, ExtractFullyQualifiedEventName } from './event'
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

export type FlowDefinition<TEvent extends Event> = {
  cron?: {
    [jobName: string]: FlowCronHandler
  }

  reactions?: {
    [eventName in ExtractFullyQualifiedEventName<TEvent>]: FlowReactionHandler<
      TEvent extends {
        aggregateName: Split<eventName, '.'>[0]
        name: Split<eventName, '.'>[1]
      }
        ? TEvent
        : never
    >
  }
}
