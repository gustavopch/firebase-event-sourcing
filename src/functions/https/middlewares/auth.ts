import { RequestHandler } from 'express'
import firebase from 'firebase-admin'
import * as functions from 'firebase-functions'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId: string
    }
  }
}

export const auth = (firebaseApp: firebase.app.App): RequestHandler => {
  return async (req, res, next) => {
    // Testing?
    if (process.env.NODE_ENV === 'test') {
      req.userId = 'test'
      next()
      return
    }

    const authorization = req.header('Authorization')
    if (!authorization) {
      console.log("Missing the 'Authorization' header")
      res.status(403).send('Unauthorized')
      return
    }

    if (authorization.startsWith('ApiKey ')) {
      const { apiKey } = functions.config()
      if (!apiKey) {
        console.warn("Missing the 'apiKey' environment configuration")
        res.status(403).send('Unauthorized')
        return
      }

      const [, incomingApiKey] = authorization.split('ApiKey ')
      if (incomingApiKey !== apiKey) {
        console.log(`Wrong API key: ${incomingApiKey}`)
        res.status(403).send('Unauthorized')
        return
      }

      req.userId = 'system'
      next()
      return
    }

    if (authorization.startsWith('Bearer ')) {
      try {
        const [, incomingIdToken] = authorization.split('Bearer ')
        const decodedIdToken = await firebaseApp
          .auth()
          .verifyIdToken(incomingIdToken)
        req.userId = decodedIdToken.uid
        next()
        return
      } catch (error) {
        console.log(`Couldn't verify the Firebase ID token: ${error}`)
        res.status(403).send('Unauthorized')
        return
      }
    }

    console.log(`Unexpected 'Authorization' header: ${authorization}`)
    res.status(403).send('Unauthorized')
    return
  }
}
