import { AggregateDefinition } from './aggregate-definition'
import { FlowDefinition } from './flow-definition'
import { ViewDefinition } from './view-definition'

export type ApplicationDefinition = {
  domain: {
    [contextName: string]: {
      [aggregateName: string]: AggregateDefinition
    }
  }

  flows: {
    [flowName: string]: FlowDefinition
  }

  views: {
    [viewName: string]: ViewDefinition
  }
}
