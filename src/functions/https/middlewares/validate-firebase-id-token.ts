import { RequestHandler } from 'express'
import firebase from 'firebase-admin'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

export const validateFirebaseIdToken = (
  firebaseApp: firebase.app.App,
): RequestHandler => {
  return async (req, res, next) => {
    // Testing?
    if (process.env.NODE_ENV === 'test') {
      req.userId = 'test'
      next()
      return
    }

    const authorization = req.header('Authorization')
    const [, idToken] = authorization?.split('Bearer ') ?? []
    if (!idToken) {
      console.log('Invalid authorization header:', authorization)
      res.status(403).send('Invalid authorization header')
      return
    }

    try {
      const decodedIdToken = await firebaseApp.auth().verifyIdToken(idToken)

      req.userId = decodedIdToken.uid
      next()
    } catch (error) {
      console.error('Error while verifying Firebase ID token:', error)
      res.status(403).send('Unauthorized')
    }
  }
}
