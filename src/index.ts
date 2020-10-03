export { createApp } from './app'
export { createClient } from './client'
export { createFunctions } from './functions'
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
