import { AggregateDefinition } from './definitions/aggregate-definition'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const defineAggregate = <
  TAggregateDefinition extends AggregateDefinition
>(
  aggregate: TAggregateDefinition,
) => {
  return aggregate
}
