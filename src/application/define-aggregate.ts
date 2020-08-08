import { AggregateDefinition } from './definitions/aggregate-definition'

export const defineAggregate = <
  TAggregateDefinition extends AggregateDefinition
>(
  aggregate: TAggregateDefinition,
) => {
  return aggregate
}
