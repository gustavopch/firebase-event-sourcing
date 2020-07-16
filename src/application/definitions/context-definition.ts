import { AggregateDefinition } from './aggregate-definition'

export type ContextDefinition = {
  [aggregateName: string]: AggregateDefinition
}
