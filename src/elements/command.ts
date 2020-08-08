import { CommandData } from './command-data'

export type Command<
  TCommandName extends string = string,
  TCommandData extends CommandData = CommandData
> = {
  aggregateName: string
  aggregateId: string
  name: TCommandName
  data: TCommandData
}
