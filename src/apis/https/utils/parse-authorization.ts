import firebaseAdmin from 'firebase-admin'

export const parseAuthorization = async (
  firebaseAdminApp: firebaseAdmin.app.App,
  authorization: string | undefined,
): Promise<string | null> => {
  // Testing? Return fake user ID
  if (process.env.NODE_ENV === 'test') {
    return 'test'
  }

  const [, idToken] = authorization?.split('Bearer ') ?? []
  if (!idToken) {
    return null
  }

  try {
    const decodedIdToken = await firebaseAdminApp.auth().verifyIdToken(idToken)
    return decodedIdToken.uid
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error)
    return null
  }
}
