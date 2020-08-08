import { CronHandler } from '../../elements/cron-handler'
import { Event } from '../../elements/event'
import { ReactionHandler } from '../../elements/reaction-handler'

export type FlowDefinition = {
  cron?: {
    [jobName: string]: CronHandler
  }

  reactions?: {
    [eventName: string]: ReactionHandler<Event<any, any>>
  }
}
