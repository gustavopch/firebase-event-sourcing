export { createClient } from './client'
export { Trigger } from './constants'
export { flatten } from './utils/flatten'
export { generateId } from './utils/generate-id'

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
export type { ServiceContext, Services } from './types/service'
export type {
  ViewDefinition,
  ViewProjectionContext,
  ViewReactionContext,
} from './types/view'
