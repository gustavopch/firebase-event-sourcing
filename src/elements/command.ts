import { CommandData } from './command-data'

export type Command<
  TProps extends {
    contextName: string
    aggregateName: string
    name: string
    data: CommandData
  } = {
    contextName: string
    aggregateName: string
    name: string
    data: CommandData
  }
> = {
  contextName: TProps['contextName']
  aggregateName: TProps['aggregateName']
  aggregateId: string
  name: TProps['name']
  data: TProps['data']
}
