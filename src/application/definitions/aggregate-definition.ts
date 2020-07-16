import { CommandHandler } from '../../elements/command-handler'

export type AggregateDefinition = {
  commands: {
    [commandName: string]: CommandHandler<any>
  }
}
