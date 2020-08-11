import { Request } from 'express'

import { Location } from '../../../elements/location'

export const parseLocationFromHeaders = (req: Request): Location => {
  let coordinates: { latitude: number; longitude: number } | null = null
  const latLongHeader = req.header('X-Appengine-CityLatLong')
  if (latLongHeader) {
    const [latitude, longitude] = latLongHeader.split(',').map(Number)
    coordinates = { latitude, longitude }
  }

  return {
    city: req.header('X-Appengine-City') || null,
    region: req.header('X-Appengine-Region') || null,
    country: req.header('X-Appengine-Country') || null,
    coordinates,
  }
}
