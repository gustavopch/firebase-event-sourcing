export { createClient } from './client'
export type {
  Aggregate,
  AggregateData,
  AggregateDefinition,
  AggregateState,
  GetInitialAggregateState,
} from './types/aggregate'
export type {
  Command,
  CommandContext,
  CommandCreationProps,
  CommandData,
  CommandDefinition,
  CommandMetadata,
  CommandPreset,
  CommandWithMetadata,
} from './types/command'
export type {
  Event,
  EventCreationProps,
  EventData,
  EventDefinition,
  EventMetadata,
  EventPreset,
} from './types/event'
export type { FlowDefinition } from './types/flow'
export type { ProjectionContext, ViewDefinition } from './types/view'
export { flatten } from './utils/flatten'
export { generateId } from './utils/generate-id'
