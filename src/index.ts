export { createClient } from './client'
export type {
  AggregateDefinition,
  GetInitialAggregateState,
} from './types/aggregate'
export type {
  Command,
  CommandData,
  CommandDefinition,
  CommandMetadata,
  CommandWithMetadata,
} from './types/command'
export type {
  Event,
  EventData,
  EventDefinition,
  EventMetadata,
} from './types/event'
export type { FlowDefinition } from './types/flow'
export type { ViewDefinition } from './types/view'
export { flatten } from './utils/flatten'
