import { AggregatesService } from '../services/aggregates'
import { LoggerService } from '../services/logger'

export interface Context {
  aggregates: AggregatesService
  logger: LoggerService
}
