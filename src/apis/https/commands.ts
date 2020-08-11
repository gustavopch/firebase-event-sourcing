import cors from 'cors'
import express from 'express'
import firebaseAdmin from 'firebase-admin'
import * as functions from 'firebase-functions'

import { ApplicationDefinition } from '../../application/application-definition'
import { Command } from '../../elements/command'
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
    const command: Command = {
      contextName: req.body.contextName,
      aggregateName: req.body.aggregateName,
      aggregateId: req.body.aggregateId,
      name: req.body.name,
      data: req.body.data,
    }

    const result = await processCommand(eventStore, application, command, {
      userId: req.userId,
      ip: req.ip,
      userAgent: req.header('User-Agent'),
      location: parseLocationFromHeaders(req),
    })

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
  })

  return functions.https.onRequest(app)
}
