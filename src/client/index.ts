import { DomainDefinition } from '../application/domain-definition'

export type Client<TDomainDefinition extends DomainDefinition> = {
  sendCommand: <
    TContextName extends keyof TDomainDefinition,
    TAggregateName extends keyof TDomainDefinition[TContextName],
    TCommandName extends keyof TDomainDefinition[TContextName][TAggregateName]['commands']
  >(params: {
    contextName: TContextName
    aggregateName: TAggregateName
    aggregateId: string
    name: TCommandName
    data: Parameters<
      TDomainDefinition[TContextName][TAggregateName]['commands'][TCommandName]
    >[0]
  }) => Promise<{ eventId: string }>
}

export const createClient = <
  TDomainDefinition extends DomainDefinition
>(options: {
  baseUrl: string
}): Client<TDomainDefinition> => {
  return {
    sendCommand: async ({ aggregateName, aggregateId, name, data }) => {
      const url = `${options.baseUrl}/${String(name)}`

      const res = await window.fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aggregateName,
          aggregateId,
          name,
          data,
        }),
      })

      if (!res.ok) {
        throw new Error('Command rejected')
      }

      return res.json()
    },
  }
}
