import firebase from 'firebase/app'
import 'firebase/auth'

import { AppDefinition } from '../types/app'

export type Client<TAppDefinition extends AppDefinition> = {
  dispatch: <
    TAggregateName extends keyof TAppDefinition['domain'],
    TCommandName extends keyof TAppDefinition['domain'][TAggregateName]['commands'],
  >(
    aggregateName: TAggregateName,
    commandName: TCommandName,
    aggregateId: string,
    data: Parameters<TAppDefinition['domain'][TAggregateName]['commands'][TCommandName]['handle']>[1]['data'], // prettier-ignore
  ) => Promise<{ eventIds: string[] }>
}

export const createClient = <TAppDefinition extends AppDefinition>(
  firebaseApp: firebase.app.App,
  options: {
    functionsUrl: string
  },
): Client<TAppDefinition> => {
  return {
    dispatch: async (aggregateName, commandName, aggregateId, data) => {
      const idToken = await firebaseApp.auth().currentUser?.getIdToken()

      const res = await fetch(`${options.functionsUrl}/commands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          aggregateName,
          aggregateId,
          name: commandName,
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
