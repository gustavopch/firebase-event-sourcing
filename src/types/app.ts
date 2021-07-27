import { AggregateDefinition } from './aggregate'
import { Event } from './event'
import { FlowDefinition } from './flow'
import { ServiceContext, Services } from './service'
import { ViewDefinition } from './view'

export type AppDefinition = {
  domain: {
    [aggregateName: string]: AggregateDefinition
  }

  flows: {
    [flowName: string]: FlowDefinition<any>
  }

  views: {
    [viewName: string]: ViewDefinition<any, Event<any>>
  }

  services?: (ctx: ServiceContext) => Services
}
