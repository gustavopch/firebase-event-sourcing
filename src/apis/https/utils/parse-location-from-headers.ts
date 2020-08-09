import { Request } from 'express'

import { Location } from '../../../elements/location'

export const parseLocationFromHeaders = (req: Request): Location => {
  const [latitude, longitude] = (req.header('X-Appengine-CityLatLong') || '0,0')
    .split(',')
    .map(Number)

  return {
    city: String(req.header('X-Appengine-City')),
    region: String(req.header('X-Appengine-Region')),
    country: String(req.header('X-Appengine-Country')),
    latitude,
    longitude,
  }
}
