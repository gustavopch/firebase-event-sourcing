import { CommandData } from './command-data'

export type CommandHandler<TCommandData extends CommandData> = (
  data: TCommandData,
) => {
  name: string
  data: TCommandData
}
