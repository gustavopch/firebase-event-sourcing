import { AggregatesService } from '../services/aggregates-service'
import { LoggerService } from '../services/logger-service'

export interface Context {
  aggregates: AggregatesService
  logger: LoggerService
}
