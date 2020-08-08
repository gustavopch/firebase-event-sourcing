import { DomainDefinition } from './domain-definition'
import { FlowsDefinition } from './flows-definition'
import { ViewsDefinition } from './views-definition'

export type ApplicationDefinition = {
  domain: DomainDefinition
  flows: FlowsDefinition
  views: ViewsDefinition
}
