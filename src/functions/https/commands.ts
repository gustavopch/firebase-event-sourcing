import Ajv from 'ajv'
import cors from 'cors'
import express from 'express'
import firebase from 'firebase-admin'
import * as functions from 'firebase-functions'

import { processCommand } from '../../logic/process-command'
import { createEventStore } from '../../stores/event-store'
import { ApplicationDefinition } from '../../types/application'
import { CommandWithMetadata } from '../../types/command'
import { validateFirebaseIdToken } from './middlewares/validate-firebase-id-token'
import { parseLocationFromHeaders } from './utils/parse-location-from-headers'

const commandSchema = {
  type: 'object',
  properties: {
    contextName: {
      type: 'string',
      minLength: 1,
    },
    aggregateName: {
      type: 'string',
      minLength: 1,
    },
    aggregateId: {
      type: 'string',
      minLength: 1,
    },
    name: {
      type: 'string',
      minLength: 1,
    },
    data: {
      type: ['object', 'null'],
      properties: {},
    },
  },
  required: ['contextName', 'aggregateName', 'aggregateId', 'name', 'data'],
  additionalProperties: false,
}

const ajv = new Ajv()
const validateCommand = ajv.compile(commandSchema)

export const createCommandsEndpoint = (
  firebaseApp: firebase.app.App,
  application: ApplicationDefinition,
): functions.HttpsFunction => {
  const app = express()
  app.set('trust proxy', true)
  app.use(cors({ origin: true }))
  app.use(validateFirebaseIdToken(firebaseApp))

  const eventStore = createEventStore(firebaseApp)

  app.post('/', async (req, res) => {
    try {
      const isCommandValid = await validateCommand(req.body)

      if (!isCommandValid) {
        console.error('Invalid command:', validateCommand.errors)
        res.status(422).send('Invalid command')
        return
      }

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

      const { eventId } = await processCommand(eventStore, application, command)

      res.status(201).send({ eventId })
    } catch (error) {
      if (error.name === 'AggregateNotFound') {
        console.log(error.message)
        res.status(422).send(error.message)
        return
      }

      if (error.name === 'CommandHandlerNotFound') {
        console.log(error.message)
        res.status(422).send(error.message)
        return
      }

      if (error.name === 'Unauthorized') {
        console.log(error.message)
        res.status(403).send(error.message)
        return
      }

      console.error('Error while handling command:', error)
      res.status(500).send()
    }
  })

  return functions.https.onRequest(app)
}
