import { Request } from 'express'

import { Location } from '../../../elements/location'

export const parseLocationFromHeaders = (req: Request): Location => {
  let latitude: number | null = null
  let longitude: number | null = null

  const latLongHeader = req.header('X-Appengine-CityLatLong')
  if (latLongHeader) {
    const coordinates = latLongHeader.split(',').map(Number)
    latitude = coordinates[0]
    longitude = coordinates[1]
  }

  return {
    city: req.header('X-Appengine-City') || null,
    region: req.header('X-Appengine-Region') || null,
    country: req.header('X-Appengine-Country') || null,
    latitude,
    longitude,
  }
}
