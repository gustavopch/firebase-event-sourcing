import firebaseAdmin from 'firebase-admin'
import * as functions from 'firebase-functions'

import { DomainDefinition } from '../../application/definitions/domain-definition'
import { FlowsDefinition } from '../../application/definitions/flows-definition'
import { ViewsDefinition } from '../../application/definitions/views-definition'
import { Command } from '../../elements/command'
import { createFlowManager } from '../../services/flow-manager'
import { createEventStore } from '../../stores/event-store'
import { createJobStore } from '../../stores/job-store'
import { parseAuthorization } from './utils/parse-authorization'

export const createCommandsEndpoint = (
  firebaseAdminApp: firebaseAdmin.app.App,
  domain: DomainDefinition,
  flows: FlowsDefinition,
  views: ViewsDefinition,
): functions.HttpsFunction => {
  const eventStore = createEventStore(firebaseAdminApp)
  const jobStore = createJobStore(firebaseAdminApp)

  return functions.https.onRequest(async (req, res) => {
    if (!/^POST$/i.test(req.method)) {
      const message = `Method '${req.method}' not allowed`
      console.log(message)
      res.status(405).send(message)
      return
    }

    const userId = await parseAuthorization(
      firebaseAdminApp,
      req.header('Authorization'),
    )

    if (!userId) {
      const message = 'Unauthorized'
      console.log(message)
      res.status(403).send(message)
      return
    }

    const {
      aggregateName: fullyQualifiedAggregateName,
      aggregateId,
      name: commandName,
      data: commandData,
    } = req.body as Command

    const [contextName, aggregateName] = fullyQualifiedAggregateName.split('.')

    const handleCommand =
      domain[contextName]?.[aggregateName]?.commands?.[commandName]

    if (!handleCommand) {
      const message = `Command handler for '${aggregateName}.${commandName}' not found`
      console.log(message)
      res.status(422).send(message)
      return
    }

    const { name: eventName, data: eventData } = handleCommand(commandData)

    const [latitude, longitude] = (
      req.header('X-Appengine-CityLatLong') || '0,0'
    )
      .split(',')
      .map(Number)

    const eventId = await eventStore.saveNewEvent({
      aggregateName: `${contextName}.${aggregateName}`,
      aggregateId,
      name: eventName,
      data: eventData,
      userId,
      ip: req.ip,
      userAgent: req.header('User-Agent'),
      location: {
        city: String(req.header('X-Appengine-City')),
        region: String(req.header('X-Appengine-Region')),
        country: String(req.header('X-Appengine-Country')),
        latitude,
        longitude,
      },
    })
    const event = (await eventStore.getEvent(eventId))!
    console.log('Saved new event:', event)

    await Promise.all(
      Object.entries(views).reduce((promises, [viewName, view]) => {
        const projectionEntries = Object.entries(view.projections)
        for (const [eventName, handler] of projectionEntries) {
          if (eventName === event.name) {
            promises.push(
              handler(event)
                .then(() => {
                  console.log(`Ran projection in '${viewName}'`)
                })
                .catch(error => {
                  console.error(
                    `Failed to run projection in '${viewName}'`,
                    error,
                  )
                }),
            )
          }
        }

        return promises
      }, [] as Array<Promise<void>>),
    )

    const flowManager = createFlowManager(eventStore, jobStore, event)

    await Promise.all(
      Object.entries(flows).reduce((promises, [flowName, flow]) => {
        const reactionEntries = Object.entries(flow.reactions ?? {})
        for (const [eventName, handler] of reactionEntries) {
          if (eventName === event.name) {
            promises.push(
              handler(flowManager, event)
                .then(() => {
                  console.log(`Ran reaction in '${flowName}'`)
                })
                .catch(error => {
                  console.error(
                    `Failed to run reaction in '${flowName}'`,
                    error,
                  )
                }),
            )
          }
        }

        return promises
      }, [] as Array<Promise<void>>),
    )

    res.status(201).send({ eventId: event.id })
    return
  })
}
