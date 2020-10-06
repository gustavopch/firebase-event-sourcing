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

export const auth = (firebaseApp: firebase.app.App): RequestHandler => {
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
      console.log("Missing the 'Authorization' header:", authorization)
      res.status(403).send('Unauthorized')
      return
    }

    try {
      const decodedIdToken = await firebaseApp.auth().verifyIdToken(idToken)

      req.userId = decodedIdToken.uid
      next()
    } catch (error) {
      console.log("Couldn't verify the Firebase ID token:", error)
      res.status(403).send('Unauthorized')
    }
  }
}
