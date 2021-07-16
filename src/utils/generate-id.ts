// Adapted from: https://github.com/invertase/react-native-firebase/blob/6783245e19f81297363fc56a53063c8a053782b8/packages/app/lib/common/id.js
export const generateId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let autoId = ''
  for (let i = 0; i < 20; i++) {
    autoId += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return autoId
}
