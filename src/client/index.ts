import firebase from 'firebase/app'
import 'firebase/auth'

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
    sendCommand: async ({
      contextName,
      aggregateName,
      aggregateId,
      name,
      data,
    }) => {
      const url = `${options.baseUrl}/${String(name)}`
      const idToken = await firebase.auth().currentUser?.getIdToken()

      const res = await window.fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          contextName,
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
