import { Command } from './command'
import { CommandMetadata } from './command-metadata'

export type CommandWithMetadata = Command & {
  metadata: CommandMetadata
}
