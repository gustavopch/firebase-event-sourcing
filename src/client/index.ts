import firebase from 'firebase/app'
import 'firebase/auth'

import { AppDefinition } from '../types/app'

export type Client<TAppDefinition extends AppDefinition> = {
  dispatch: <
    TContextName extends keyof TAppDefinition['domain'],
    TAggregateName extends keyof TAppDefinition['domain'][TContextName],
    TCommandName extends keyof TAppDefinition['domain'][TContextName][TAggregateName]['commands']
  >(params: {
    contextName: TContextName
    aggregateName: TAggregateName
    aggregateId: string
    name: TCommandName
    data: Parameters<TAppDefinition['domain'][TContextName][TAggregateName]['commands'][TCommandName]>[0] // prettier-ignore
  }) => Promise<{ eventId: string }>
}

export const createClient = <TAppDefinition extends AppDefinition>(
  firebaseApp: firebase.app.App,
  options: {
    baseUrl: string
  },
): Client<TAppDefinition> => {
  return {
    dispatch: async ({
      contextName,
      aggregateName,
      aggregateId,
      name,
      data,
    }) => {
      const idToken = await firebaseApp.auth().currentUser?.getIdToken()

      const res = await fetch(`${options.baseUrl}/commands`, {
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
