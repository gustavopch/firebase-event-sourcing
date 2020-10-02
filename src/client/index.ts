import firebase from 'firebase/app'
import 'firebase/auth'

import { ApplicationDefinition } from '../types/application'

export type Client<TApplicationDefinition extends ApplicationDefinition> = {
  dispatch: <
    TContextName extends keyof TApplicationDefinition['domain'],
    TAggregateName extends keyof TApplicationDefinition['domain'][TContextName],
    TCommandName extends keyof TApplicationDefinition['domain'][TContextName][TAggregateName]['commands']
  >(params: {
    contextName: TContextName
    aggregateName: TAggregateName
    aggregateId: string
    name: TCommandName
    data: Parameters<
      TApplicationDefinition['domain'][TContextName][TAggregateName]['commands'][TCommandName]
    >[0]
  }) => Promise<{ eventId: string }>
}

export const createClient = <
  TApplicationDefinition extends ApplicationDefinition
>(options: {
  baseUrl: string
}): Client<TApplicationDefinition> => {
  return {
    dispatch: async ({
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
