import { Request } from 'express'

import { Location } from '../../../elements/location'

export const parseLocationFromHeaders = (req: Request): Location | null => {
  const city = req.header('X-Appengine-City') || null
  const region = req.header('X-Appengine-Region') || null
  const country = req.header('X-Appengine-Country') || null

  let coordinates: { latitude: number; longitude: number } | null = null
  const latLongHeader = req.header('X-Appengine-CityLatLong')
  if (latLongHeader) {
    const [latitude, longitude] = latLongHeader.split(',').map(Number)
    coordinates = { latitude, longitude }
  }

  if (!city && !region && !country && !coordinates) {
    return null
  }

  return {
    city,
    region,
    country,
    coordinates,
  }
}
