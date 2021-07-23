import { AggregateDefinition } from './aggregate'
import { FlowDefinition } from './flow'
import { ServiceContext, Services } from './service'
import { ViewDefinition } from './view'

export type AppDefinition = {
  domain: {
    [aggregateName: string]: AggregateDefinition
  }

  flows: {
    [flowName: string]: FlowDefinition
  }

  views: {
    [viewName: string]: ViewDefinition
  }

  services?: (ctx: ServiceContext) => Services
}
