import cors from 'cors'
import express from 'express'
import firebaseAdmin from 'firebase-admin'
import * as functions from 'firebase-functions'

import { ApplicationDefinition } from '../../application/application-definition'
import { CommandWithMetadata } from '../../elements/command-with-metadata'
import { processCommand } from '../../logic/process-command'
import { createEventStore } from '../../stores/event-store'
import { validateFirebaseIdToken } from './middlewares/validate-firebase-id-token'
import { parseLocationFromHeaders } from './utils/parse-location-from-headers'

export const createCommandsEndpoint = (
  firebaseAdminApp: firebaseAdmin.app.App,
  application: ApplicationDefinition,
): functions.HttpsFunction => {
  const app = express()
  app.set('trust proxy', true)
  app.use(cors({ origin: true }))
  app.use(validateFirebaseIdToken(firebaseAdminApp))

  const eventStore = createEventStore(firebaseAdminApp)

  app.post('/', async (req, res) => {
    try {
      const command: CommandWithMetadata = {
        contextName: req.body.contextName,
        aggregateName: req.body.aggregateName,
        aggregateId: req.body.aggregateId,
        name: req.body.name,
        data: req.body.data,
        metadata: {
          causationId: null,
          correlationId: null,
          client: {
            userId: req.userId || null,
            ip: req.ip || null,
            ua: req.header('User-Agent') || null,
            location: parseLocationFromHeaders(req),
          },
        },
      }

      const result = await processCommand(eventStore, application, command)

      if (!result.ok && result.reason === 'aggregate-not-found') {
        const message = `Aggregate '${command.contextName}.${command.aggregateName}' not found`
        console.log(message)
        res.status(422).send(message)
        return
      }

      if (!result.ok && result.reason === 'command-handler-not-found') {
        const message = `Command handler for '${command.contextName}.${command.aggregateName}.${command.name}' not found`
        console.log(message)
        res.status(422).send(message)
        return
      }

      if (!result.ok && result.reason === 'unauthorized') {
        const message = 'Unauthorized'
        console.log(message)
        res.status(403).send(message)
        return
      }

      res.status(201).send({ eventId: result.eventId })
      return
    } catch (error) {
      console.error('Error while handling command:', error)
      res.status(500).send()
      return
    }
  })

  return functions.https.onRequest(app)
}
