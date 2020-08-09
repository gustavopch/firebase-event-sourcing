import cors from 'cors'
import express from 'express'
import firebaseAdmin from 'firebase-admin'
import * as functions from 'firebase-functions'

import { DomainDefinition } from '../../application/domain-definition'
import { FlowsDefinition } from '../../application/flows-definition'
import { ViewsDefinition } from '../../application/views-definition'
import { Command } from '../../elements/command'
import { runProjections } from '../../logic/run-projections'
import { runReactions } from '../../logic/run-reactions'
import { createEventStore } from '../../stores/event-store'
import { validateFirebaseIdToken } from './middlewares/validate-firebase-id-token'
import { parseLocationFromHeaders } from './utils/parse-location-from-headers'

export const createCommandsEndpoint = (
  firebaseAdminApp: firebaseAdmin.app.App,
  domain: DomainDefinition,
  flows: FlowsDefinition,
  views: ViewsDefinition,
): functions.HttpsFunction => {
  const app = express()
  app.set('trust proxy', true)
  app.use(cors({ origin: true }))
  app.use(validateFirebaseIdToken(firebaseAdminApp))

  const eventStore = createEventStore(firebaseAdminApp)

  app.post('/', async (req, res) => {
    const {
      contextName,
      aggregateName,
      aggregateId,
      name: commandName,
      data: commandData,
    } = req.body as Command

    const aggregateDefinition = domain[contextName]?.[aggregateName]

    if (!aggregateDefinition) {
      const message = `Aggregate '${contextName}.${aggregateName}' not found`
      console.log(message)
      res.status(422).send(message)
      return
    }

    const commandDefinition = aggregateDefinition.commands[commandName]

    if (!commandDefinition) {
      const message = `Command handler for '${contextName}.${aggregateName}.${commandName}' not found`
      console.log(message)
      res.status(422).send(message)
      return
    }

    const isAuthorized = await commandDefinition.isAuthorized({
      contextName,
      aggregateName,
      aggregateId,
      name: commandName,
      data: commandData,
    })

    if (!isAuthorized) {
      const message = 'Unauthorized'
      console.log(message)
      res.status(403).send(message)
      return
    }

    const { name: eventName, data: eventData } = commandDefinition.handle({
      contextName,
      aggregateName,
      aggregateId,
      name: commandName,
      data: commandData,
    })

    const eventId = await eventStore.saveEvent({
      contextName,
      aggregateName,
      aggregateId,
      name: eventName,
      data: eventData,
      userId: req.userId,
      ip: req.ip,
      userAgent: req.header('User-Agent'),
      location: parseLocationFromHeaders(req),
    })
    const event = (await eventStore.getEvent(eventId))!
    console.log('Saved event:', event)

    const eventDefinition = aggregateDefinition.events[event.name]

    if (eventDefinition) {
      const snapshot = await eventStore.getSnapshot(aggregateId)
      const revision = snapshot?.revision ?? 0

      const state = await eventDefinition.handle(event)

      await eventStore.saveSnapshot({
        aggregateId,
        revision: revision + 1, // TODO: Increment within a transaction
        state,
      })
    }

    await runProjections(views, event)

    await runReactions(eventStore, flows, event)

    res.status(201).send({ eventId: event.id })
    return
  })

  return functions.https.onRequest(app)
}
