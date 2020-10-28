import Ajv from 'ajv'
import cors from 'cors'
import express from 'express'
import firebase from 'firebase-admin'
import * as functions from 'firebase-functions'

import { createApp } from '../../app'
import { AppDefinition } from '../../types/app'
import { CommandWithMetadata } from '../../types/command'
import { auth } from './middlewares/auth'
import { parseLocationFromHeaders } from './utils/parse-location-from-headers'

const contextNameSchema = {
  type: 'string',
  minLength: 1,
}

const aggregateNameSchema = {
  type: 'string',
  minLength: 1,
}

const aggregateIdSchema = {
  type: 'string',
  minLength: 1,
}

const nameSchema = {
  type: 'string',
  minLength: 1,
}

const dataSchema = {
  type: ['object', 'null'],
  properties: {},
}

const causationIdSchema = {
  type: 'string',
  minLength: 1,
}

const correlationIdSchema = {
  type: 'string',
  minLength: 1,
}

const metadataSchema = {
  type: 'object',
  properties: {
    causationId: causationIdSchema,
    correlationId: correlationIdSchema,
  },
  required: ['causationId', 'correlationId'],
  additionalProperties: false,
}

const commandSchema = {
  type: 'object',
  properties: {
    contextName: contextNameSchema,
    aggregateName: aggregateNameSchema,
    aggregateId: aggregateIdSchema,
    name: nameSchema,
    data: dataSchema,
  },
  required: ['contextName', 'aggregateName', 'aggregateId', 'name', 'data'],
  additionalProperties: false,
}

const commandWithMetadataSchema = {
  type: 'object',
  properties: {
    contextName: contextNameSchema,
    aggregateName: aggregateNameSchema,
    aggregateId: aggregateIdSchema,
    name: nameSchema,
    data: dataSchema,
    metadata: metadataSchema,
  },
  required: ['contextName', 'aggregateName', 'aggregateId', 'name', 'data'],
  additionalProperties: false,
}

const ajv = new Ajv()
const validateCommand = ajv.compile(commandSchema)
const validateCommandWithMetadata = ajv.compile(commandWithMetadataSchema)

export const createCommandsEndpoint = (
  firebaseApp: firebase.app.App,
  appDefinition: AppDefinition,
): functions.HttpsFunction => {
  const app = createApp(firebaseApp, appDefinition)

  const server = express()
  server.set('trust proxy', true)
  server.use(cors({ origin: true }))
  server.use(auth(firebaseApp))

  server.post('/', async (req, res) => {
    try {
      const isCommandValid =
        req.userId === 'system'
          ? await validateCommandWithMetadata(req.body)
          : await validateCommand(req.body)

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
          causationId: req.body.metadata?.causationId || null,
          correlationId: req.body.metadata?.correlationId || null,
          client: {
            userId: req.userId || null,
            ip: req.ip || null,
            ua: req.header('User-Agent') || null,
            location: parseLocationFromHeaders(req),
          },
        },
      }

      const { eventIds } = await app.dispatch(
        command.contextName,
        command.aggregateName,
        command.name,
        command.aggregateId,
        command.data,
        command.metadata,
      )

      res.status(201).send({ eventIds })
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

  return functions.https.onRequest(server)
}
