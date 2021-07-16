import { AggregateDefinition } from './aggregate'
import { FlowDefinition } from './flow'
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
}
