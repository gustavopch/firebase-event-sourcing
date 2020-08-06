import { CommandData } from './command-data'

export type Command<TCommandData extends CommandData = CommandData> = {
  aggregateName: string
  aggregateId: string
  name: string
  data: TCommandData
}
